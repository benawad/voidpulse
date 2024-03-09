export type { AppRouter } from "./appRouter";

export enum MetricMeasurement {
  uniqueUsers = 1,
  totalEvents,
}

export enum DataType {
  string = 1,
  number,
  boolean,
  date,
  other,
}

export enum NumberFilterOperation {
  equals = 1,
  notEqual,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  between,
  notBetween,
  isNumeric,
  isNotNumeric,
}

export enum StringFilterOperation {
  is = 1,
  isNot,
  contains,
  notContains,
  isSet,
  isNotSet,
}

export enum DateFilterOperation {
  between = 1,
  notBetween,
  on,
  notOn,
  before,
  since,
}

export enum FilterAndOr {
  and = 1,
  or,
}

export enum PropOrigin {
  event = 1,
  user,
}

export enum ChartType {
  line = 1,
  donut,
  bar,
}

export enum ReportType {
  insight = 1,
  funnel,
  retention,
  // flow,
}

export enum ChartTimeRangeType {
  "Custom" = 1,
  "Today",
  "Yesterday",
  "7D",
  "30D",
  "3M",
  "6M",
  "12M",
}

export enum LineChartGroupByTimeType {
  day = 1,
  week,
  month,
}

export enum RetentionNumFormat {
  percent = 1,
  rawCount,
}

export type DateHeader = {
  label: string;
  fullLabel: string;
  lookupValue: string;
};

export const ANY_EVENT_VALUE = "$*";

export enum ThemeId {
  default = 1,
  mysticalFire,
  infiniteVoid,
  deepLava,
  electricOcean,
}

export type BreakdownType = string | number;

export enum MsgRole {
  user = 1,
  ai,
  system,
}

export const defaultPropertyNameMap = {
  $city: "City",
  $country: "Country",
  $region: "Region",
  $timezone: "Timezone",
  time: "Time",
  distinct_id: "Distinct ID",
  $app_build_number: "App Build Number",
  $app_release: "App Release",
  $app_version: "App Version",
  $app_version_string: "App Version String",
  $bluetooth_version: "Bluetooth Version",
  $brand: "Brand",
  $carrier: "Carrier",
  $device_id: "Device ID",
  $has_nfc: "Has NFC",
  $has_telephone: "Has Telephone",
  $lib_version: "Lib Version",
  $manufacturer: "Manufacturer",
  $model: "Model",
  $os: "OS",
  $os_version: "OS Version",
  $screen_dpi: "Screen DPI",
  $screen_height: "Screen Height",
  $screen_width: "Screen Width",
  $wifi: "Wifi",
  $radio: "Radio",
  $native_app_version: "Native App Version",
  $voidpulse_client: "Voidpulse Client",
};

export const hiddenPropertyNameMap = {
  $insert_id: "Insert ID",
  $distinct_id_before_identity: "Distinct ID Before Identity",
  $had_persisted_distinct_id: "Had Persisted Distinct ID",
  $mp_api_endpoint: "MP API Endpoint",
  $mp_api_timestamp_ms: "MP API Timestamp MS",
  $user_id: "User ID",
  mp_country_code: "MP Country Code",
  mp_lib: "MP Lib",
  mp_processing_time_ms: "MP Processing Time MS",
};

export enum ProjectRoleId {
  viewer = 10,
  editor = 20,
  admin = 30,
  owner = 40,
}
