const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSessionSchema = Schema({
  lastCard: { type: String, required: true },
  lastColor: { type: String, required: true },
  lastPlayer: { type: String, required: true },
  order: { type: [String], required: true },
  orderBy: { type: String, default: "ASC" },
  playersCards: {
    _id: false,
    type: [{ playerId: String, cards: [String], isCpu: Boolean }],
    required: true,
  },
  remainingCards: { type: [String], required: true },
  winner: { type: String, default: null },
});

module.exports = mongoose.model("GameSession", GameSessionSchema);
