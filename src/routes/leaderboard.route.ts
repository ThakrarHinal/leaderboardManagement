import { Router } from "express";
import { LeaderboardController } from "../controllers/leaderboard.controller";

const router = Router();

router.post("/generate/:type", LeaderboardController.generateLeaderboard);

router.get("/show/:type", LeaderboardController.showLeaderboard);

export default router;
