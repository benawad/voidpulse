import Storage from "expo-sqlite/kv-store";

export class PersistedList<T> {
  private list: T[] = [];
  private key: string;
  private initialized: boolean = false;

  constructor(key: string) {
    this.key = key;
    Storage.getItemAsync(key).then((list) => {
      const shouldSave = this.list.length;
      if (list) {
        this.list.unshift(...JSON.parse(list));
      }
      this.initialized = true;

      if (shouldSave) {
        Storage.setItemAsync(this.key, JSON.stringify(this.list));
      }
    });
  }

  public isReady() {
    return this.initialized;
  }

  public get() {
    return this.list;
  }

  public push(...items: T[]) {
    this.list.push(...items);
    if (this.initialized) {
      Storage.setItemAsync(this.key, JSON.stringify(this.list));
    }
  }

  public drain() {
    if (!this.initialized) {
      return [];
    }
    const list = this.list;
    this.list = [];
    if (list.length) {
      Storage.removeItemAsync(this.key);
    }
    return list;
  }
}
