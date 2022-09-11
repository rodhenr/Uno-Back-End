const express = require("express");
const router = express.Router();

const {
  startGame,
  startNewSession,
} = require("../controllers/session.controller.js");

const {
  buyCard,
  playTurn,
  skipTurn,
} = require("../controllers/turn.controller.js");

router.route("/api/new").post(startNewSession);
router.route("/api/start").post(startGame);
router.route("/api/session/buy").post(buyCard);
router.route("/api/session/play").post(playTurn);
router.route("/api/session/skip").post(skipTurn);

module.exports = router;
