export class PersistedList<T> {
  private list: T[] = [];
  private key: string;
  private isLocalStorageAvailable: boolean;

  constructor(key: string) {
    this.key = key;
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();

    if (this.isLocalStorageAvailable) {
      const storedList = localStorage.getItem(key);
      if (storedList) {
        this.list = JSON.parse(storedList);
      }
    }
  }

  private checkLocalStorageAvailability(): boolean {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch (e) {
      return false;
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
    if (this.isLocalStorageAvailable) {
      localStorage.setItem(this.key, JSON.stringify(this.list));
    }
  }

  public drain() {
    const list = this.list;
    this.list = [];
    if (this.isLocalStorageAvailable) {
      localStorage.removeItem(this.key);
    }
    return list;
  }
}
