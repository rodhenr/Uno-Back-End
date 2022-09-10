const { cards: cardList } = require("./cards.helpers");
//firstLetter = Identificador
//secondLetter = Caso seja número
//thirdLetter = Cor

//01 - NÚMERO
//C - MUDAR COR
//F - +QUATRO
//R - REVERSE
//S - STOP
//T - +DOIS

// Checa se a carta atual e a última carta jogada retornam uma jogada válida ou não
const checkCard = (card, lastCard, lastColor) => {
  const firstLetter = card.charAt(0);
  const secondLetter = card.charAt(1);
  const thirdLetter = card.charAt(2);
  if (firstLetter === "C" || firstLetter === "F") return card; // caso seja +4 ou escolher cor

  // caso ambas cartas sejam de números
  if (firstLetter === lastCard.charAt(0)) {
    if (secondLetter === lastCard.charAt(1)) return card; //caso número igual
    if (thirdLetter === lastColor) return card; //caso cor igual
    return null;
  } else if (
    (firstLetter === "R" && thirdLetter === lastColor) ||
    (firstLetter === "S" && thirdLetter === lastColor) ||
    (firstLetter === "T" && thirdLetter === lastColor) ||
    thirdLetter === lastColor
  ) {
    return card; // caso seja carta especial de cor ou somente da mesma cor
  } else {
    return null; // caso as cartas não combinem
  }
};

// Verifica em qual caso a carta jogada se encaixa e então retorna um objeto com os dados atualizados
const playCard = (
  card,
  id,
  lastColor,
  lastPlayer,
  order,
  orderBy,
  playersCards,
  remainingCards
) => {
  if (card.charAt(0) === "C") {
    // Muda a cor atual
    const colors = ["Y", "R", "B", "G"];
    const randColor = colors[Math.floor(Math.random() * 4)];

    return {
      lastCard: card,
      lastColor: randColor,
      lastPlayer: id,
      order,
      orderBy,
      playersCards: updateCards(card, id, playersCards),
      remainingCards,
    };
  } else if (card.charAt(0) === "F" || card.charAt(0) === "T") {
    const newCards = [];
    const playerOrder = order.indexOf(id);
    let newColor;
    const arrayCards = cardList.slice();

    // Pega as primeiras cartas restantes do baralho
    if (card.charAt(0) === "F") {
      const colors = ["Y", "R", "B", "G"];
      newColor = colors[Math.floor(Math.random() * 4)];

      for (let i = 0; i < 4; i++) {
        newCards.push(
          arrayCards[Math.floor(Math.random() * arrayCards.length)]
        );
      }
    } else {
      for (let i = 0; i < 2; i++) {
        newCards.push(
          arrayCards[Math.floor(Math.random() * arrayCards.length)]
        );
      }
      newColor = card.charAt(2);
    }

    // Transfere as cartas para o próximo player a jogar
    if (orderBy === "ASC") {
      if (playerOrder === 3) {
        playersCards[0].cards = [...playersCards[0].cards, ...newCards];
      } else {
        playersCards[playerOrder + 1].cards = [
          ...playersCards[playerOrder + 1].cards,
          ...newCards,
        ];
      }
    } else {
      if (playerOrder === 0) {
        playersCards[3].cards = [...playersCards[3].cards, ...newCards];
      } else {
        playersCards[playerOrder - 1].cards = [
          ...playersCards[playerOrder - 1].cards,
          ...newCards,
        ];
      }
    }

    return {
      lastCard: card,
      lastColor: newColor,
      lastPlayer: id,
      order,
      orderBy,
      playersCards: updateCards(card, id, playersCards),
      remainingCards,
    };
  } else if (card.charAt(0) === "R") {
    // Inverte a ordem
    orderBy === "ASC" ? (orderBy = "DESC") : (orderBy = "ASC");

    return {
      lastCard: card,
      lastColor: card.charAt(2),
      lastPlayer: id,
      order,
      orderBy,
      playersCards: updateCards(card, id, playersCards),
      remainingCards,
    };
  } else if (card.charAt(0) === "S") {
    const playerOrder = order.indexOf(id);

    // Pula a rodada do próximo jogador
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

    return {
      lastCard: card,
      lastColor: card.charAt(2),
      lastPlayer,
      order,
      orderBy,
      playersCards: updateCards(card, id, playersCards),
      remainingCards,
    };
  } else {
    return {
      lastCard: card,
      lastColor: card.charAt(2),
      lastPlayer: id,
      order,
      orderBy,
      playersCards: updateCards(card, id, playersCards),
      remainingCards,
    };
  }
};

const nextTurnCheck = (
  lastCard,
  lastColor,
  lastPlayer,
  order,
  orderBy,
  playersCards,
  remaining
) => {
  // Checa qual próximo player a jogar
  let nextPlayer = "";
  const lastPlayerOrder = order.indexOf(lastPlayer);
  const isWinner = playersCards.filter((i) => i.playerId === lastPlayer)[0]
    .cards.length;

  if (orderBy === "ASC") {
    if (lastPlayerOrder === 3) {
      nextPlayer = order[0];
    } else {
      nextPlayer = order[lastPlayerOrder + 1];
    }
  } else {
    if (lastPlayerOrder === 0) {
      nextPlayer = order[3];
    } else {
      nextPlayer = order[lastPlayerOrder - 1];
    }
  }

  // Lista as cartas do jogador e o número de cartas das CPUs para o próximo turno
  const nextCards = playersCards.map((i) => {
    if (i.isCpu === false) {
      return { playerId: i.playerId, cards: i.cards, isCpu: i.isCpu };
    } else {
      return { playerId: i.playerId, cards: [i.cards.length], isCpu: i.isCpu };
    }
  });

  return {
    deckEmpty: remaining === 0 ? true : false,
    lastCard,
    lastColor,
    nextCards,
    nextPlayer,
    winner: isWinner === 0 ? lastPlayer : "",
  };
};

const updateCards = (card, id, playersCards) => {
  // Retira a carta do deck
  const update = playersCards.map((i) => {
    if (i.playerId === id) {
      const cards = i.cards.filter((j) => j !== card);
      return { playerId: i.playerId, cards: cards, isCpu: i.isCpu };
    } else {
      return i;
    }
  });

  return update;
};

module.exports = { checkCard, nextTurnCheck, playCard, updateCards };
