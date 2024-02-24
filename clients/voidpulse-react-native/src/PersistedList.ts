import AsyncStorage from "@react-native-async-storage/async-storage";

export class PersistedList<T> {
  private list: T[] = [];
  private key: string;
  private initialized: boolean = false;

  constructor(key: string) {
    this.key = key;
    AsyncStorage.getItem(key).then((list) => {
      const shouldSave = this.list.length;
      if (list) {
        this.list.unshift(...JSON.parse(list));
      }
      this.initialized = true;

      if (shouldSave) {
        AsyncStorage.setItem(this.key, JSON.stringify(this.list));
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
      AsyncStorage.setItem(this.key, JSON.stringify(this.list));
    }
  }

  public drain() {
    if (!this.initialized) {
      return [];
    }
    const list = this.list;
    this.list = [];
    if (list.length) {
      AsyncStorage.removeItem(this.key);
    }
    return list;
  }
}
