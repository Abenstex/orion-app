export default class DecentSet<T> {
  private items: T[] = [];
  private getKey: (item: T) => string;

  constructor(getKey: (item: T) => string) {
    this.getKey = getKey;
  }

  clear(): void {
    this.items = [];
  }

  add(item: T): void {
    const key = this.getKey(item);
    if (!this.items.some((existing) => this.getKey(existing) === key)) {
      this.items.push(item);
    }
  }

  replace(item: T): void {
    const key = this.getKey(item);
    if (!this.items.some((existing) => this.getKey(existing) === key)) {
      this.items.push(item);
    } else {
      this.remove(item);
      this.items.push(item);
    }
  }

  has(item: T): boolean {
    return this.items.some(
      (existing) => this.getKey(existing) === this.getKey(item)
    );
  }

  remove(item: T): void {
    const key = this.getKey(item);
    for (const [index, item] of this.items.entries()) {
      if (this.getKey(item) === key) {
        this.items.splice(index, 1);
      }
    }
  }

  values(): T[] {
    return [...this.items];
  }
}
