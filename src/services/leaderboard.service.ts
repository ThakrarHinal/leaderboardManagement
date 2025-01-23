import { LeaderboardModel } from "../models/leaderboard.model";
import redisClient from "../config/redis";
import { calculateBonus } from "../utils/bonus.calculator.util";
import { BonusModel } from "../models/bonus.model";
import { UserModel } from "../models/user.model";

export interface LeaderboardEntry {
  user_id: number;
  points: number;
  rank: number;
}

export class LeaderboardService {
  static async generateLeaderboard(type: "daily" | "weekly" | "monthly") {
    try {
      const today = new Date();
      let startDate: string;
      let endDate: string;

      if (type === "monthly") {
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
        endDate = new Date(year, month, 0).toISOString().split("T")[0];
      } else if (type === "weekly") {
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek + 1);
        startDate = firstDayOfWeek.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      } else {
        startDate = today.toISOString().split("T")[0];
        endDate = startDate;
      }

      const users: any[] =
        type === "daily"
          ? await UserModel.getAllUsers()
          : await LeaderboardModel.getAggregatedScores(
              type,
              startDate,
              endDate
            );

      if (!users || users.length === 0) {
        throw new Error("No users found to generate leaderboard");
      }
      const sortedUsers = users
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
          user_id: user.id || user.user_id,
          rank: index + 1,
          points: user.points || user.total_points,
          leaderboard_type: type,
        }));

      redisClient.set(`${type}_leaderboard`, JSON.stringify(sortedUsers));

      for (const entry of sortedUsers) {
        const existingEntry: any = await LeaderboardModel.getLeaderboardEntry(
          entry.user_id,
          type
        );

        if (existingEntry && existingEntry.rows.length >= 1) {
          await LeaderboardModel.updateLeaderboard(
            entry.user_id,
            entry.rank,
            entry.points,
            type,
            existingEntry.created_at
          );
        } else {
          await LeaderboardModel.insertLeaderboard(
            entry.user_id,
            entry.rank,
            entry.points,
            type
          );

          const bonusAmount = calculateBonus(entry.rank);
          if (bonusAmount > 0) {
            await BonusModel.insertBonus(entry.user_id, bonusAmount, type);
          }
        }
      }

      return sortedUsers;
    } catch (error) {
      console.error("Error generating leaderboard:", error);
      throw new Error("Internal server error");
    }
  }

  static async fetchLeaderboard(type: "daily" | "weekly" | "monthly") {
    try {
      const cachedLeaderboard = await redisClient.get(`${type}_leaderboard`);
      if (cachedLeaderboard) {
        return JSON.parse(cachedLeaderboard);
      }
      const leaderboardData = await LeaderboardModel.getLeaderboard(type);

      await redisClient.set(
        `${type}_leaderboard`,
        JSON.stringify(leaderboardData)
      );
      return leaderboardData;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw new Error("Could not fetch leaderboard");
    }
  }
}
