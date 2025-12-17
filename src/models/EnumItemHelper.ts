import { FilterConnector, FilterDataType, FilterFunction, ObjectType } from "@/generated/orion_common";
import { getLanguageStore } from "@/stores/LanguageStore";

export class EnumItemHelper {
  label: string = "";
  value: number = 0;

  constructor(label: string, value: number) {
    this.label = label;
    this.value = value;
  }
}

export function fromObjectType(): EnumItemHelper[] {
  let enumKeys = Object.values(ObjectType);
  let helpers: EnumItemHelper[] = [];
  for (const key of enumKeys) {
    if (isNaN(Number(key))) {
      if (ObjectType[key as keyof typeof ObjectType] > ObjectType.OT_UNKNOWN) {
        helpers.push({
          value: ObjectType[key as keyof typeof ObjectType],
          label: getLanguageStore().tr(key.toString()),
        });
      }
    }
  }

  return helpers;
}

export function fromFilterConnector(): EnumItemHelper[] {
  let enumKeys = Object.values(FilterConnector);
  let helpers: EnumItemHelper[] = [];
  for (const key of enumKeys) {
    if (isNaN(Number(key))) {
      if (
        FilterConnector[key as keyof typeof FilterConnector] >
        FilterConnector.FC_UNKNOWN
      ) {
        helpers.push({
          value: FilterConnector[key as keyof typeof FilterConnector],
          label: getLanguageStore().tr(key.toString()),
        });
      }
    }
  }

  return helpers;
}

export function fromFilterFunction(): EnumItemHelper[] {
  let enumKeys = Object.values(FilterFunction);
  let helpers: EnumItemHelper[] = [];
  for (const key of enumKeys) {
    if (isNaN(Number(key))) {
      if (
        FilterFunction[key as keyof typeof FilterFunction] >
        FilterFunction.FF_UNKNOWN
      ) {
        helpers.push({
          value: FilterFunction[key as keyof typeof FilterFunction],
          label: getLanguageStore().tr(key.toString()),
        });
      }
    }
  }

  return helpers;
}

export function fromFilterDataType(): EnumItemHelper[] {
  let enumKeys = Object.values(FilterDataType);
  let helpers: EnumItemHelper[] = [];
  for (const key of enumKeys) {
    if (isNaN(Number(key))) {
      if (FilterDataType[key as keyof typeof FilterDataType] > FilterDataType.FDT_UNKNOWN) {
        helpers.push({
          value: FilterDataType[key as keyof typeof FilterDataType],
          label: getLanguageStore().tr(key.toString()),
        });
      }
    }
  }
  /*let helpers: EnumItemHelper[] = Object.keys(FilterDataType)
    .filter((v) => isNaN(Number(v)))
    .map((name) => {
      if (
        FilterDataType[name as keyof typeof FilterDataType] >
        FilterDataType.FDT_UNKNOWN
      )
        return {
          value: FilterDataType[name as keyof typeof FilterDataType],
          label: getLanguageStore().tr(name),
        };
    });*/

  return helpers;
}
