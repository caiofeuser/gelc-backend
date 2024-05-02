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

//usa as rotas
app.use(require("./routes"));

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "..", "uploads", "resized"))
);

//define a porta com a variavel que tem acesso ao protocolo http
app.listen(config.app.PORT);
