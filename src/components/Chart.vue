<template>
  <div>
    <apexchart
      width="310"
      type="line"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script lang="ts">
import { HistoricalResponse } from "@/api-services/currencies/currency-contracts";
import Vue from "vue";
import { ApexOptions } from "apexcharts";

interface ApexChartSeries {
  name?: string | undefined;
  data: number[];
}

export default Vue.extend({
  name: "CurrencyInput",
  props: ["historicalData"],
  updated() {
    console.log(new Map(Object.entries(this.historicalData.rates)));
  },
  computed: {
    chartOptions(): ApexOptions {
      return {
        chart: {
          height: 250,
          type: "line",
          toolbar: {
            show: false
          }
        },
        colors: ["#77B6EA", "#545454"],
        stroke: {
          curve: "smooth"
        },
        markers: {
          size: 1
        },
        xaxis: {
          categories: Object.keys(this.historicalData.rates)
        },
        yaxis: {
          min: 0,
          max: this.series.reduce((acc: number, serie: { data: number[] }) => {
            const maxOfSerie = Math.max(...serie.data);
            return maxOfSerie > acc ? maxOfSerie : acc;
          }, 0)
        },
        legend: {
          show: false
        }
      };
    },
    series(): { name: string; data: number[] }[] {
      const { rates } = this.historicalData as HistoricalResponse;
      const ratesByDayArray: { [key: string]: number }[] = Object.values(rates);

      // tslint:disable-next-line
      return ratesByDayArray.reduce(
        (
          acc: { name: string; data: number[] }[],
          day: { [key: string]: number }
        ) => {
          if (!acc.length) {
            return Object.keys(day).map(key => {
              return { name: key, data: [day[key]] };
            });
          } else {
            Object.keys(day).forEach(key => {
              (acc.find(
                item => item.name === key
              ) as ApexChartSeries).data.push(day[key]);
            });
            return acc;
          }
        },
        []
      );
      // return [
      //   { name: "bla", data: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      //   { name: "zoza", data: [10, 22, 34, 44, 55, 66, 77, 88, 90] },
      // ];
    }
  }
});
</script>
