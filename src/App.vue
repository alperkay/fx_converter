<template>
  <div id="app" class="app">
    <Header class="app__header" />
    <section class="app__actionable-section">
      <DateInput
        class="app__date-input"
        data-cy="date-input"
        v-model="date"
        @input="onDateChange"
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
              @input="onSelectedCurrencyChange"
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
        class="app__add-button"
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
      isLoading: false,
      errors: [],
      message: null
    } as AppData;
  },
  async mounted() {
    await this.updateData();
  },
  methods: {
    async updateData() {
      this.setLoading(true);
      this.setMessage(null);

      if (this.hasServerError) {
        this.removeServerError();
      }

      try {
        const targets: string[] = this.currencyData
          .slice(1)
          .map(item => item.currency);

        const requestBody: CurrencyRequest = {
          base: this.currencyData[0].currency,
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
            (this.currencyData[0].value as number) * matchingItem.exchangeRate;
        });

        this.currencyData[0].exchangeRate = 1;
      } catch (error) {
        this.setServerError();
        this.clearRates();
        this.clearValues(this.currencyData);
      } finally {
        this.setLoading(false);
      }
    },
    async onDateChange() {
      await this.updateData();
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

      await this.updateData();
    },
    deleteCurrency(currency: string) {
      this.currencyData = this.currencyData.filter(
        item => item.currency !== currency
      );
    },
    async onValueInput(changedCurrency: CurrencyInterface) {
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
        await this.updateData();
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
    async onSelectedCurrencyChange() {
      await this.updateData();
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
    availableCurrencies(currentSelectedCurrency: string): string[] {
      const otherSelected = this.currencyData
        .filter(item => item.currency !== currentSelectedCurrency)
        .map(item => item.currency);
      return Constants.CURRENCIES.filter(
        currency => !otherSelected.includes(currency)
      );
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
    margin-bottom: 3rem;
  }

  &__actionable-section {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__date-input {
    width: 150px;
  }
  &__currencies-container {
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
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
    padding-bottom: 15px;
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

  &__add-button {
    cursor: pointer;
    border: 1px solid black;
    border-radius: 4px;
    padding: 6px 10px;
    &:hover {
      background-color: rgb(243, 237, 237);
    }
  }

  &__footer {
    margin-top: 1rem;
  }
}
</style>
