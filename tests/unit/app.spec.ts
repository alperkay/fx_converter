import { createLocalVue, shallowMount, Wrapper } from "@vue/test-utils";
import App from "@/App.vue";
import Vue from "vue";
import { Constants } from "@/utils/constants";

describe("App.vue", () => {
  let localVue: typeof Vue;
  let wrapper: {
    vm: {
      currencyData: Function;
      addCurrency: Function;
      deleteCurrency: Function;
      onValueInput: Function;
      setServerError: Function;
      lastChangedCurrency: string;
      unusedCurrencies: string[];
      hasServerError: boolean;
    };
  };

  const factory = () => {
    return shallowMount(App, {
      localVue,
      data: () => {
        return {
          date: null,
          currencyData: [
            { currency: "EUR", exchangeRate: 1, value: 10 },
            { currency: "USD", exchangeRate: 2, value: 1 }
          ],
          lastChangedCurrency: "EUR",
          isLoading: false,
          errors: [],
          message: null
        };
      }
    });
  };

  beforeEach(() => {
    localVue = createLocalVue();
    (wrapper as any) = factory();
  });

  it("renders", () => {
    expect(wrapper.vm).toBeTruthy();
  });

  it("adds currency", () => {
    wrapper.vm.addCurrency();
    expect(wrapper.vm.currencyData.length).toBe(3);
  });

  it("deletes currency", () => {
    wrapper.vm.deleteCurrency();
    expect(wrapper.vm.currencyData.length).toBe(2);
  });

  it("changes last changed currency on value input", () => {
    const changedCurrency = {
      currency: "USD",
      exchangeRate: 3,
      value: 6
    };

    wrapper.vm.onValueInput(changedCurrency);

    expect(wrapper.vm.lastChangedCurrency).toEqual("USD");
  });

  it("populates selects with correct unused currencies", () => {
    expect(wrapper.vm.unusedCurrencies).toEqual(
      Constants.CURRENCIES.filter(cur => !["EUR", "USD"].includes(cur))
    );
  });

  it("sets server error", () => {
    wrapper.vm.setServerError();
    expect(wrapper.vm.hasServerError).toEqual(true);
  });
});
