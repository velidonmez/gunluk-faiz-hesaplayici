import type {
  TwelveDataValue,
  TwelveDataResponse,
  RateResult,
} from "../../app/types/rates";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiKey = config.twelveDataApiKey as string;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "API Key is missing",
    });
  }

  // Use storage to cache the result for the day
  const storage = useStorage("cache");
  const cacheKey = `usd_try_rates_v2_${new Date().toISOString().split("T")[0]}`;

  const cachedData = await storage.getItem<RateResult>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await $fetch<TwelveDataResponse>(
      `https://api.twelvedata.com/time_series/cross?base=USD&quote=TRY&interval=1day&outputsize=90&apikey=${apiKey}`,
    );

    if (response.status === "error") {
      throw createError({
        statusCode: 400,
        statusMessage: response.message || "TwelveData API Error",
      });
    }

    const values = response.values;
    if (!values || values.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No data found from API",
      });
    }

    const firstValue = values[0];
    if (!firstValue) {
      throw createError({
        statusCode: 404,
        statusMessage: "Latest rate data is missing",
      });
    }

    const latestPrice = parseFloat(firstValue.close);

    // Calculate average daily change in whole data (90 days)
    const firstHistorical = values[values.length - 1];
    if (!firstHistorical) {
      throw createError({
        statusCode: 404,
        statusMessage: "Historical data is missing",
      });
    }
    const originalPrice = parseFloat(firstHistorical.close);
    const totalChange = latestPrice - originalPrice;
    const avgDailyChange = totalChange / values.length;

    // Default project 30 days ahead for "suggested" target
    const targetPrice = latestPrice + avgDailyChange * 30;

    const result: RateResult = {
      currentPrice: Number(latestPrice.toFixed(4)),
      avgDailyChange: avgDailyChange,
      suggestedTargetPrice: Number(targetPrice.toFixed(4)),
      lastUpdate: firstValue.datetime,
      history: values.map((v: TwelveDataValue) => ({
        date: v.datetime,
        price: parseFloat(v.close),
      })),
    };

    // Cache for 24 hours (or until end of day)
    await storage.setItem(cacheKey, result);

    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to fetch currency data",
    });
  }
});
