import { Voidpulse } from "../src/index";

describe("main", () => {
  it("should pass", async () => {
    const voidpulse = new Voidpulse({
      apiKey: "vp_1b024fa38e584d87bdb25c9c3aa50d0a",
      hostUrl: "http://192.168.1.50:4001",
      noInterval: true,
    });
    // voidpulse.track({
    //   distinct_id: "bob",
    //   name: "Test",
    //   properties: {
    //     isCool: true,
    //   },
    // });
    // await voidpulse.flush();
    await voidpulse.setUserProperties("bob", {
      username: "BOB",
    });
  });
});
