import { jest } from "@jest/globals";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: () => {
    return Promise.resolve(null);
  },
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

jest.mock("expo-application", () => ({}));
jest.mock("expo-constants", () => ({}));
jest.mock("expo-device", () => ({}));
