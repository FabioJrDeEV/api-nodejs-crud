import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRoutes from "./auth/auth.js";
import authMiddleware from "./auth/authMiddleware.js";
import { body, validationResult } from "express-validator";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(authRoutes);

app.get("/tasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    await pool.query("DELETE FROM tasks WHERE dias < CURRENT_DATE");
    const resposta = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id",
      [userId]
    );
    res.status(200).json(resposta.rows);
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: "Erro ao buscar tarefas!" });
  }
});

app.get("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const resposta = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      id,
    ]);
    res.status(200).json(resposta.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: "Erro ao encontar task" });
  }
});

app.post(
  "/tasks",
  [
    body("title").notEmpty().withMessage("O campo de titulo é obrigatorio!"),
    body("description")
      .notEmpty()
      .withMessage("O campo de descrição é obrigatorio!"),
  ],
  authMiddleware,
  async (req, res) => {
    const { title, description, completed, dias } = req.body;
    const userId = req.user.userId;
    const errors = validationResult(req);

    if (!errors.isEmpty(req)) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const resultado = await pool.query(
        "INSERT INTO tasks (title, description, completed ,user_id, dias) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description, completed, userId, dias]
      );
      res.status(201).json(resultado.rows[0]);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Erro ao adicionar task" });
    }
  }
);

app.put(
  "/tasks/:id",
  [
    body("title").notEmpty().withMessage("O campo de titulo é obrigatorio!"),
    body("description")
      .notEmpty()
      .withMessage("O campo de descrição é obrigatorio!"),
  ],
  async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, dias } = req.body;
    const erros = validationResult(req);

    if (!erros.isEmpty(req)) {
      return res.status(400).json({ error: erros.array() });
    }

    try {
      await pool.query(
        "UPDATE tasks SET title = $1, description = $2, dias = $3 WHERE id = $4 RETURNING *",
        [title, description, dias, id]
      );
      res.status(200).json({ message: "Atualizado com sucesso!" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Erro ao atualizar usuario" });
    }
  }
);

app.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.status(200).json({ message: "Tarefas deletada com sucesso!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro ao deletar usuario" });
  }
});

app.listen(3000, () => {
  console.log(`App rodando na porta ${PORT}`);
});
