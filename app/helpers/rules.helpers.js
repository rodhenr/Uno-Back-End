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
    lastPlayer = id;

    // Muda a cor atual
    const colors = ["Y", "R", "B", "G"];
    const randColor = colors[Math.floor(Math.random() * 4)];

    // Retira a carta do deck do player
    const updatedPlayers = playersCards.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return { playerId: i.playerId, cards: cards };
      } else {
        return i;
      }
    });

    return {
      lastCard: card,
      lastColor: randColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: updatedPlayers,
      remainingCards,
    };
  } else if (card.charAt(0) === "F" || card.charAt(0) === "T") {
    const newCards = [];
    const playerOrder = order.indexOf(id);
    let newColor;
    lastPlayer = id;

    //Pega as primeiras cartas restantes do baralho
    if (card.charAt(0) === "F") {
      const colors = ["Y", "R", "B", "G"];
      newColor = colors[Math.floor(Math.random() * 4)];

      for (let i = 0; i < 4; i++) {
        newCards.push(remainingCards.splice(i, 1)[0]);
      }
    } else {
      for (let i = 0; i < 2; i++) {
        newCards.push(remainingCards.splice(i, 1)[0]);
      }
      newColor = card.chartAt(2);
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

    // Retira a carta do deck do player
    const updatedPlayers = playersCards.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return { playerId: i.playerId, cards: cards };
      } else {
        return i;
      }
    });

    return {
      lastCard: card,
      lastColor: newColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: updatedPlayers,
      remainingCards,
    };
  } else if (card.charAt(0) === "R") {
    lastPlayer = id;

    // Inverte a ordem
    orderBy === "ASC" ? (orderBy = "DESC") : (orderBy = "ASC");

    // Retira a carta do deck do player
    const updatedPlayers = playersCards.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return { playerId: i.playerId, cards: cards };
      } else {
        return i;
      }
    });

    return {
      lastCard: card,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: updatedPlayers,
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

    // Retira a carta do deck do player
    const updatedPlayers = playersCards.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return { playerId: i.playerId, cards: cards };
      } else {
        return i;
      }
    });

    return {
      lastCard: card,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: updatedPlayers,
      remainingCards,
    };
  } else {
    lastPlayer = id;

    // Retira a carta do deck do player
    const updatedPlayers = playersCards.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return { playerId: i.playerId, cards: cards };
      } else {
        console.log(i);
        return i;
      }
    });

    return {
      lastCard: card,
      lastColor,
      lastPlayer,
      order,
      orderBy,
      playersCards: updatedPlayers,
      remainingCards,
    };
  }
};

const nextTurnCheck = (lastPlayer, order, orderBy, playersCards, playerId) => {
  // Checa qual próximo player a jogar
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

  // Lista as cartas do jogador e o número de cartas das CPUs para o próximo turno
  const nextCards = playersCards.map((i) => {
    if (i.playerId === playerId) {
      return i.cards;
    } else {
      return i.cards.length;
    }
  });

  return {
    nextPlayer,
    nextCards,
  };
};

module.exports = { checkCard, nextTurnCheck, playCard };
