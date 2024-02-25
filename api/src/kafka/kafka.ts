import { Kafka, Partitioners } from "kafkajs";
import { __prod__ } from "../constants/prod";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [__prod__ ? "kafka:9092" : "localhost:9092"],
});

export const kafkaProducer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.forEach((type) => {
  process.on(type, async (error) => {
    try {
      console.error(`process exit on ${type}`);
      console.error(error);
      await kafkaProducer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach((type) => {
  process.once(type, async () => {
    try {
      await kafkaProducer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
