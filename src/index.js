const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

// configurações do sistema
const config = require("./config");

//construir aplicação
const app = express();

//conecta ao banco de dados
mongoose.connect(config.mongo.URL);

//backend pode ser acessado pelo frontend em mesmo estando em dominios diferentes
app.use(cors({ origin: "*" }));

// enviar dados como json
app.use(express.json());

// utilizar parâmetros pela url
app.use(express.urlencoded({ extended: true }));

// Middleware to handle CORS headers for image requests
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Serve static images
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "..", "uploads", "resized"))
);

//usa as rotas
app.use(require("./routes"));

//define a porta com a variavel que tem acesso ao protocolo http
app.listen(config.app.PORT);
