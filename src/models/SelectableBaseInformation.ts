import type { BaseInformation } from "@/generated/orion_common";

export class SelectableBaseInformation {
    info: BaseInformation | undefined = undefined;
    selected: boolean = false;
    isSelectable: boolean = true;
    infoObject: any | undefined = undefined;

    constructor(info: BaseInformation, infoObject: any) {
        this.info = info;
        this.infoObject = infoObject;
    }
}