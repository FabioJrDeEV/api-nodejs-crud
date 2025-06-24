import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db.js";

const router = express.Router();
const SECRET = process.env.JWT_AUTH;

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ error: "Está faltando o nome!" });
  }

  if (!password) {
    return res.status(422).json({ error: "Está faltando a senha!" });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const users = await pool.query("SELECT * FROM db_users WHERE email=$1", [
      email,
    ]);
    if (users.rows.length > 0) {
      res.status(400).json({ erro: "E-mail já existe" });
    }

    const result = await pool.query(
      "INSERT INTO db_users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM db_users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ erro: "Usuario não encontrado!" });
    }

    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      return res.status(400).json({ erro: "Senha inválida!" });
    }

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1h" });

    res.json(token);
  } catch (err) {
    console.log(err);
  }
});

export default router;
