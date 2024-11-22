/*require(' dotenv ').config();
const express = require('express');
const { Pool } = require(' pg ');

const app = express();

const port = process.env.PORT || 3000;

//Connexion à PostgreSQL
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});

//Création de la table utilisateur (à éxecuter une fois)
pool.query(` CREATE TABLE IF NOT EXISTS users ( id SERIEL PRIMARY KEY, 
    name TEXT, 
    email TEXT, 
    resume JSONB) `)
    .then(() => console.log('Table users créée ou déjà exitante'))
    .catch(err => console.error('Erreur lors de la création de la table:', err));

    //Définir les routees (exemple)
    app.get('/', (req, res) => {
        res.send('hello form your CV API !')
    });
    app.post('/users', async (req, res) => {
        try{
            const {name, email, resume} = req.body;
            if(verifyUnicity(email)){
                throw new Error("l'email est deja utiliser par un utilisateur");
            }
            const result = await pool.query('INSERT INTO users (name, email, resume) VALUES ($1, $2, $3) RETURNING *', [name, email, resume]);
            res.status(201).json(result.rows[0]);
        }
        catch (err){
            console.error(err);
            res.status(500).json({
                message: `Erreur lors de la création de l'utilisateur`
            });
        }
    });
    app.listen(port, () => { console.log(`Server listening on port ${port}`); });

    app.patch("/users/edit/name", async (req,res) => {
        try{
      
          const {id, name} = req.body;
      
          const result = pool.query("UPDATE users SET name=$2 WHERE id=$1", [id, name]);
      
          res.status(200).json({
            message: "Le nom de l'utilisateur a été modifié.",
            result: result
          });
      
        }catch(err){
          res.status(500).json({
            message: `Une erreur s'est produite lors de la mise à jour du nom de l'utilisateur : ${err}`
          });
        }
      });
      app.put("/users/edit", async (req, res) => {
        try{
            const {id = null, name, email, resume} = req.body;

            if(id === null){
                if(verifyUnicity(email)){
                    throw new Error("l'email est deja utiliser par un utilisateur");
                }
                const result = await pool
            }
        }
      })
    //
app.use(express.json());
//Methode
const verifyUnicity = (email) => {
    const result = pool.query(`SELECT COUNT(id) FROM users WHERE email=${email}`);
    result = new Boolean(result);
    return result;
}*/

require("dotenv").config();
const express = require("express");
const {Pool} = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Connexion à PostgreSQL
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password:process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});

// Création de la table users (à exécuter une seule fois)
pool.query(`CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  resume JSONB
)`)
.then(() => console.log("La table users a été crée ou est déjà existante."))
.catch(err => console.error(`Une erreur s'est produite lors de la tentative de création d'une table users : ${err}.`));

// Middleware pour parser le JSON
app.use(express.json());

// Méthodes
const verifyUnicity = (email) => {
  const result = pool.query(`SELECT COUNT(id) FROM users WHERE email=${email}`);
  result = new Boolean(result);
  return result;
}

// Définir les routes
app.get("/", (req, res) => {
  res.send("Hello from your CV API !");
});

app.get("/users", async (req, res) => {
  try{
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");

    if(result.rows.length <= 0 || !result.rows){
      throw new Error("La table users est vide ou inexistante.");
    }

    res.status(200).json(result.rows);

  }catch(err){
    res.status(500).json({
      "message": `Une erreur s'est produite lors de la tentative de récupération des données de la table users : ${err}.`
    });
  }
});

app.post("/users", async (req,res) => {
  try{
    const {name, email, resume} = req.body;

    if(verifyUnicity(email)){
      throw new Error("L'email est déjà utilisé par un utilisateur.");
    }

    const result = await pool.query("INSERT INTO users(name, email, resume) VALUES($1, $2, $3) RETURNING *", [name, email, resume]);
    res.status(201).json({
      result: result.rows[0]
    });
  }catch(err){
    console.error(err);
    res.status(500).json({
      message: `Erreur lors de la création de l'utilisateur : ${err}`,
      reqBody: `${JSON.stringify(req.body)}`
    });
  }
});

app.put("/users/edit", async (req, res) => {
  try{
    const {id = null, name, email, resume} = req.body;

    if(id === null){
      if(verifyUnicity(email)){
        throw new Error("L'email est déjà utilisé par un utilisateur.");
      }
      const result = await pool.query("INSERT INTO users(name, email, resume) VALUES($1, $2, $3) RETURNING *", [name, email, resume]);
      res.status(201).json({
        message: "Un nouvel utilisateur a été ajouté à la table users.",
        result: result.rows
      });
    }else{
      const result = await pool.query("UPDATE users SET name=$2, email=$3, resume=$4 WHERE id=$1", [id, name, email, resume]);
      res.status(200).json(result);
    }

}catch(err){
    res.status(500).json({
      "message": `Echec de la tentative de mise à jour des données sur la table users : ${err}`
    });
  }
});

app.patch("/users/edit/name", async (req,res) => {
  try{

    const {id, name, ...params} = req.body;

    const result = pool.query("UPDATE users SET name=$2 WHERE id=$1", [id, name]);

    res.status(200).json({
      message: "Le nom de l'utilisateur a été modifié.",
      result: result,
      params: params
    });

  }catch(err){
    res.status(500).json({
      message: `Une erreur s'est produite lors de la mise à jour du nom de l'utilisateur : ${err}`
    });
  }
});

// On lance le serveur Express
app.listen(port, () => console.log(`Le serveur écoute le port 
${port}.`));

