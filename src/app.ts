import express from "express";
import leaderboardRoutes from "./routes/leaderboard.route";

const app = express();

app.use(express.json());
app.use("/leaderboard", leaderboardRoutes);

export default app;
