const express = require("express");
const router = express.Router();

const {
  startGame,
  startNewSession,
} = require("../controllers/session.controller.js");

const {
  buyCard,
  playTurn,
} = require("../controllers/turn.controller.js");

router.route("/new").post(startNewSession);
router.route("/start").get(startGame);
router.route("/session/play").post(playTurn);
router.route("/session/buy").post(buyCard);

module.exports = router;
