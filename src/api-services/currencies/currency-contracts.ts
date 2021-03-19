export interface CurrencyRequest {
  base: string;
  targets: string[];
  date?: string;
}
export interface HistoricalRequest {
  base: string;
  targets: string[];
  dateStart: string;
  dateEnd: string;
}

export interface CurrencyResponse {
  base: string;
  date: string;
  rates: { [key: string]: number };
}

export interface HistoricalResponse {
  base: string;
  end_at: string;
  start_at: string;
  rates: { [key: string]: { [key: string]: number } };
}
