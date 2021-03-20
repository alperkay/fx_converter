import { HistoricalResponse } from "@/api-services/currencies/currency-contracts";
import { formatDate } from "./date-utils";

interface ApexChartSeries {
  name?: string | undefined;
  data: number[];
}

interface ByDateDataPoint {
  date: Date;
  values: { [key: string]: number };
}

export interface ChartData {
  categories: string[];
  series: { name: string; data: number[] }[];
  max: number;
  min: number;
}

export function generateChartData(rawData: HistoricalResponse): ChartData {
  const { rates } = rawData;

  const arr: ByDateDataPoint[] = [];

  for (const key in rates) {
    arr.push({
      date: new Date(key),
      values: rates[key]
    });
  }

  arr.sort((a: ByDateDataPoint, b: ByDateDataPoint) => {
    if (a.date > b.date) {
      return 1;
    }
    if (a.date < b.date) {
      return -1;
    }
    return 0;
  });

  const categories = arr.map(dataPoint => formatDate(dataPoint.date));

  const series = arr.reduce((acc: { name: string; data: number[] }[], day) => {
    if (!acc.length) {
      return Object.keys(day.values).map(key => {
        return { name: key, data: [day.values[key]] };
      });
    } else {
      Object.keys(day.values).forEach(key => {
        (acc.find(item => item.name === key) as ApexChartSeries).data.push(
          day.values[key]
        );
      });
      return acc;
    }
  }, []);

  let min = 0;
  let max = 0;

  series.forEach((serie, index) => {
    const maxOfSerie = Math.max(...serie.data);
    max = maxOfSerie > max ? maxOfSerie : max;

    const minOfSerie = Math.min(...serie.data);
    if (index === 0) {
      min = minOfSerie;
    } else {
      min = minOfSerie < min ? minOfSerie : min;
    }
  });

  return {
    categories,
    series,
    max,
    min
  };
}
