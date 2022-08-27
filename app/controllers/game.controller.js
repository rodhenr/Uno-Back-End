const UserModel = require("../models/UserModel");
const GameSession = require("../models/GameSessionModel");
const { v4: uuidv4 } = require("uuid");

const startNewSession = async (req, res) => {
  const { playerId, mode } = req.query;

  //mode: offline
  const cardList = [
    "0R",
    "0Y",
    "0G",
    "0B",
    "1R",
    "1Y",
    "1G",
    "1B",
    "2R",
    "2Y",
    "2G",
    "2B",
    "3R",
    "3Y",
    "3G",
    "3B",
    "4R",
    "4Y",
    "4G",
    "4B",
    "5R",
    "5Y",
    "5G",
    "5B",
    "6R",
    "6Y",
    "6G",
    "6B",
    "7R",
    "7Y",
    "7G",
    "7B",
    "8R",
    "8Y",
    "8G",
    "8B",
    "9R",
    "9Y",
    "9G",
    "9B",
    "RER",
    "REY",
    "REG",
    "REB",
    "STR",
    "STY",
    "STG",
    "STB",
    "TWR",
    "TWY",
    "TWG",
    "TWB",
    "FO1",
    "FO2",
    "FO3",
    "FO4",
    "CH1",
    "CH2",
    "CH3",
    "CH4",
  ];

  try {
    //ordem de jogar
    const orderPlayer = Math.floor(Math.random() * 4);
    const order = [];
    for (let i = 0; i < 4; i++) {
      if (i === orderPlayer) {
        order.push(playerId);
      } else {
        order.push(uuidv4());
      }
    }

    //selecionar cartas para cada player
    const playersCards = [];
    order.forEach((i) => {
      //selecionar 7 cartas do deck inicial de forma aleatória
      const cards = [];
      while (cards.length < 7) {
        const newRand = Math.floor(Math.random() * cardList.length);
        cards.push(cardList.splice(newRand, 1)[0]);
      }

      //insere no array as cartas daquele player
      playersCards.push({ playerId: i, cards });
      console.log(playersCards);
    });

    //randomiza o deck restante
    for (let i = cardList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }

    //criando nova gameSession
    const newSession = await GameSession.create({
      lastPlayer: "",
      order,
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

  //offline
  try {
    //Procura e filtra a Session
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    //Retorna as cartas do player
    let playerCards = {};
    session.playersCards.forEach((i) => {
      if (i.playerId === playerId) {
        playerCards = i.cards;
      }
    });

    res.status(200).json({ playerCards });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = { startGame, startNewSession };
