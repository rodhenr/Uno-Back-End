const GameSession = require("../models/GameSessionModel");
const { v4: uuidv4 } = require("uuid");
const { cards } = require("../helpers/cards.helpers");
const { nextTurnCheck } = require("../helpers/rules.helpers");

//CRIAR RECCONECT

const startNewSession = async (req, res) => {
  const { playerId } = req.body;
  const cardList = cards.slice();
  const order = [];
  const playersCards = [];
  let top = "";
  let left = "";
  let right = "";

  if (!playerId || playerId === "")
    return res.status(400).send("Player Inválido!");

  // Randomiza o baralho
  for (let i = cardList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
  }

  // Sorteia a ordem do jogo
  const orderPlayer = Math.floor(Math.random() * 4);
  for (let i = 0; i < 4; i++) {
    if (i === orderPlayer) {
      order.push(playerId);
    } else {
      order.push(uuidv4());
    }
  }

  if (orderPlayer === 0) {
    left = order[1];
    top = order[2];
    right = order[3];
  } else if (orderPlayer === 1) {
    left = order[2];
    top = order[3];
    right = order[0];
  } else if (orderPlayer === 2) {
    left = order[3];
    top = order[0];
    right = order[1];
  } else {
    left = order[0];
    top = order[1];
    right = order[2];
  }

  // Distribui as cartas para cada player, sendo 7 para cada um
  order.forEach((i) => {
    const cards = [];
    while (cards.length < 7) {
      cards.push(cardList.splice(0, 1)[0]);
    }

    if (i === playerId) {
      playersCards.push({ playerId: i, cards: [...cards, "FO1"], isCpu: false });
    } else {
      playersCards.push({ playerId: i, cards, isCpu: true });
    }
  });

  // Retira uma carta do baralho para ser a inicial
  const lastCard = cardList.splice(0, 1)[0];
  let lastColor = lastCard.charAt(2);

  if (lastCard.charAt(1) === "C" || lastCard.charAt(1) === "F") {
    const colors = ["Y", "R", "B", "G"];
    const randColor = colors[Math.floor(Math.random() * 4)];
    lastColor = randColor;
  }

  // Cria a nova sessão de jogo
  try {
    const newSession = await GameSession.create({
      cpuLeftId: left,
      cpuRightId: right,
      cpuTopId: top,
      lastCard,
      lastColor,
      lastPlayer: order[3],
      order,
      orderBy: "ASC",
      playersCards,
      remainingCards: cardList,
      winner: "",
    });

    const sessionId = newSession._id;

    res.status(200).json({ sessionId });
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro no servidor...");
  }
};

const startGame = async (req, res) => {
  const { playerId, sessionId } = req.body;

  if (!playerId || !sessionId)
    return res.status(400).send("Informações inválidas!");

  try {
    // Procura e filtra a Session
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    // Verifica se o playerId está participando da Session
    const player = session.order.filter((i) => i === playerId);
    if (player.length === 0)
      return res.status(404).send("Jogador não encontrado!");

    const nextTurn = nextTurnCheck(
      session.lastCard,
      session.lastColor,
      session.lastPlayer,
      session.order,
      session.orderBy,
      session.playersCards,
      playerId
    );

    res.status(200).json({
      cpuLeftId: session.cpuLeftId,
      cpuRightId: session.cpuRightId,
      cpuTopId: session.cpuTopId,
      ...nextTurn,
      sessionId: session._id,
    });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = {
  startGame,
  startNewSession,
};
