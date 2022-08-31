const UserModel = require("../models/UserModel");
const GameSession = require("../models/GameSessionModel");
const { v4: uuidv4 } = require("uuid");
const { cards, chooseCard } = require("../helpers/rules.helpers");

const startNewSession = async (req, res) => {
  const { playerId, mode } = req.query;

  //mode: offline
  const cardList = cards;

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
      lastPlayer: order[0],
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
  //offline
  const { playerId, sessionId } = req.query;

  if (!playerId || !sessionId)
    return res.status(404).send("Informações inválidas!");

  try {
    //É NECESSÁRIO VALIDAR O ID ANTES DE FAZER A QUERY
    //Procura e filtra a Session
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    //Verifica se o player em questão está participando da Session
    const player = session.order.filter((i) => i === playerId);
    if (player.length === 0)
      return res.status(404).send("Jogador não encontrado!");

    res.status(200).json({ cards: session.playersCards });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

const playerCard = async (req, res) => {
  const { card, playerId, sessionId } = req.body;

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    let lastCard = session.lastCard;
    let lastColor = session.lastColor;
    let lastPlayer = session.lastPlayer;
    let order = session.order;
    let orderBy = session.orderBy;
    let players = session.playersCards;
    let remainingCards = session.remainingCards;

    //Proteção contra jogar na hora errada
    if (orderBy === "ASC") {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 3 && order[0] !== playerId) ||
        order[lastPlayerOrder + 1] !== playerId
      )
        return res.status(404).send("Não é a sua rodada ainda!");
    } else {
      const lastPlayerOrder = order.indexOf(lastPlayer);
      if (
        (lastPlayerOrder === 0 && order[3] !== playerId) ||
        order[lastPlayerOrder - 1] !== playerId
      )
        return res.status(404).send("Não é a sua rodada ainda!");
    }

    /* RODADA PLAYER */

    //Verifica se a carta existe
    const cardIndex = players
      .filter((i) => i.playerId === playerId)[0]
      .cards.indexOf(card);
    if (cardIndex === -1) return res.status(404).send("Carta inválida!");

    //Remove carta do deck do jogador
    players.forEach((i) => {
      if (i.playerId === playerId) {
        i.cards.splice(cardIndex, 1);
      }
    });

    //Condições da carta jogada
    if (card.charAt(0) === "C") {
      const colors = ["Y", "R", "B", "G"];
      const randColor = colors[Math.floor(Math.random() * 4)];
      lastCard = card;
      lastColor = randColor; // Troca a cor atual e sai do loop
    } else if (card.charAt(0) === "F") {
      const newCards = [];
      const playerOrder = order.indexOf(playerId);
      //Pega as 4 primeiras cartas do deck, transfere pro player a seguir/anterior
      for (let i = 0; i < 4; i++) {
        newCards.push(remainingCards.splice(i, 1));
      }
      if (playerOrder === 3) {
        if (orderBy === "ASC") {
          order[0].cards = [...order[0].cards, ...newCards];
        } else {
          order[2].cards = [...order[2].cards, ...newCards];
        }
      } else if (playerOrder === 0) {
        if (orderBy === "DESC") {
          order[4].cards = [...order[4].cards, ...newCards];
        } else {
          order[1].cards = [...order[1].cards, ...newCards];
        }
      } else if (orderBy === "DESC") {
        order[playerOrder - 1].cards = [
          ...order[playerOrder - 1].cards,
          ...newCards,
        ];
      } else {
        order[playerOrder + 1].cards = [
          ...order[playerOrder + 1].cards,
          ...newCards,
        ];
      }

      //Por fim, muda a cor atual e sai do loop
      const colors = ["Y", "R", "B", "G"];
      const randColor = colors[Math.floor(Math.random() * 4)];
      lastCard = card;
      lastColor = randColor;
    } else if (card.charAt(0) === "R") {
      orderBy === "ASC" ? "DESC" : "ASC";
    } else if (card.charAt(0) === "S") {
      const playerOrder = order.indexOf(playerId);

      if (orderBy === "ASC") {
        if (playerOrder === 3) {
          lastPlayer = order[0];
        } else {
          lastPlayer = order[playerOrder + 1];
        }
      } else {
        if (playerOrder === 0) {
          lastPlayer = order[3];
        } else {
          lastPlayer = order[playerOrder - 1];
        }
      }
    } else if (card.charAt(0) === "T") {
      const newCards = [];
      const playerOrder = order.indexOf(playerId);
      //Adiciona as 2 primeiras cartas do deck no próximo player e sai do loop
      for (let i = 0; i < 2; i++) {
        newCards.push(remainingCards.splice(i, 1));
      }
      if (playerOrder === 3) {
        if (orderBy === "ASC") {
          order[0].cards = [...order[0].cards, ...newCards];
        } else {
          order[2].cards = [...order[2].cards, ...newCards];
        }
      } else if (playerOrder === 0) {
        if (orderBy === "DESC") {
          order[4].cards = [...order[4].cards, ...newCards];
        } else {
          order[1].cards = [...order[1].cards, ...newCards];
        }
      } else if (orderBy === "DESC") {
        order[playerOrder - 1].cards = [
          ...order[playerOrder - 1].cards,
          ...newCards,
        ];
      } else {
        order[playerOrder + 1].cards = [
          ...order[playerOrder + 1].cards,
          ...newCards,
        ];
      }

      lastCard = card;
      lastColor = lastPlayerCard.chartAt(2);
    } else {
      //Regras se for uma carta de número
      lastCard = card;
      lastColor = lastPlayerCard.chartAt(2);
    }

    /* FIM RODADA PLAYER */

    //Checar qual o próximo player
    let nextPlayer = "";
    if (orderBy === "ASC") {
      if (order[lastPlayer] === 3) {
        nextPlayer = order[0];
      } else {
        nextPlayer = order[lastPlayer + 1];
      }
    } else {
      if (order[lastPlayer] === 0) {
        nextPlayer = order[3];
      } else {
        nextPlayer = order[lastPlayer - 1];
      }
    }

    //Lista de cartas do próximo turno
    const nextTurnCards = players.map((i) => {
      if (i.playerId === playerId) {
        return i.cards;
      } else {
        return i.cards.length;
      }
    });

    //Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: players,
      remainingCards,
      winner: "",
    };

    //Atualiza o banco de dados
    await GameSession.findByIdAndUpdate(sessionId, sessionModified);
    res.status(200).json({ nextPlayer, nextTurnCards });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

