import { FilterDataType, ObjectType } from "@/generated/orion_common";
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
