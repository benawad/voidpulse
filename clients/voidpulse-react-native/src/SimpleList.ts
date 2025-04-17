export class SimpleList<T> {
  private list: T[] = [];

  constructor() {}

  init() {
    return Promise.resolve();
  }

  public isReady() {
    return true;
  }

  public get() {
    return this.list;
  }

  public push(...items: T[]) {
    this.list.push(...items);
  }

  public drain() {
    const list = this.list;
    this.list = [];
    return list;
  }
}
