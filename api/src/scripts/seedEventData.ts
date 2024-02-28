import { faker } from "@faker-js/faker";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { v4 } from "uuid";
import { DataType } from "../app-router-type";
import { clickhouse } from "../clickhouse";
import { db } from "../db";
import { people } from "../schema/people";
import { peoplePropTypes } from "../schema/people-prop-types";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";

const shake = (n: number, percent = 0.05, isInt = true) => {
  let v = n * percent * (Math.random() > 0.5 ? 1 : -1);

  if (isInt) {
    v = Math.round(v);
  }

  return n + v;
};
const choose = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
function getRandomDateBetween(startDate: Date, endDate: Date): Date {
  // Convert start and end dates to timestamps
  const start = startDate.getTime();
  const end = endDate.getTime();

  // Generate a random timestamp between the start and end timestamps
  const randomTimestamp = start + Math.random() * (end - start);

  // Convert the random timestamp back into a date and return it
  return new Date(randomTimestamp);
}

const config = {
  newUsersPerDay: 100,
  d1: 0.6,
  d90: 0.05,
  daysToSimulate: 90,
  possibleEvents: [
    {
      name: `CreatePost`,
      simTodayCount: () => {
        if (Math.random() < 0.1) {
          return faker.number.int({ min: 1, max: 10 });
        } else {
          return 0;
        }
      },
      genProps: () => {
        return {
          hasImage: Math.random() < 0.3,
        };
      },
    },
    {
      name: `ViewPost`,
      simTodayCount: () => {
        return faker.number.int({ min: 5, max: 30 });
      },
      genProps: () => {
        return {
          from: choose(["home", "feed", "profile", "search"]),
        };
      },
    },
    {
      name: `LikePost`,
      simTodayCount: () => {
        return faker.number.int({ min: 1, max: 20 });
      },
      genProps: () => {
        return {
          from: choose(["home", "feed", "profile", "search"]),
        };
      },
    },
    {
      name: `SharePost`,
      simTodayCount: () => {
        return faker.number.int({ min: 1, max: 5 });
      },
      genProps: () => {
        return {
          platform: choose(["facebook", "twitter", "whatsapp"]),
        };
      },
    },
  ],
};

const createUsers = ({
  n = config.newUsersPerDay,
  start,
  end,
}: {
  n?: number;
  start: Date;
  end: Date;
}) => {
  return Array(shake(n))
    .fill(0)
    .map(() => {
      return {
        distinct_id: v4(),
        properties: {
          username: faker.internet.userName(),
          email: faker.internet.email(),
        },
        created_at: getRandomDateBetween(start, end),
      };
    });
};

type Event = {
  name: string;
  insert_id: string;
  time: string;
  distinct_id: string;
  properties: Record<string, any>;
};

type Person = {
  distinct_id: string;
  properties: Record<string, any>;
  created_at: Date;
};

const simEvents = (users: Person[], start: Date, end: Date) => {
  const events: Event[] = [];

  for (const user of users) {
    for (const maybeEvent of config.possibleEvents) {
      const count = maybeEvent.simTodayCount();
      for (let i = 0; i < count; i++) {
        events.push({
          distinct_id: user.distinct_id,
          insert_id: v4(),
          name: maybeEvent.name,
          properties: maybeEvent.genProps(),
          time: dateToClickhouseDateString(
            getRandomDateBetween(
              user.created_at.getTime() > start.getTime()
                ? user.created_at
                : start,
              end
            )
          ),
        });
      }
    }
  }

  return events;
};

const calcCohortSizeOnDay = (numUsers: number, dn: number) => {
  const diff = config.d1 - config.d90;

  return Math.floor(shake(((numUsers * diff) / config.daysToSimulate) * dn));
};

const runSimulation = () => {
  const events: Event[] = [];
  const people: Person[] = [];

  const cohorts: ReturnType<typeof createUsers>[] = [];
  let td = new Date();
  for (let i = 0; i < config.daysToSimulate; i++) {
    console.log("Simmulating day", i, "of", config.daysToSimulate);
    const dayStart = startOfDay(td);
    const dayEnd = endOfDay(td);
    const newUsers = createUsers({ start: dayStart, end: dayEnd });
    for (const user of newUsers) {
      events.push({
        distinct_id: user.distinct_id,
        insert_id: v4(),
        name: "Register",
        properties: {},
        time: dateToClickhouseDateString(user.created_at),
      });
    }
    people.push(...newUsers);

    events.push(...simEvents(newUsers, dayStart, dayEnd));
    cohorts.forEach((users, i) => {
      const dn = cohorts.length - i;

      const userSubset = users
        .sort(() => Math.random() - 0.5)
        .slice(0, calcCohortSizeOnDay(users.length, dn));

      events.push(...simEvents(userSubset, dayStart, dayEnd));
    });

    cohorts.push(newUsers);

    td = subDays(td, 1);
  }

  return {
    events,
    people,
  };
};

const main = async () => {
  const project = await db.query.projects.findFirst();
  if (!project) {
    console.log("Create a user before running this script.");
    return;
  }
  const { id: project_id } = project;

  const { events, people: peopleList } = runSimulation();
  console.log("project name: ", project.name);
  console.log(
    `events.length: ${events.length.toLocaleString()}, peopleList.length: ${peopleList.length.toLocaleString()}`
  );

  const batchSize = 50_000;
  let page = 1;
  while (page * batchSize < events.length) {
    console.log(
      `Inserting events ${Math.min(page * batchSize, events.length).toLocaleString()} of ${events.length.toLocaleString()}`
    );
    await clickhouse.insert({
      table: "events",
      values: events
        .slice((page - 1) * batchSize, page * batchSize)
        .map((x) => {
          return {
            properties: JSON.stringify(x.properties),
            project_id,
            insert_id: x.insert_id,
            ingested_at: dateToClickhouseDateString(new Date()),
            name: x.name,
            distinct_id: x.distinct_id,
            time: x.time,
          };
        }),
      format: "JSONEachRow",
    });
    page++;
  }

  await clickhouse.insert({
    table: "people",
    values: peopleList.map((x) => {
      return {
        properties: JSON.stringify(x.properties),
        project_id,
        insert_id: v4(),
        ingested_at: dateToClickhouseDateString(new Date()),
        distinct_id: x.distinct_id,
        created_at: dateToClickhouseDateString(x.created_at),
      };
    }),
    format: "JSONEachRow",
  });
  await db
    .insert(people)
    .values(
      peopleList.map((x) => ({
        distinctId: x.distinct_id,
        properties: x.properties,
        projectId: project_id,
        createdAt: x.created_at,
      }))
    )
    .execute();
  await db
    .insert(peoplePropTypes)
    .values({
      projectId: project_id,
      propTypes: {
        username: DataType.string,
        email: DataType.string,
      },
    })
    .execute();
};

main();
