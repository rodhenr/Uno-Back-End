const express = require("express");
const router = express.Router();

const {
  startGame,
  startNewSession,
} = require("../controllers/session.controller.js");

const {
  cpuTurn,
  playerBuyCard,
  playerTurn,
} = require("../controllers/turn.controller.js");

router.route("/new").post(startNewSession);
router.route("/start").get(startGame);
router.route("/play/player").post(playerTurn);
router.route("/play/cpu").post(cpuTurn);
router.route("/buy/player").post(playerBuyCard);

module.exports = router;
