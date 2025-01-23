import pool from "../config/database";

export class UserModel {
  static async getUserById(userId: number) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    return result.rows[0];
  }

  static async getAllUsers() {
    const query = `
          SELECT id, points
          FROM users
        `;
    const result = await pool.query(query);
    return result.rows;
  }
}
