import pool from "../config/database";

export class LeaderboardModel {
  static async getLeaderboard(type: "daily" | "weekly" | "monthly") {
    const query = `
            SELECT leader.user_id, leader.rank, leader.points, "user".name AS user_name
               FROM leaderboards leader
               JOIN "users" as "user" ON leader.user_id = "user".id
               WHERE leader.leaderboard_type = $1
               ORDER BY leader.rank ASC;
        `;
    const result = await pool.query(query, [type]);
    return result.rows;
  }

  static async insertLeaderboard(
    userId: number,
    rank: number,
    points: number,
    type: string
  ) {
    return await pool.query(
      `INSERT INTO leaderboards (user_id, rank, points, leaderboard_type) VALUES ($1, $2, $3, $4)`,
      [userId, rank, points, type]
    );
  }

  static async getLeaderboardEntry(
    userId: number,
    type: "daily" | "weekly" | "monthly"
  ) {
    let query = `SELECT * FROM leaderboards WHERE user_id = $1 AND leaderboard_type = $2`;
    const params: any[] = [userId, type];

    if (type === "daily") {
      query += ` AND created_at::DATE = CURRENT_DATE`;
    } else if (type === "weekly") {
      query += ` AND created_at::DATE >= (CURRENT_DATE - INTERVAL '1 day' * EXTRACT(DOW FROM CURRENT_DATE)::integer) 
                 AND created_at::DATE <= CURRENT_DATE`;
    } else if (type === "monthly") {
      query += ` AND created_at::DATE >= DATE_TRUNC('month', CURRENT_DATE) 
                 AND created_at::DATE < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')`;
    }

    return await pool.query(query, params);
  }

  static async updateLeaderboard(
    userId: number,
    rank: number,
    points: number,
    type: string,
    createdAt: string
  ) {
    const query = await pool.query(
      `UPDATE leaderboards SET rank = $1, points = points + $2 WHERE user_id = $3 AND leaderboard_type = $4 AND created_at::DATE = $5;`,
      [rank, points, userId, type, createdAt]
    );
    return query;
  }

  static async getAggregatedScores(
    type: "weekly" | "monthly",
    startDate: string,
    endDate: string
  ) {
    return await pool.query(
      `SELECT  user_id, SUM(points) AS total_points FROM leaderboards WHERE leaderboard_type = 'daily' -- Aggregate from daily    scores AND created_at:DATE BETWEEN $1 AND $2 -- startDate and endDate GROUP BY user_id;`,
      [startDate, endDate]
    );
  }
}
