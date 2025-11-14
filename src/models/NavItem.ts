
class NavItem {
    title: string = ''
    icon: string = ''
    route: string = ''

    constructor(title: string, icon: string, route: string) {
        this.title = title;
        this.icon = icon;
        this.route = route;
    }
}

export default NavItem