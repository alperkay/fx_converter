<template>
  <div id="app" class="app">
    <Header class="app__header" />
    <section class="app__actionable-section">
      <DateInput
        class="app__date-input"
        data-cy="date-input"
        v-model="date"
        @input="onDateChange"
        min="1999-01-04"
        :max="today"
      />
      <div class="app__currencies-container">
        <div
          class="app__currencies-item"
          v-for="(item, index) in currencyData"
          :key="item.currency"
        >
          <div class="app__item-inner-container">
            <CurrencyInput
              v-model.number="item.value"
              @input="onValueInput(item)"
              :isLoading="false"
            />
            <CurrencySelect
              data-cy="base-select"
              :currencies="availableCurrencies(item.currency)"
              v-model="item.currency"
              @input="onSelectedCurrencyChange(item)"
            />
            <div
              @click="deleteCurrency(item.currency)"
              v-if="currencyData.length > 1"
              class="app__item-delete"
            >
              &#10060;
            </div>
            <div v-else class="app__item-delete"></div>
          </div>
          <div class="app__item-equal-sign">
            <h1 v-if="index !== currencyData.length - 1">
              =
            </h1>
            <div v-else></div>
          </div>
        </div>
      </div>
      <div
        class="app__button"
        v-if="unusedCurrencies.length"
        @click="addCurrency"
      >
        &#10133; Add Currency
      </div>
      <div v-if="!isLoading" class="app__historical">
        <div>
          <div class="app__button" @click="setChartVisible(!isChartVisible)">
            <span>&#x1f4c8;</span>Show Historical Data
          </div>
          <DateInput
            v-if="isChartVisible"
            v-model="startDate"
            @input="updateHistoricalData"
            class="app__start-date"
            min="1999-01-04"
            :max="previousDay"
          />
        </div>
        <Chart
          v-if="isChartVisible && historicalData"
          :historicalData="historicalData"
        />
      </div>
    </section>

    <Footer
      class="app__footer"
      :errors="errors"
      :isLoading="isLoading"
      :message="message"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import DateInput from "./components/DateInput.vue";
import CurrencyInput from "./components/CurrencyInput.vue";
import CurrencySelect from "./components/CurrencySelect.vue";
import Chart from "./components/Chart.vue";

import { Constants } from "./utils/constants";
import {
  CurrencyRequest,
  CurrencyResponse,
  HistoricalRequest,
  HistoricalResponse
} from "./api-services/currencies/currency-contracts";
import {
  getExchangeRatesForSingleDate,
  getHistoricalRates
} from "./api-services/currencies/currency-service";
import { formatDate } from "./utils/date-utils";

interface CurrencyInterface {
  currency: string;
  exchangeRate: number | null;
  value: number | null;
}

interface AppData {
  date: string | null;
  startDate: string | null;
  currencyData: CurrencyInterface[];
  lastChangedCurrency: string;
  isLoading: boolean;
  errors: string[];
  message: string | null;
  historicalData: HistoricalResponse | null;
  isChartVisible: boolean;
}

