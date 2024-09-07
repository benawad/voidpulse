import { Voidpulse } from "../src/index";

describe("main", () => {
  it("should pass", async () => {
    const voidpulse = new Voidpulse({
      apiKey: "vp_0ff30f8a298c4ea28ed865fef4aa2502",
      hostUrl: "http://192.168.1.50:4001",
      noInterval: true,
    });
    voidpulse.track("test");
    // voidpulse.identify("tester");
    // await Promise.resolve();
    // voidpulse.setUserProperties({
    //   isCool: true,
    // });
    await Promise.resolve();
    await voidpulse.flush();
  });
});
