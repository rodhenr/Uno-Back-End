const GameSession = require("../models/GameSessionModel");
const {
  playCard,
  checkCard,
  nextTurnCheck,
} = require("../helpers/rules.helpers");
const { cards } = require("../helpers/cards.helpers");

const buyCard = async (req, res) => {
  const { id, sessionId } = req.body;

  if (!id || !sessionId) return res.status(400).send("Dados inválidos!");

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    // Cria variáveis
    let {
      lastCard,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards,
      remainingCards,
      winner,
    } = session;

    const lastPlayerOrder = order.indexOf(lastPlayer);

    // Proteção contra jogar na hora errada
    if (orderBy === "ASC") {
      if (lastPlayerOrder === 3) {
        if (order[0] !== id)
          return res.status(400).send("Não é a sua rodada ainda!");
      } else if (order[lastPlayerOrder + 1] !== id) {
        return res.status(400).send("Não é a sua rodada ainda!");
      }
    } else {
      if (lastPlayerOrder === 0) {
        if (order[3] !== id)
          return res.status(400).send("Não é a sua rodada ainda!");
      } else if (order[lastPlayerOrder - 1] !== id) {
        return res.status(400).send("Não é a sua rodada ainda!");
      }
    }

    // Compra uma carta do baralho
    const newCard = remainingCards.splice(0, 1)[0];
    lastPlayer = id;
    playersCards.forEach((i) => {
      if (i.playerId === id) {
        i.cards = [...i.cards, newCard];
      }
    });

    // Checa o próximo player e as cartas de todos players
    const nextTurn = nextTurnCheck(
      lastCard,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards,
      remainingCards.length
    );
    // Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards,
      remainingCards,
      winner: nextTurn.winner,
    };

    // Atualiza o banco de dados
    await GameSession.findByIdAndUpdate(sessionId, sessionModified);
    res.status(200).json(nextTurn);
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

const playTurn = async (req, res) => {
  const { card, id, sessionId } = req.body;

  if (!card || !id || !sessionId)
    return res.status(400).send("Dados inválidos!");

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).json({
        message: "Sessão de jogo já finalizada!",
        winner: session.winner,
      });

    // Cria variáveis
    let {
      lastCard,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards,
      remainingCards,
    } = session;

    remainingCards =
      remainingCards.length === 0 ? cards.slice() : remainingCards;

    const lastPlayerOrder = order.indexOf(lastPlayer);
    const myInfo = playersCards.filter((i) => i.playerId === id)[0];
    let move;

    // Proteção contra jogar na hora errada
    if (orderBy === "ASC") {
      if (lastPlayerOrder === 3) {
        if (order[0] !== id)
          return res.status(400).send("Não é a sua rodada ainda!");
      } else if (order[lastPlayerOrder + 1] !== id) {
        return res.status(400).send("Não é a sua rodada ainda!");
      }
    } else {
      if (lastPlayerOrder === 0) {
        if (order[3] !== id)
          return res.status(400).send("Não é a sua rodada ainda!");
      } else if (order[lastPlayerOrder - 1] !== id) {
        return res.status(400).send("Não é a sua rodada ainda!");
      }
    }

    // No caso de ser um player, verifica se a carta existe e se é válida no turno atual
    if (myInfo.isCpu === false) {
      if (card.charAt(0) === "C" || card.charAt(0) === "F") {
        const cardIndex = playersCards
          .filter((i) => i.playerId === id)[0]
          .cards.some((i) => i.charAt(0) === "C" || i.charAt(0) === "F");

        if (cardIndex === false) return res.status(404).send("Carta inválida!");
      } else {
        const cardIndex = playersCards
          .filter((i) => i.playerId === id)[0]
          .cards.indexOf(card);

        if (cardIndex === -1) return res.status(404).send("Carta inválida!");

        if (checkCard(card, lastCard, lastColor) === null)
          return res.status(400).send("Jogada inválida!");
      }
    }

    // Faz uma jogada
    if (myInfo.isCpu === true) {
      // Escolhe uma carta válida para CPU
      for (let cardItem of myInfo.cards) {
        const currentCard = checkCard(
          cardItem,
          lastCard.substring(0, 2),
          lastColor
        );

        // Faz a jogada da cpu
        if (currentCard !== null) {
          move = playCard(
            currentCard,
            id,
            lastColor,
            lastPlayer,
            order,
            orderBy,
            playersCards,
            remainingCards
          );

          break;
        }
      }
    } else {
      // Faz a jogada do player
      move = playCard(
        card,
        id,
        lastColor,
        lastPlayer,
        order,
        orderBy,
        playersCards,
        remainingCards
      );
    }

    // No caso da cpu não possuir uma carta válida, ela saca uma nova carta e passa o turno
    if (move === undefined) {
      if (remainingCards.length > 0) {
        playersCards.forEach((i) => {
          if (i.playerId === id) {
            i.cards = [...i.cards, remainingCards.splice(0, 1)[0]];
          }
        });

        move = {
          lastCard,
          lastColor,
          lastPlayer: id,
          order,
          orderBy,
          playersCards,
          remainingCards,
        };
      } else {
        move = {
          lastCard,
          lastColor,
          lastPlayer: id,
          order,
          orderBy,
          playersCards,
          remainingCards,
        };
      }
    }

    // Checa o próximo player e as cartas de todos players
    const nextTurn = nextTurnCheck(
      move.lastCard,
      move.lastColor,
      move.lastPlayer,
      move.order,
      move.orderBy,
      move.playersCards,
      move.remainingCards.length
    );

    // Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard: move.lastCard,
      lastColor: move.lastColor,
      lastPlayer: move.lastPlayer,
      order: move.order,
      orderBy: move.orderBy,
      playersCards: move.playersCards,
      remainingCards: move.remainingCards,
      winner: nextTurn.winner,
    };

    // Atualiza o banco de dados
    await GameSession.findByIdAndUpdate(sessionId, sessionModified);

    res.status(200).json(nextTurn);
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = {
  buyCard,
  playTurn,
};