const cpuCard = async (req, res) => {
  const { cpuId, sessionId } = req.body;

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    let lastCard = session.lastCard;
    let lastColor = session.lastColor;
    let lastPlayer = session.lastPlayer;
    let order = session.order;
    let orderBy = session.orderBy;
    let players = session.playersCards;
    let remainingCards = session.remainingCards;

    /* RODADA MÁQUINA */

    const cpuCards = players.filter((i) => i.playerId === cpuId).cards;

    //Escolhendo a carta do CPU
    for (let i = 0; i < cpuCards.length; i++) {
      const tryCard = chooseCard(
        cpuCards[i],
        lastCard.substring(0, 2),
        lastColor
      );
      if (tryCard !== null) {
        if (tryCard.chartAt(0) === "C") {
          const colors = ["Y", "R", "B", "G"];
          const randColor = colors[Math.floor(Math.random() * 4)];
          lastCard = tryCard;
          lastColor = randColor; // Troca a cor atual e sai do loop
        } else if (tryCard.chartAt(0) === "F") {
          const newCards = [];
          const cpuOrder = order.indexOf(cpuId);
          //Pega as 4 primeiras cartas do deck, transfere pro próximo player
          for (let i = 0; i < 4; i++) {
            newCards.push(remainingCards.splice(i, 1));
          }
          if (cpuOrder === 3) {
            order[0].cards = [...order[0].cards, ...newCards];
          } else {
            //ORGANIZAR POR ASC E DESC
            order[cpuOrder + 1].cards = [
              ...order[cpuOrder + 1].cards,
              ...newCards,
            ];
          }
          //Por fim, muda a cor atual e sai do loop
          const colors = ["Y", "R", "B", "G"];
          const randColor = colors[Math.floor(Math.random() * 4)];
          lastCard = tryCard;
          lastColor = randColor;
        }
        return;
      }
    }

    /* FIM RODADA MÁQUINA */

    //Checar qual o próximo player
    const nextPlayer = "";

    //Lista de cartas do próximo turno
    const nextTurnCards = "";

    const sessionModified = {
      lastCard,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: players,
      remainingCards,
      winner: "", //Verificar
    };

    //Atualiza o banco de dados
    await GameSession.findByIdAndUpdate(sessionId, sessionModified);
    res.status(200).json({ nextPlayer, nextTurnCards });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = { cpuCard, playerCard, startGame, startNewSession };
