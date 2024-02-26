import { sleep } from "./sleep";

export const tryToConnect = async (fn: () => Promise<any>, label: string) => {
  for (let i = 0; i++; i < 10) {
    try {
      await fn();
      break;
    } catch {}
    console.log(
      label + " connection failed, sleeping for " + (i + 1) + " seconds"
    );
    sleep((i + 1) * 1000);
    console.log("retrying now...");
  }
};
