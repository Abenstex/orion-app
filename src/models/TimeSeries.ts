import { getLanguageStore } from "@/stores/LanguageStore";

export default class TimeSeries {
  values: number[] = [];
  labels: string[] = [];
  maxEntries: number = 15;

  constructor(maxEntries: number) {
    if (maxEntries != undefined) {
      this.maxEntries = maxEntries;
    }
  }

  addData(value: number, label: string) {
    if (this.values.length >= this.maxEntries) {
      this.values.shift();
      this.labels.shift();
    }
    this.values.push(value);
    this.labels.push(label);
  }

  clear() {
    this.values = [];
    this.labels = [];
  }
}
