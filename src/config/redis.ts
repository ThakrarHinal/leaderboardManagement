import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.connect();

export default redisClient;
