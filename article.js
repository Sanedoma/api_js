require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Connexion à PostgreSQL
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});
pool.query(`CREATE TABLE IF NOT EXISTS articles(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL
  )`)
  .then(() => console.log("La table article a été crée ou est déjà existante."))
  .catch(err => console.error(`Une erreur s'est produite lors de la tentative de création d'une table article : ${err}.`));
  

// Middleware pour analyser les données JSON
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API Articles !");
});

// Route GET : Récupérer tous les articles
app.get("/articles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM articles ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: `Erreur : ${err.message}` });
    }
});

// Route POST : Ajouter un article
app.post("/articles", async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const result = await pool.query(
            "INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *",
            [title, content, author]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: `Erreur : ${err.message}` });
    }
});

// Route PATCH : Modifier un article existant
app.patch("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author } = req.body;
        const result = await pool.query(
            "UPDATE articles SET title = $2, content = $3, author = $4 WHERE id = $1 RETURNING *",
            [id, title, content, author]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article non trouvé." });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: `Erreur : ${err.message}` });
    }
});

// Route DELETE : Supprimer un article
app.delete("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article non trouvé." });
        }

        res.status(200).json({ message: "Article supprimé.", article: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: `Erreur : ${err.message}` });
    }
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
