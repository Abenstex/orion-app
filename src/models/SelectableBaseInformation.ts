import type { BaseInformation } from "@/generated/orion_common";

export class SelectableBaseInformation {
    info: BaseInformation | undefined = undefined;
    selected: boolean = false;
    isSelectable: boolean = true;

    constructor(info: BaseInformation) {
        this.info = info;
    }
}