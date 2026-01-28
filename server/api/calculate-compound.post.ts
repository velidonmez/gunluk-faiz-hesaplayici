import { z } from "zod";
import {
  CalculationRequest,
  CalculationResponse,
  TierSummary,
} from "../../app/types/calculator";

const tierSchema = z.object({
  min: z.number().min(0),
  max: z.number().nullable(),
  exempt: z.number().min(0),
  rate: z.number().min(0),
});

const requestSchema = z.object({
  principal: z.number().positive(),
  days: z.number().int().positive(),
  withholdingTax: z.number().min(0).max(100),
  usdStartRate: z.number().positive(),
  usdEndRate: z.number().positive(),
  tiers: z.array(tierSchema),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validation = requestSchema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input data",
      data: validation.error.format(),
    });
  }

  const { principal, days, withholdingTax, usdStartRate, usdEndRate, tiers } =
    validation.data;

  let totalBalance = principal;

  // Track tier usage
  const tierStats = new Map<string, TierSummary>();

  // Calculate start USD
  const usdInitial = principal / usdStartRate;

  for (let day = 1; day <= days; day++) {
    // 1. Find Current Tier
    const tier = tiers.find(
      (t) => totalBalance >= t.min && (t.max === null || totalBalance <= t.max),
    );

    const currentExemption = tier ? tier.exempt : 0;
    const currentRate = tier ? tier.rate : 0;

    // 2. Interest Base (Matrah)
    const matrah = Math.max(0, totalBalance - currentExemption);

    // 3. Gross Daily
    const dailyGrossInterest = (matrah * currentRate) / 365;

    // 4. Net Daily (after tax)
    const dailyNetInterest = dailyGrossInterest * (1 - withholdingTax);

    // 5. Update Balance
    totalBalance += dailyNetInterest;

    // Track Stats
    const tierKey = tier
      ? `${tier.min}-${tier.max || "inf"}-${tier.rate}`
      : "fallback";
    const existing = tierStats.get(tierKey) || {
      min: tier?.min ?? 0,
      max: tier?.max ?? null,
      rate: currentRate,
      daysPassed: 0,
      interestEarned: 0,
    };

    existing.daysPassed += 1;
    existing.interestEarned += dailyNetInterest;
    tierStats.set(tierKey, existing);
  }

  const totalNetProfit = totalBalance - principal;
  const usdFinalValue = totalBalance / usdEndRate;
  const usdProfitLoss = usdFinalValue - usdInitial;

  return {
    totalBalance: Number(totalBalance.toFixed(2)),
    totalNetProfit: Number(totalNetProfit.toFixed(2)),
    usdInitial: Number(usdInitial.toFixed(2)),
    usdFinalValue: Number(usdFinalValue.toFixed(2)),
    usdProfitLoss: Number(usdProfitLoss.toFixed(2)),
    tierSummary: Array.from(tierStats.values()),
  } as CalculationResponse;
});
