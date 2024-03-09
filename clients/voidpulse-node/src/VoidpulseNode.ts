import { v4 } from "uuid";
import { version } from "./version";

type Event = {
  name: string;
  time: string;
  insert_id: string;
  distinct_id: string;
  ip?: string;
  properties: Record<string, any>;
};

export class Voidpulse {
  private apiKey: string;
  private hostUrl: string;
  private skipIpLookup: boolean = false;
  private eventsQueue: Event[] = [];

  constructor({
    apiKey,
    hostUrl,
    skipIpLookup = false,
    noInterval = false,
  }: {
    apiKey: string;
    hostUrl: string;
    skipIpLookup?: boolean;
    noInterval?: boolean;
  }) {
    this.skipIpLookup = skipIpLookup;
    this.apiKey = apiKey;
    this.hostUrl = hostUrl;
    if (!noInterval) {
      // flush every 10 seconds
      setInterval(() => {
        this.flush();
      }, 1000 * 10);
    }
  }

  getDefaultProps() {
    return {
      $lib_version: version,
      $voidpulse_client: "node",
    };
  }

  track({
    name,
    distinct_id,
    ip,
    properties = {},
  }: {
    name: string;
    distinct_id: string;
    ip?: string;
    properties?: Record<string, any>;
  }) {
    this.eventsQueue.push({
      insert_id: v4(),
      time: new Date().toISOString().slice(0, 19).replace("T", " "),
      distinct_id,
      name,
      ip,
      properties: {
        ...this.getDefaultProps(),
        ...properties,
      },
    });

    if (this.eventsQueue.length >= 100) {
      this.flush();
    }
  }

  setUserProperties(distinct_id: string, properties: Record<string, any>) {
    return this.sendUserProps(distinct_id, properties);
  }

  unsetUserProperties(distinct_id: string, propertiesKeys: string[]) {
    return this.sendUserProps(distinct_id, {}, propertiesKeys);
  }

  async sendEvents(events: Event[]) {
    try {
      const resp = await fetch(`${this.hostUrl}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          skipIpLookup: this.skipIpLookup,
          isFromServer: true,
          events,
        }),
      });
      if (!resp.ok) {
        try {
          const info = await resp.json();
          console.error(`Voidpulse error: ${JSON.stringify(info, null, 2)}`);
        } catch {
          try {
            const text = await resp.text();
            console.error(`Voidpulse error: ${text}`);
          } catch {
            console.error(`Voidpulse error: ${resp.statusText}`);
          }
        }
        return;
      }

      const json = await resp.json();
      if (json.warnings) {
        console.warn(
          `Voidpulse warnings: ${JSON.stringify(json.warnings, null, 2)}`
        );
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        // could not reach server, put events back in queue
        this.eventsQueue.push(...events);
      } else {
        console.error(err);
      }
    }
  }

  async sendUserProps(
    distinct_id: string,
    properties_to_add: Record<string, any> = {},
    properties_to_remove: string[] = []
  ) {
    try {
      const resp = await fetch(`${this.hostUrl}/update-people`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          distinct_id,
          properties_to_add,
          properties_to_remove,
        }),
      });
      if (!resp.ok) {
        try {
          const info = await resp.json();
          console.error(`Voidpulse error: ${JSON.stringify(info, null, 2)}`);
        } catch {
          try {
            const text = await resp.text();
            console.error(`Voidpulse error: ${text}`);
          } catch {
            console.error(`Voidpulse error: ${resp.statusText}`);
          }
        }
        return;
      }
    } catch (err) {
      // @todo retry logic
      console.error(err);
    }
  }

  flush() {
    const events = [...this.eventsQueue];
    this.eventsQueue = [];
    return this.sendEvents(events);
  }
}
