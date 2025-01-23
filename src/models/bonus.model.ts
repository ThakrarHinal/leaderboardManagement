import pool from "../config/database";

export class BonusModel {
  static async insertBonus(userId: number, amount: number, type: string) {
    return await pool.query(
      `INSERT INTO bonuses (user_id, bonus_amount, leaderboard_type) VALUES ($1, $2, $3)`,
      [userId, amount, type]
    );
  }
}
