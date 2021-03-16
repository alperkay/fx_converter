export const Constants = {
  BASE_API_URL: "https://api.exchangeratesapi.io/",
  BASE_DATE: "latest",
  CURRENCIES: [
    "EUR",
    "AUD",
    "BGN",
    "BRL",
    "CAD",
    "CHF",
    "CNY",
    "CZK",
    "DKK",
    "GBP",
    "HKD",
    "HRK",
    "HUF",
    "IDR",
    "ILS",
    "INR",
    "ISK",
    "JPY",
    "KRW",
    "MXN",
    "MYR",
    "NOK",
    "NZD",
    "PHP",
    "PLN",
    "RON",
    "RUB",
    "SEK",
    "SGD",
    "THB",
    "TRY",
    "USD",
    "ZAR"
  ],
  ERRORS: {
    SERVER: "Something went wrong. Please try again later.",
    INVALID_INPUT: "Please make sure to enter a valid number."
  },
  MESSAGES: {
    HOLIDAY:
      "Selected date is a public holiday or weekend. Therefore, the rate for the previous weekday is returned."
  }
};
