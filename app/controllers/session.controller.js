const GameSession = require("../models/GameSessionModel");
const { v4: uuidv4 } = require("uuid");
const { cards } = require("../helpers/cards.helpers");

const startNewSession = async (req, res) => {
  const { playerId } = req.body;
  const cardList = cards;
  const order = [];
  const playersCards = [];

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

  // Distribui as cartas para cada player, sendo 7 para cada um
  order.forEach((i) => {
    const cards = [];
    while (cards.length < 7) {
      cards.push(cardList.splice(0, 1)[0]);
    }

    playersCards.push({ playerId: i, cards });
  });

  // Retira uma carta do baralho para ser a inicial
  const lastCard = cardList.splice(0, 1)[0];

  // Cria a nova sessão de jogo
  try {
    const newSession = await GameSession.create({
      lastCard,
      lastColor: lastCard.charAt(2),
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
  const { playerId, sessionId } = req.query;

  if (!playerId || !sessionId)
    return res.status(404).send("Informações inválidas!");

  try {
    //Procura e filtra a Session
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    //Verifica se o player em questão está participando da Session
    const player = session.order.filter((i) => i === playerId);
    if (player.length === 0)
      return res.status(404).send("Jogador não encontrado!");

    //Filtra as cartas
    const cards = session.playersCards.map((i) => {
      if (i.playerId === playerId) {
        return { id: i.playerId, cards: i.cards };
      } else {
        return { id: i.playerId, cards: i.cards.length };
      }
    });

    res.status(200).json({ cards });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = {
  startGame,
  startNewSession,
};
