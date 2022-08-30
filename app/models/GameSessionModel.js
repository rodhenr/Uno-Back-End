const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSessionSchema = Schema({
  lastCard: String,
  lastColor: String,
  lastPlayer: String,
  order: { type: [String], required: true },
  orderBy: { type: String, default: "ASC" },
  playersCards: {
    type: [{ playerId: String, cards: [String] }],
    required: true,
  },
  remainingCards: { type: [String], required: true },
  winner: String,
});

module.exports = mongoose.model("GameSession", GameSessionSchema);
