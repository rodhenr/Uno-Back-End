const express = require("express");
const router = express.Router();

const {
  cpuCard,
  playerBuyCard,
  playerCard,
  startGame,
  startNewSession,
} = require("../controllers/game.controller.js");

router.route("/new").post(startNewSession);
router.route("/start").get(startGame);
router.route("/play/player").post(playerCard);
router.route("/play/cpu").post(cpuCard);
router.route("/buy/player").post(playerBuyCard);

module.exports = router;
