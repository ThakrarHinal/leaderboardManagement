import { Request, Response } from "express";
import { LeaderboardService } from "../services/leaderboard.service";

export class LeaderboardController {
  static async generateLeaderboard(req: Request, res: Response) {
    const { type } = req.params;
    if (!["daily", "weekly", "monthly"].includes(type)) {
      return res.status(400).json({ message: "Invalid leaderboard type" });
    }

    const result = await LeaderboardService.generateLeaderboard(
      type as "daily" | "weekly" | "monthly"
    );
    res.status(200).json({ result });
  }

  static async showLeaderboard(req: Request, res: Response) {
    const { type } = req.params;

    if (!["daily", "weekly", "monthly"].includes(type)) {
      return res.status(400).json({ message: "Invalid leaderboard type" });
    }

    try {
      const leaderboard = await LeaderboardService.fetchLeaderboard(
        type as "daily" | "weekly" | "monthly"
      );
      res
        .status(200)
        .json({ message: `Leaderboard for ${type}`, data: leaderboard });
    } catch (error) {
      console.log({ error });
      res
        .status(500)
        .json({ message: "Failed to fetch leaderboard", error: error.message });
    }
  }
}
