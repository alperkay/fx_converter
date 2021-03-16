export interface CurrencyRequest {
  base: string;
  targets: string[];
  date?: string;
}

export interface CurrencyResponse {
  base: string;
  date: string;
  rates: { [key: string]: number };
}
