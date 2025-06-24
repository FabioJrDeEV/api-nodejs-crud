import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRoutes from "./auth/auth.js";
import authMiddleware from "./auth/authMiddleware.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(authRoutes);

app.get("/tasks", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const resposta = await pool.query(
      "SELECT * FROM banco_do_crud WHERE user_id = $1 ORDER BY id",
      [userId]
    );
    res.status(200).json(resposta.rows);
  } catch (err) {
    console.log(err);
    res.status(404).send("Deu merda ai.");
  }
});

app.get("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const resposta = await pool.query(
      "SELECT * FROM banco_do_crud WHERE id = $1",
      [id]
    );
    res.status(200).json(resposta.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(404).send("Erro ao encontar task");
  }
});

app.post("/tasks", authMiddleware, async (req, res) => {
  const { title, description, day, completed } = req.body;
  const userId = req.userId;

  try {
    const resultado = await pool.query(
      "INSERT INTO banco_do_crud (title, description, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, description, userId]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao adicionar task");
  }
});

app.put("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, day, completed } = req.body;

  try {
    await pool.query(
      "UPDATE banco_do_crud SET title = $1, description = $2, day = $3, completed = $4 WHERE id = $5 RETURNING *",
      [title, description, day, completed, id]
    );
    res.status(200).send("Atualizado com sucesso!");
  } catch (err) {
    console.log(err);
    res.status(500).send("A atualização falhou...");
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query("DELETE FROM banco_do_crud WHERE id = $1", [id]);
    res.status(200).send("Tarefas deletada com sucesso!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao deletar usuario...");
  }
});

app.listen(3000, () => {
  console.log(`App rodando na porta ${PORT}`);
});
