export class PersistedList<T> {
  private list: T[] = [];
  private key: string;

  constructor(key: string) {
    this.key = key;
    const storedList = localStorage.getItem(key);
    if (storedList) {
      this.list = JSON.parse(storedList);
    }
  }

  public isReady() {
    return true;
  }

  public get() {
    return this.list;
  }

  public push(...items: T[]) {
    this.list.push(...items);
    localStorage.setItem(this.key, JSON.stringify(this.list));
  }

  public drain() {
    const list = this.list;
    this.list = [];
    localStorage.removeItem(this.key);
    return list;
  }
}
