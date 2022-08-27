const express = require("express");
const router = express.Router();

const { startGame, startNewSession } = require("../controllers/game.controller.js");

router.route("/new").post(startNewSession);
router.route("/start").get(startGame);

module.exports = router;
