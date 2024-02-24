import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { v4 } from "uuid";
import "react-native-get-random-values";
import { PersistedList } from "./PersistedList";

type Event = {
  name: string;
  time: string;
  insert_id: string;
  properties: Record<string, any>;
};

export class Voidpulse {
  private apiKey: string;
  private hostUrl: string;
  private incomingDistinctId: string = "";
  private distinctId: string = "";
  private hasIdentified: boolean = false;
  private eventsQueue = new PersistedList<Event>("voidpulse_events");
  private anonEventsQueue = new PersistedList<Event>("voidpulse_anon_events");
  private userPropQueue = new PersistedList<string[] | Record<string, any>>(
    "voidpulse_user_props"
  );

  constructor(apiKey: string, hostUrl: string) {
    this.apiKey = apiKey;
    this.hostUrl = hostUrl;
    this.loadDistinctId();
    AppState.addEventListener("change", () => {
      this.flush();
    });
    // flush every minute
    setInterval(() => {
      this.flush();
    }, 1000 * 60);
  }

  private loadDistinctId() {
    AsyncStorage.getItem("voidpulse_distinct_id").then((data) => {
      if (!data) {
        // identify called before initial load
        if (this.incomingDistinctId) {
          this.distinctId = this.incomingDistinctId;
          this.handleFirstIdentify();
        } else {
          // give anon id
          this.distinctId = v4();
          AsyncStorage.setItem(
            "voidpulse_distinct_id",
            JSON.stringify({
              distinctId: this.distinctId,
              hasIdentified: false,
            })
          );
        }
      } else {
        const { distinctId, hasIdentified } = JSON.parse(data);
        // identify called before initial load
        if (this.incomingDistinctId) {
          if (!this.hasIdentified) {
            this.distinctId = this.incomingDistinctId;
            this.handleFirstIdentify();
          } else {
            // take new distinct id, but don't need to drain anon queue
            this.distinctId = this.incomingDistinctId;
            this.hasIdentified = true;
            AsyncStorage.setItem(
              "voidpulse_distinct_id",
              JSON.stringify({
                distinctId: this.distinctId,
                hasIdentified: true,
              })
            );
          }
        } else {
          // load from storage
          this.distinctId = distinctId;
          this.hasIdentified = hasIdentified;
        }
      }
    });
  }

  track(name: string, properties: Record<string, any>) {
    this.eventsQueue.push({
      insert_id: v4(),
      time: new Date().toISOString().slice(0, 19).replace("T", " "),
      name,
      properties,
    });
  }

  identify(distinctId: string) {
    if (this.distinctId === distinctId) {
      return;
    } else if (!this.distinctId) {
      this.incomingDistinctId = distinctId;
    } else if (distinctId) {
      this.distinctId = distinctId;
      this.handleFirstIdentify();
    }
  }

  private handleFirstIdentify() {
    this.hasIdentified = true;
    AsyncStorage.setItem(
      "voidpulse_distinct_id",
      JSON.stringify({
        distinctId: this.distinctId,
        hasIdentified: true,
      })
    );
    this.eventsQueue.push(...this.anonEventsQueue.drain());
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.hasIdentified) {
      throw new Error("Must call identify before setting user properties");
    }
    this.userPropQueue.push(properties);
  }

  unsetUserProperties(propertiesKeys: string[]) {
    if (!this.hasIdentified) {
      throw new Error("Must call identify before setting user properties");
    }
    this.userPropQueue.push(propertiesKeys);
  }

  async sendEvents(events: Event[]) {
    try {
      const resp = await fetch(`${this.hostUrl}/update-people`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          events: events.map((e) => ({
            ...e,
            distinct_id: this.distinctId,
          })),
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

      if (!this.hasIdentified) {
        this.anonEventsQueue.push(...events);
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

  async sendUserProps(userProps: (string[] | Record<string, any>)[]) {
    try {
      const properties_to_add: Record<string, any> = {};
      const properties_to_remove: string[] = [];
      userProps.forEach((thing) => {
        if (Array.isArray(thing)) {
          properties_to_remove.push(...thing);
        } else {
          Object.assign(properties_to_add, thing);
        }
      });
      const resp = await fetch(`${this.hostUrl}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          distinct_id: this.distinctId,
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
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        this.userPropQueue.push(...userProps);
      } else {
        console.error(err);
      }
    }
  }

  flush() {
    const events = this.eventsQueue.drain();
    const userProps = this.userPropQueue.drain();
    const promises: Promise<void>[] = [];
    if (events.length) {
      promises.push(this.sendEvents(events));
    }

    if (userProps.length) {
      promises.push(this.sendUserProps(userProps));
    }

    return Promise.all(promises);
  }

  reset() {
    this.distinctId = v4();
    this.hasIdentified = false;
    AsyncStorage.setItem(
      "voidpulse_distinct_id",
      JSON.stringify({
        distinctId: this.distinctId,
        hasIdentified: false,
      })
    );

    this.eventsQueue.drain();
    this.anonEventsQueue.drain();
    this.userPropQueue.drain();

    this.incomingDistinctId = "";
  }
}
