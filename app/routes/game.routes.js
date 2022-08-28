const express = require("express");
const router = express.Router();

const {
  playCard,
  startGame,
  startNewSession,
} = require("../controllers/game.controller.js");

router.route("/new").post(startNewSession);
router.route("/start").get(startGame);
router.route("/play").post(playCard);

module.exports = router;
