const chooseCard = (card, lastCard, lastColor) => {
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

module.exports = { cards, chooseCard };
