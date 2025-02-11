import Storage from "expo-sqlite/kv-store";

export class PersistedList<T> {
  private list: T[] = [];
  private key: string;
  private initialized: boolean = false;

  constructor(key: string) {
    this.key = key;
  }

  private initialize() {
    const list = Storage.getItemSync(this.key);
    if (list) {
      this.list.unshift(...JSON.parse(list));
    }
    this.initialized = true;
  }

  public get() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.list;
  }

  public push(...items: T[]) {
    if (!this.initialized) {
      this.initialize();
    }
    this.list.push(...items);
    try {
      Storage.setItemSync(this.key, JSON.stringify(this.list));
    } catch (e) {
      console.error(e);
    }
  }

  public drain() {
    if (!this.initialized) {
      this.initialize();
    }
    const list = this.list;
    this.list = [];
    if (list.length) {
      try {
        Storage.removeItemSync(this.key);
      } catch (e) {
        console.error(e);
      }
    }
    return list;
  }
}
