<template>
  <div id="app" class="app">
    <Header class="app__header" />
    <section class="app__actionable-section">
      <DateInput
        class="actionable-section__date-input"
        data-cy="date-input"
        v-model="date"
        @input="onDateChange"
      />
      <div class="actionable-section__currencies-container">
        <div
          class="currencies-container__item"
          v-for="(item, index) in currencyData"
          :key="item.currency"
        >
          <div class="item__inner-container">
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
              v-if="![0, 1].includes(index)"
              class="inner-container__delete"
            >
              &#10060;
            </div>
            <div v-else class="inner-container__delete"></div>
          </div>
          <div class="item__equal-sign">
            <h1 v-if="index !== currencyData.length - 1">
              =
            </h1>
            <div v-else></div>
          </div>
        </div>
      </div>
      <div
        class="actionable-section__add-button"
        v-if="unusedCurrencies.length"
        @click="addCurrency"
      >
        &#10133; Add Currency
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

import { Constants } from "./utils/constants";
import {
  CurrencyRequest,
  CurrencyResponse
} from "./api-services/currencies/currency-contracts";
import { getExchangeRatesForSingleDate } from "./api-services/currencies/currency-service";

interface CurrencyInterface {
  currency: string;
  exchangeRate: number | null;
  value: number | null;
}

interface AppData {
  date: string | null;
  currencyData: CurrencyInterface[];
  lastChangedCurrency: string;
  isLoading: boolean;
  errors: string[];
  message: string | null;
}

export default Vue.extend({
  name: "App",
  components: { Header, Footer, DateInput, CurrencyInput, CurrencySelect },
  data() {
    return {
      date: null,
      currencyData: [
        { currency: "EUR", exchangeRate: 1, value: 1 },
        { currency: "USD", exchangeRate: null, value: null }
      ],
      lastChangedCurrency: "EUR",
      isLoading: false,
      errors: [],
      message: null
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
          matchingItem.value =
            (changedCurrency.value as number) * matchingItem.exchangeRate;
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
      } else {
        this.currencyData.forEach(item => {
          if (item.currency !== changedCurrency.currency) {
            item.value =
              ((changedCurrency.value as number) *
                (item.exchangeRate as number)) /
              (changedCurrency.exchangeRate as number);
          }
        });
      }
    },
    async onSelectedCurrencyChange(changedCurrency: CurrencyInterface) {
      this.lastChangedCurrency = changedCurrency.currency;
      await this.updateData(changedCurrency);
    },
    setLoading(payload: boolean) {
      this.isLoading = payload;
    },
    setServerError() {
      this.errors.push(Constants.ERRORS.SERVER);
      this.errors = [...new Set(this.errors)];
    },
    removeServerError() {
      this.errors = this.errors.filter(err => err !== Constants.ERRORS.SERVER);
    },
    setInvalidInputError() {
      this.errors.push(Constants.ERRORS.INVALID_INPUT);
      this.errors = [...new Set(this.errors)];
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
  position: fixed;
  overflow: hidden;
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
    margin-bottom: 4rem;
  }

  &__actionable-section {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

    .actionable-section {
      &__date-input {
        width: 210px;
      }
      &__currencies-container {
        -webkit-overflow-scrolling: touch;
        display: flex;
        flex-wrap: nowrap;
        overflow-x: scroll;
        align-items: center;
        margin: 30px 0;
        padding: 0 10px;
        max-width: 400px;
        width: auto;
        .currencies-container {
          &__item {
            width: 200px;
            height: 140px;
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            .item__inner-container {
              padding: 10px 0;
              cursor: pointer;
              &:hover {
                background-color: rgb(243, 237, 237);
              }
              &:hover .inner-container__delete {
                opacity: 1;
              }
              .inner-container__delete {
                opacity: 0;
                height: 26px;
              }
            }
            .item {
              &__equal-sign {
                margin: 0 10px;
              }
            }
          }
        }
      }
      &__add-button {
        cursor: pointer;
        border: 1px solid black;
        border-radius: 4px;
        padding: 6px 10px;
        &:hover {
          background-color: rgb(243, 237, 237);
        }
      }
    }
  }

  &__footer {
    margin-top: 1rem;
  }
}
</style>
