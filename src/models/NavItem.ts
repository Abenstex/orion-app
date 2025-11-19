class NavItem {
  title = ref<string>('')
  icon = ''
  route = ''

  constructor (title: string, icon: string, route: string) {
    this.title.value = title
    this.icon = icon
    this.route = route
  }
}

export default NavItem
