const GameSession = require("../models/GameSessionModel");
const {
  playCard,
  checkCard,
  nextTurnCheck,
} = require("../helpers/rules.helpers");

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
    } = session;

    // Proteção contra jogar na hora errada
    if (orderBy === "ASC") {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 3 && order[0] !== id) ||
        order[lastPlayerOrder + 1] !== id
      )
        return res.status(400).send("Não é a sua rodada ainda!");
    } else {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 0 && order[3] !== id) ||
        order[lastPlayerOrder - 1] !== id
      )
        return res.status(400).send("Não é a sua rodada ainda!");
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
      lastPlayer,
      order,
      orderBy,
      playersCards,
      playerId
    );

    // Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard: newCard,
      lastColor: newCard.charAt(2),
      lastPlayer,
      order,
      orderBy,
      playersCards,
      remainingCards,
      winner: "",
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

    // Proteção contra jogar na hora errada
    if (orderBy === "ASC") {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 3 && order[0] !== id) ||
        order[lastPlayerOrder + 1] !== id
      )
        return res.status(400).send("Não é a sua rodada ainda!");
    } else {
      const lastPlayerOrder = order.indexOf(lastPlayer);

      if (
        (lastPlayerOrder === 0 && order[3] !== id) ||
        order[lastPlayerOrder - 1] !== id
      )
        return res.status(400).send("Não é a sua rodada ainda!");
    }

    // Verifica se a carta existe e se é válida no turno atual
    const cardIndex = playersCards
      .filter((i) => i.playerId === id)[0]
      .cards.indexOf(card);
    if (cardIndex === -1) return res.status(404).send("Carta inválida!");
    if (checkCard(card, lastCard, lastColor) === null)
      return res.status(400).send("Jogada inválida!");

    const myInfo = playersCards.filter((i) => i.playerId === id)[0];
    let move;
    
    if (myInfo.isCpu === true) {
      // Escolhe uma carta válida para CPU
      for (let i = 0; i < myInfo.cards.length; i++) {
        const currentCard = checkCard(
          myInfo.cards[i],
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
            players,
            remainingCards
          );

          return;
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

    // Checa o próximo player e as cartas de todos players
    const nextTurn = nextTurnCheck(
      move.lastPlayer,
      move.order,
      move.orderBy,
      move.playersCards,
      id
    );

    // Verifica se venceu
    const isWinner = playersCards.filter((i) => {
      i.playerId === id;
    }).cards.length;

    // Cria um objeto com as informações atualizadas
    const sessionModified = {
      lastCard: move.lastCard,
      lastColor: move.lastColor,
      lastPlayer: move.lastPlayer,
      order: move.order,
      orderBy: move.orderBy,
      playersCards: move.playersCards,
      remainingCards: move.remainingCards,
      winner: isWinner === 0 ? id : "",
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
