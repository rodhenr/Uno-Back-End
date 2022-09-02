const GameSession = require("../models/GameSessionModel");
const { playCard, checkCard } = require("../helpers/rules.helpers");

const playerTurn = async (req, res) => {
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
    const play = playCard(
      card,
      playerId,
      lastColor,
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

const playerBuyCard = async (req, res) => {
  const { playerId, sessionId } = req.body;

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

    //Compra uma carta do baralho
    const newCard = remainingCards.splice(0, 1)[0];
    lastPlayer = cpuId;
    players.forEach((i) => {
      if (i.playerId === playerId) {
        i.cards = [...i.cards, newCard];
      }
    });

    //Verifica qual o próximo player
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

    //Lista as cartas do jogador e o número de cartas das CPUs para o próximo turno
    const nextTurnCards = players.map((i) => {
      if (i.playerId === playerId) {
        return i.cards;
      } else {
        return i.cards.length;
      }
    });

    //Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard: newCard,
      lastColor: newCard.charAt(2),
      lastPlayer: lastPlayer,
      order: order,
      orderBy: orderBy,
      playersCards: players,
      remainingCards: remainingCards,
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

const cpuTurn = async (req, res) => {
  const { cpuId, playerId, sessionId } = req.body;

  if (
    !cpuId ||
    cpuId === "" ||
    !playerId ||
    playerId === "" ||
    !sessionId ||
    sessionId === ""
  )
    return res.status(400).send("Informações inválidas!");

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
        (lastPlayerOrder === 3 && order[0] !== cpuId) ||
        order[lastPlayerOrder + 1] !== cpuId
      )
        return res.status(400).send("Não é a sua rodada ainda!");
    } else {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 0 && order[3] !== cpuId) ||
        order[lastPlayerOrder - 1] !== cpuId
      )
        return res.status(400).send("Não é a sua rodada ainda!");
    }

    /* RODADA MÁQUINA */
    const cpuCards = players.filter((i) => i.playerId === cpuId)[0].cards;
    let play;

    //Escolhendo a carta do CPU
    for (let i = 0; i < cpuCards.length; i++) {
      const currentCard = checkCard(
        cpuCards[i],
        lastCard.substring(0, 2),
        lastColor
      );

      if (currentCard !== null) {
        play = playCard(
          currentCard,
          cpuId,
          lastColor,
          lastPlayer,
          order,
          orderBy,
          players,
          remainingCards
        );

        return;
      }

      //Se nenhuma carta passar no teste, saca uma nova carta
      if (i === cpuCard.length - 1) {
        const newCard = remainingCards.splice(0, 1)[0];

        lastColor = newCard.charAt(2);
        lastPlayer = cpuId;
        players.forEach((i) => {
          if (i.playerId === cpuId) {
            i.cards = [...i.cards, newCard];
          }
        });
      }
    }

    let nextPlayer;
    let nextTurnCards;
    if (play !== "" || play !== null) {
      //Verifica qual o próximo player
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
      nextTurnCards = play.players.map((i) => {
        if (i.playerId === playerId) {
          return { playerId: i.playerId, cards: i.cards };
        } else {
          return { playerId: i.playerId, cards: i.cards.length };
        }
      });
    } else {
      //Verifica qual o próximo player
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

      //Lista as cartas do jogador e o número de cartas das CPUs para o próximo turno
      nextTurnCards = players.map((i) => {
        if (i.playerId === playerId) {
          return { playerId: i.playerId, cards: i.cards };
        } else {
          return { playerId: i.playerId, cards: i.cards.length };
        }
      });
    }

    /* FIM RODADA MÁQUINA */

    let sessionModified = {};

    if (play !== "" || play !== null) {
      sessionModified = {
        lastCard: play.lastCard,
        lastColor: play.lastColor,
        lastPlayer: play.lastPlayer,
        order: play.order,
        orderBy: play.orderBy,
        playersCards: play.players,
        remainingCards: play.remainingCards,
        winner: "",
      };
    } else {
      sessionModified = {
        lastCard: lastCard,
        lastColor: lastColor,
        lastPlayer: lastPlayer,
        order: order,
        orderBy: orderBy,
        playersCards: players,
        remainingCards: remainingCards,
        winner: "",
      };
    }

    //Atualiza o banco de dados
    await GameSession.findByIdAndUpdate(sessionId, sessionModified);
    res.status(200).json({ nextPlayer, nextTurnCards, lastCard: lastCard });
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = {
  cpuTurn,
  playerBuyCard,
  playerTurn,
};
