export class QueryParamHandler {
  map: Record<string, any> = {};
  count = 1;
  add(value: any) {
    const key = `p${this.count++}`;
    this.map[key] = value;
    return key;
  }
  getParams() {
    return this.map;
  }
}
