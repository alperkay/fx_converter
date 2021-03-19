import {
  CurrencyRequest,
  HistoricalRequest,
  CurrencyResponse
} from "./currency-contracts";
import { Constants } from "../../utils/constants";

/**
 * Fetches the rate(s) for given base
 * and target(s) currencies on a specified date.
 * If date is not passed, latest available
 * rate is returned.
 */
export const getExchangeRatesForSingleDate = async ({
  base,
  targets,
  date
}: CurrencyRequest): Promise<CurrencyResponse> => {
  const dateParam = date ? date : Constants.BASE_DATE;

  return await fetch(
    `${Constants.BASE_API_URL}${dateParam}?base=${base}&symbols=${targets.join(
      ","
    )}`
  )
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    });
};

export const getHistoricalRates = async ({
  base,
  targets,
  dateStart,
  dateEnd
}: HistoricalRequest) => {
  return await fetch(
    `${
      Constants.BASE_API_URL
    }history?start_at=${dateStart}&end_at=${dateEnd}&base=${base}&symbols=${targets.join(
      ","
    )}`
  )
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    });
};
