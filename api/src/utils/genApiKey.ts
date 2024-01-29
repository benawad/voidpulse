import { v4 } from "uuid";

export const genApiKey = () => {
  return `vp_${v4().replace(/-/g, "")}`;
};
