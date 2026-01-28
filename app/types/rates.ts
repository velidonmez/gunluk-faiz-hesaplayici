export interface TwelveDataValue {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface TwelveDataResponse {
  status?: string;
  message?: string;
  values?: TwelveDataValue[];
  meta?: any;
}

export interface RateHistory {
  date: string;
  price: number;
}

export interface RateResult {
  currentPrice: number;
  avgDailyChange: number;
  suggestedTargetPrice: number;
  lastUpdate: string;
  history: RateHistory[];
}
