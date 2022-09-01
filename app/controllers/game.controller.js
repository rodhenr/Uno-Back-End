const UserModel = require("../models/UserModel");
const GameSession = require("../models/GameSessionModel");
const { v4: uuidv4 } = require("uuid");
const { cards, cardFunc, checkCard } = require("../helpers/rules.helpers");

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
        return res.status(400).send("Não é a sua rodada ainda!");
    } else {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 0 && order[3] !== playerId) ||
        order[lastPlayerOrder - 1] !== playerId
      )
        return res.status(400).send("Não é a sua rodada ainda!");
    }

    //Verifica se a carta existe e se é válida no turno atual
    const cardIndex = players
      .filter((i) => i.playerId === playerId)[0]
      .cards.indexOf(card);
    if (cardIndex === -1) return res.status(404).send("Carta inválida!");
    if (checkCard(card, lastCard, lastColor) === null)
      return res.status(400).send("Carta inválida!");

    /* RODADA PLAYER */
    const play = cardFunc(
      card,
      playerId,
      lastPlayer,
      order,
      orderBy,
      players,
      remainingCards
    );

    //Verifica qual o próximo player
    let nextPlayer = "";
    if (orderBy === "ASC") {
      if (order[play.lastPlayer] === 3) {
        nextPlayer = order[0];
      } else {
        nextPlayer = order[play.lastPlayer + 1];
      }
    } else {
      if (order[play.lastPlayer] === 0) {
        nextPlayer = order[3];
      } else {
        nextPlayer = order[play.lastPlayer - 1];
      }
    }

    //Lista as cartas do jogador e o número de cartas das CPUs para o próximo turno
    const nextTurnCards = play.players.map((i) => {
      if (i.playerId === playerId) {
        return i.cards;
      } else {
        return i.cards.length;
      }
    });
    /* FIM RODADA PLAYER */

    //Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard: card,
      lastColor: play.lastColor,
      lastPlayer: play.lastPlayer,
      order: play.order,
      orderBy: play.orderBy,
      playersCards: play.players,
      remainingCards: play.remainingCards,
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
  const { cpuId, playerId, sessionId } = req.body;

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
    const cpuCards = players.filter((i) => i.playerId === cpuId)[0].cards;
    let play;

    let i = 0;
    //Escolhendo a carta do CPU
    while (i < cpuCards.length) {
      const currentCard = checkCard(
        cpuCards[i],
        lastCard.substring(0, 2),
        lastColor
      );
      if (currentCard !== null) {
        play = cardFunc(
          currentCard,
          cpuId,
          lastPlayer,
          order,
          orderBy,
          players,
          remainingCards
        );

        i = cpuCards.length;
      } else {
        i++;
      }
    }

    //CRIAR REGRA PARA SACAR CARTA

    //Verifica qual o próximo player
    let nextPlayer = "";
    if (orderBy === "ASC") {
      if (order[play.lastPlayer] === 3) {
        nextPlayer = order[0];
      } else {
        nextPlayer = order[play.lastPlayer + 1];
      }
    } else {
      if (order[play.lastPlayer] === 0) {
        nextPlayer = order[3];
      } else {
        nextPlayer = order[play.lastPlayer - 1];
      }
    }

    //Lista as cartas do jogador e o número de cartas das CPUs para o próximo turno
    const nextTurnCards = play.players.map((i) => {
      if (i.playerId === playerId) {
        return i.cards;
      } else {
        return i.cards.length;
      }
    });
    /* FIM RODADA MÁQUINA */

    const sessionModified = {
      lastCard: card,
      lastColor: play.lastColor,
      lastPlayer: play.lastPlayer,
      order: play.order,
      orderBy: play.orderBy,
      playersCards: play.players,
      remainingCards: play.remainingCards,
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

module.exports = { cpuCard, playerCard, startGame, startNewSession };
