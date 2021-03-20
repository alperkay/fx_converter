<template>
  <div>
    <apexchart
      width="310"
      type="line"
      :options="chartOptions"
      :series="chartData.series"
    ></apexchart>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ApexOptions } from "apexcharts";
import { ChartData, generateChartData } from "../utils/chart-utils";

interface ApexChartSeries {
  name?: string | undefined;
  data: number[];
}

export default Vue.extend({
  name: "CurrencyInput",
  props: ["historicalData"],
  mounted() {
    console.log(this.historicalData.rates);
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
          categories: this.chartData.categories
        },
        yaxis: {
          min: this.chartData.min,
          max: this.chartData.max
        },
        legend: {
          show: false
        }
      };
    },
    chartData(): ChartData {
      return generateChartData(this.historicalData);
    }
  }
});
</script>
