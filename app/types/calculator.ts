export interface Tier {
  min: number;
  max: number | null;
  exempt: number;
  rate: number;
}

export interface CalculationRequest {
  principal: number;
  days: number;
  withholdingTax: number;
  usdStartRate: number;
  usdEndRate: number;
  tiers: Tier[];
}

export interface DailyResult {
  day: number;
  month: number;
  balance: number;
  grossInterest: number;
  netInterest: number;
  exemption: number;
}

export interface TierSummary {
  min: number;
  max: number | null;
  rate: number;
  daysPassed: number;
  interestEarned: number;
}

export interface CalculationResponse {
  totalBalance: number;
  totalNetProfit: number;
  usdInitial: number;
  usdFinalValue: number;
  usdProfitLoss: number;
  tierSummary: TierSummary[];
}
