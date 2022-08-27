const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSessionSchema = Schema({
  lastPlayer: { type: String, required: true },
  order: { type: [String], required: true },
  playersCards: { type: [{ playerId: String, cards: [String] }], required: true },
  remainingCards: { type: [String], required: true },
  winner: String,
});

module.exports = mongoose.model("GameSession", GameSessionSchema);
