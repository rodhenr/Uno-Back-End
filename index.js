const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/unodb");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro na conexão com o MongoDB"));

app.listen(8080, () => {
  console.log("Servidor iniciado na porta 8080");
});

module.exports = app;