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
    (firstLetter === "T" && thirdLetter === lastColor)
  ) {
    return card; // caso seja carta especial de cor
  } else {
    return null; // caso as cartas não combinem
  }
};

const cardFunc = (
  card,
  id,
  lastPlayer,
  order,
  orderBy,
  players,
  remainingCards
) => {
  //Condições da carta jogada
  if (card.charAt(0) === "C") {
    lastPlayer = id;

    //Muda a cor atual e sai do loop
    const colors = ["Y", "R", "B", "G"];
    const randColor = colors[Math.floor(Math.random() * 4)];

    const updatedPlayers = players.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return [i.playerId, cards];
      } else {
        return i;
      }
    });

    //lastCard = card;
    return {
      lastColor: randColor,
      lastPlayer,
      order,
      orderBy,
      players: updatedPlayers,
      remainingCards,
    };
  } else if (card.charAt(0) === "F" || card.charAt(0) === "T") {
    const newCards = [];
    const playerOrder = order.indexOf(id);
    let newColor;
    lastPlayer = id;

    //Pega as primeiras cartas do deck, transfere pro player a seguir/anterior
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

    if (orderBy === "ASC") {
      if (playerOrder === 3) {
        players[0].cards = [...players[0].cards, ...newCards];
      } else {
        players[playerOrder + 1].cards = [
          ...players[playerOrder + 1].cards,
          ...newCards,
        ];
      }
    } else {
      if (playerOrder === 0) {
        players[3].cards = [...players[3].cards, ...newCards];
      } else {
        players[playerOrder - 1].cards = [
          ...players[playerOrder - 1].cards,
          ...newCards,
        ];
      }
    }

    const updatedPlayers = players.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return [i.playerId, cards];
      } else {
        return i;
      }
    });

    return {
      lastColor: newColor,
      lastPlayer,
      order,
      orderBy,
      players: updatedPlayers,
      remainingCards,
    };
  } else if (card.charAt(0) === "R") {
    lastPlayer = id;
    //Inverte a ordem e sai do loop
    orderBy === "ASC" ? "DESC" : "ASC";

    const updatedPlayers = players.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return [i.playerId, cards];
      } else {
        return i;
      }
    });

    return {
      lastColor,
      lastPlayer,
      order,
      orderBy,
      players: updatedPlayers,
      remainingCards,
    };
  } else if (card.charAt(0) === "S") {
    const playerOrder = order.indexOf(id);

    //Pula a rodada do próximo jogador
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

    const updatedPlayers = players.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return [i.playerId, cards];
      } else {
        return i;
      }
    });

    return {
      lastColor,
      lastPlayer,
      order,
      orderBy,
      players: updatedPlayers,
      remainingCards,
    };
  } else {
    lastPlayer = id;

    const updatedPlayers = players.map((i) => {
      if (i.playerId === id) {
        const cards = i.cards.filter((j) => j !== card);
        return [i.playerId, cards];
      } else {
        return i;
      }
    });

    return {
      lastColor,
      lastPlayer,
      order,
      orderBy,
      players: updatedPlayers,
      remainingCards,
    };
  }
};

const cards = [
  "00R",
  "00Y",
  "00G",
  "00B",
  "01R",
  "01Y",
  "01G",
  "01B",
  "02R",
  "02Y",
  "02G",
  "02B",
  "03R",
  "03Y",
  "03G",
  "03B",
  "04R",
  "04Y",
  "04G",
  "04B",
  "05R",
  "05Y",
  "05G",
  "05B",
  "06R",
  "06Y",
  "06G",
  "06B",
  "07R",
  "07Y",
  "07G",
  "07B",
  "08R",
  "08Y",
  "08G",
  "08B",
  "09R",
  "09Y",
  "09G",
  "09B",
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

//firstLetter = Identificador
//secondLetter = Caso seja número
//thirdLetter = Cor

//01 - NÚMERO
//C - MUDAR COR
//F - +QUATRO
//R - REVERSE
//S - STOP
//T - +DOIS

module.exports = { cards, cardFunc, checkCard };