export default Vue.extend({
  name: "App",
  components: {
    Header,
    Footer,
    DateInput,
    CurrencyInput,
    CurrencySelect,
    Chart
  },
  data() {
    return {
      date: null,
      startDate: null,
      currencyData: [
        { currency: "EUR", exchangeRate: 1, value: 1 },
        { currency: "USD", exchangeRate: null, value: null }
      ],
      lastChangedCurrency: "EUR",
      isLoading: false,
      errors: [],
      message: null,
      historicalData: null,
      isChartVisible: false
    } as AppData;
  },
  async mounted() {
    await this.updateData(this.currencyData[0]);
  },
  methods: {
    async onDateChange() {
      const lastChangedCurrency = this.currencyData.find(
        item => item.currency === this.lastChangedCurrency
      ) as CurrencyInterface;
      await this.updateData(lastChangedCurrency);
      if (this.historicalData) {
        await this.updateHistoricalData();
      }
    },
    async onStartDateChange() {
      await this.updateHistoricalData();
    },
    availableCurrencies(currentSelectedCurrency: string): string[] {
      const otherSelected = this.currencyData
        .filter(item => item.currency !== currentSelectedCurrency)
        .map(item => item.currency);
      return Constants.CURRENCIES.filter(
        currency => !otherSelected.includes(currency)
      );
    },
    async addCurrency() {
      if (!this.unusedCurrencies) {
        return;
      }
      const newCurrency = {
        currency: this.unusedCurrencies[0],
        exchangeRate: null,
        value: null
      };
      this.currencyData.push(newCurrency);

      const lastChangedCurrency = this.currencyData.find(
        item => item.currency === this.lastChangedCurrency
      ) as CurrencyInterface;

      await this.updateData(lastChangedCurrency);
      if (this.historicalData) {
        await this.updateHistoricalData();
      }
    },
    deleteCurrency(currency: string) {
      this.currencyData = this.currencyData.filter(
        item => item.currency !== currency
      );
    },
    async updateData(changedCurrency: CurrencyInterface) {
      this.setLoading(true);
      this.setMessage(null);

      if (this.hasServerError) {
        this.removeServerError();
      }

      try {
        const targets: string[] = this.currencyData
          .map(item => item.currency)
          .filter(item => item !== changedCurrency.currency);

        const requestBody: CurrencyRequest = {
          base: changedCurrency.currency,
          targets,
          date: this.date ? this.date : undefined
        };

        const response: CurrencyResponse = await getExchangeRatesForSingleDate(
          requestBody
        );

        if (!response || !response.rates || !response.date) {
          throw new Error();
        }

        if (requestBody.date && response.date !== requestBody.date) {
          this.setHolidayMessage();
        }

        this.date = response.date;

        targets.forEach((target: string) => {
          const matchingItem = this.currencyData.find(
            item => item.currency === target
          ) as CurrencyInterface;
          matchingItem.exchangeRate = response.rates[target];
          matchingItem.value = Number(
            (
              (changedCurrency.value as number) * matchingItem.exchangeRate
            ).toFixed(4)
          );
        });

        changedCurrency.exchangeRate = 1;
      } catch (error) {
        this.setServerError();
        this.clearRates();
        this.clearValues(this.currencyData);
      } finally {
        this.setLoading(false);
      }
    },
    async onValueInput(changedCurrency: CurrencyInterface) {
      this.lastChangedCurrency = changedCurrency.currency;

      if (this.isInvalidInput(changedCurrency.value)) {
        this.setInvalidInputError();
        this.clearValues(
          this.currencyData.filter(
            item => item.currency !== changedCurrency.currency
          )
        );
        return;
      }

      this.removeInvalidInputError();

      if (this.hasServerError) {
        await this.updateData(changedCurrency);
        await this.updateHistoricalData();
      } else {
        this.currencyData.forEach(item => {
          if (item.currency !== changedCurrency.currency) {
            item.value = Number(
              (
                ((changedCurrency.value as number) *
                  (item.exchangeRate as number)) /
                (changedCurrency.exchangeRate as number)
              ).toFixed(4)
            );
          }
        });
      }
    },
    async onSelectedCurrencyChange(changedCurrency: CurrencyInterface) {
      this.lastChangedCurrency = changedCurrency.currency;
      await this.updateData(changedCurrency);
      if (this.historicalData) {
        await this.updateHistoricalData();
      }
    },
    setLoading(payload: boolean) {
      this.isLoading = payload;
    },
    setServerError() {
      if (this.errors.includes(Constants.ERRORS.SERVER)) {
        return;
      }
      this.errors.push(Constants.ERRORS.SERVER);
    },
    removeServerError() {
      this.errors = this.errors.filter(err => err !== Constants.ERRORS.SERVER);
    },
    setInvalidInputError() {
      if (this.errors.includes(Constants.ERRORS.INVALID_INPUT)) {
        return;
      }
      this.errors.push(Constants.ERRORS.INVALID_INPUT);
    },
    removeInvalidInputError() {
      this.errors = this.errors.filter(
        err => err !== Constants.ERRORS.INVALID_INPUT
      );
    },
    clearRates() {
      this.currencyData.forEach(item => {
        item.exchangeRate = null;
      });
    },
    clearValues(list: CurrencyInterface[]) {
      list.forEach(item => {
        item.value = null;
      });
    },
    clearRatesAndValues() {
      this.clearRates();
      this.clearValues(this.currencyData);
    },
    setMessage(payload: string | null) {
      this.message = payload;
    },
    setHolidayMessage() {
      this.setMessage(Constants.MESSAGES.HOLIDAY);
    },
    isInvalidInput(value: unknown) {
      return !value || typeof value !== "number";
    },
    setChartVisible(payload: boolean) {
      this.isChartVisible = payload;
    },
    async updateHistoricalData() {
      this.historicalData = null;

      if (!this.date || !this.startDate) {
        return;
      }
      this.setLoading(true);

      try {
        const requestBody: HistoricalRequest = {
          base: this.currencyData[0].currency,
          targets: this.currencyData
            .map(item => item.currency)
            .filter(item => item !== this.currencyData[0].currency),
          dateEnd: this.date,
          dateStart: this.startDate
        };

        const response = await getHistoricalRates(requestBody);

        if (!response) {
          throw new Error();
        }

        this.setHistoricalData(response);
      } catch (error) {
        this.setServerError();
      } finally {
        this.setLoading(false);
      }
    },
    setHistoricalData(payload: HistoricalResponse | null) {
      this.historicalData = payload;
    }
  },
  computed: {
    unusedCurrencies(): string[] {
      const selectedCurrencies = this.currencyData.map(cur => cur.currency);
      const availableCurrencies = Constants.CURRENCIES.filter(
        cur => !selectedCurrencies.includes(cur)
      );
      return availableCurrencies;
    },
    hasServerError(): boolean {
      return this.errors.includes(Constants.ERRORS.SERVER);
    },
    today(): string {
      return formatDate(new Date());
    },
    previousDay(): string {
      const date = new Date(this.date as string);
      date.setDate(date.getDate() - 1);
      return formatDate(date);
    }
  }
});
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Montserrat");

html,
body {
  font-family: "Montserrat", sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

input,
select {
  font-family: inherit;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.app {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  padding: 0 10px;

  &__header {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  &__actionable-section {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__currencies-container {
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
    align-items: center;
    margin-top: 1rem;
    max-width: 320px;
    width: 100%;
  }

  &__currencies-item {
    width: 50%;
    max-width: 250px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    position: relative;
    padding-bottom: 8px;
  }

  &__item-inner-container {
    cursor: pointer;
    &:hover {
      background-color: rgb(243, 237, 237);
    }
    &:hover .app__item-delete {
      opacity: 1;
    }
  }

  &__item-delete {
    opacity: 0;
    height: 26px;
  }

  &__item-equal-sign {
    margin-top: -25px;
  }

  &__button {
    width: 185px;
    font-size: 0.7rem;
    cursor: pointer;
    border: 1px solid black;
    border-radius: 4px;
    padding: 3px 5px;
    &:hover {
      background-color: rgb(243, 237, 237);
    }
  }

  &__historical {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  &__start-date {
    margin-top: 10px;
  }

  &__footer {
    margin-top: 1rem;
  }
}
</style>
