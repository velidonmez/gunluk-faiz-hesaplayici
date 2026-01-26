import type {
  CalculationRequest,
  CalculationResponse,
  Tier,
} from "~/types/calculator";

export const useCompoundCalculator = () => {
  const loading = ref(false);
  const result = ref<CalculationResponse | null>(null);

  const defaultTiers: Tier[] = [
    { min: 20000, max: 250000, rate: 0.44, exempt: 20000 },
    { min: 250001, max: 500000, rate: 0.44, exempt: 40000 },
    { min: 500001, max: 1000000, rate: 0.44, exempt: 75000 },
    { min: 1000001, max: 1500000, rate: 0.44, exempt: 150000 },
    { min: 1500001, max: 2000000, rate: 0.44, exempt: 175000 },
    { min: 2000001, max: 3000000, rate: 0.44, exempt: 250000 },
    { min: 3000001, max: 4000000, rate: 0.44, exempt: 350000 },
    { min: 4000001, max: 5000000, rate: 0.44, exempt: 450000 },
    { min: 5000001, max: 7500000, rate: 0.43, exempt: 600000 },
    { min: 7500001, max: 10000000, rate: 0.43, exempt: 900000 },
    { min: 10000001, max: 15000000, rate: 0.43, exempt: 1500000 },
    { min: 15000001, max: null, rate: 0.41, exempt: 2500000 },
  ];

  const calculate = async (params: CalculationRequest) => {
    loading.value = true;
    try {
      const data = await $fetch<CalculationResponse>(
        "/api/calculate-compound",
        {
          method: "POST",
          body: params,
        },
      );
      result.value = data;
      return data;
    } catch (error) {
      console.error("Calculation failed:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    result,
    defaultTiers,
    calculate,
  };
};
