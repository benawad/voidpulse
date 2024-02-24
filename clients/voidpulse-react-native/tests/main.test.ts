import { Voidpulse } from "../src/index";

describe("main", () => {
  it("should pass", async () => {
    const voidpulse = new Voidpulse({
      apiKey: "vp_600176d5a36a42f7b21ab17d6be22b43",
      hostUrl: "http://192.168.1.50:4001",
      noInterval: true,
    });
    voidpulse.track("test");
    await Promise.resolve();
    await voidpulse.flush();
  });
});
