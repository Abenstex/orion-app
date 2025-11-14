import type NavItem from "./NavItem"

export default class NavGroup {
    title: string = '';
    icon: string = '';
    items: NavItem[] = [];

    constructor(title: string, icon: string, items: NavItem[]) {
        this.title = title;
        this.icon = icon;
        this.items = items;
    }

}