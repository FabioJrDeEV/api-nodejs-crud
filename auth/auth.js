import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
const SECRET = process.env.JWT_AUTH;

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("E-mail inválido")
      .custom(async (value) => {
        const result = await pool.query(
          "SELECT * FROM db_users WHERE email = $1",
          [value]
        );
        if (result.rows.length > 0) {
          throw new Error("E-mail já cadastrado!");
        }
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Senha deve conter 8 digitios"),
  ],
  async (req, res) => {
    const { email, password } = req.body;

    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ erros: erros.array() });
    }
    res.send({
      message: "Tudo certo",
    });

    const hash = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        "INSERT INTO db_users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hash]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Insira um e-mail valido")
      .custom(async (value) => {
        const result = await pool.query(
          "SELECT * FROM db_users WHERE email = $1",
          [value]
        );
        const user = result.rows[0];

        if (!user) {
          return res.status(400).json({ erro: "Usuario não identificado!" });
        }
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("A senha deve conter 8 digitos"),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ erro: errors.array() });
    }

    try {
      //teste de validação de email usando o express-validator como middleware na função
      /*const user = result.rows[0];

      if (!user) {
        return res.status(400).json({ erro: "Usuario não encontrado!" });
      }*/

      //mesma coisa teste de validação com express-validator

      //const pass = await bcrypt.compare(password, user.password);

      //if (!pass) {
      //return res.status(400).json({ erro: "Senha inválida!" });
      // }

      const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1h" });

      res.json({ token });
    } catch (err) {}
  }
);

export default router;
