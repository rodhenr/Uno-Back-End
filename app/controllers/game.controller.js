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

//No modo offline as jogadas da máquina serão executadas após o player escolher sua carta
const playCard = async (req, res) => {
  const { card, playerId, sessionId } = req.body;

  try {
    const session = await GameSession.findById(sessionId);
    if (!session) return res.status(404).send("Sessão de jogo não encontrada!");
    if (session.winner !== "")
      return res.status(400).send("Sessão de jogo já finalizada!");

    //Recebe a cor da última carta jogada
    let lastChoosenColor = session.lastColor;

    //Recebe a ordem das jogadas
    let order = session.order;

    //Recebe as cartas do Deck
    let remainingCards = session.remainingCards;

    //Recebe o último jogador
    let lastPlayer = session.lastPlayer;

    //Recebe a lista de cartas de todos
    const players = session.playersCards;
    if (!players) return res.status(400).send("Jogador não encontrado!");

    //Criar uma condição para rotacionar corretamente a ordem de jogadas, se o próximo jogador for o player então é necessário dar um return e mandar as informações para o player esperando sua próxima jogada

    /* RODADA PLAYER */
    const cardIndex = players
      .filter((i) => i.playerId === playerId)[0]
      .cards.indexOf(card);
    if (cardIndex === -1) return res.status(404).send("Carta inválida!");

    const lastPlayerCard = players
      .filter((i) => i.playerId === playerId)[0]
      .cards.splice(cardIndex, 1)[0];

    if (lastPlayerCard.charAt(0) === "C") {
      const colors = ["Y", "R", "B", "G"];
      const randColor = colors[Math.floor(Math.random() * 4)];
      lastChoosenColor = randColor;
    } else if (lastPlayerCard.charAt(0) === "F") {
      const newCards = [];
      const playerOrder = order.indexOf(playerId);
      for (let i = 0; i < 4; i++) {
        const newIndex = Math.floor(Math.random() * remainingCards.length);
        newCards.push(remainingCards.splice(newIndex, 1));
      }
      if (playerOrder === 3) {
        order[0].cards = [...order[0].cards, ...newCards];
      } else {
        order[playerOrder + 1].cards = [
          ...order[playerOrder + 1].cards,
          ...newCards,
        ];
      }

      const colors = ["Y", "R", "B", "G"];
      const randColor = colors[Math.floor(Math.random() * 4)];
      lastChoosenColor = randColor;
    } else if (lastPlayerCard.charAt(0) === "R") {
    } else if (lastPlayerCard.charAt(0) === "S") {
    } else if (lastPlayerCard.charAt(0) === "T") {
      const newCards = [];
      const playerOrder = order.indexOf(playerId);
      for (let i = 0; i < 2; i++) {
        const newIndex = Math.floor(Math.random() * remainingCards.length);
        newCards.push(remainingCards.splice(newIndex, 1));
      }
      if (playerOrder === 3) {
        order[0].cards = [...order[0].cards, ...newCards];
      } else {
        order[playerOrder + 1].cards = [
          ...order[playerOrder + 1].cards,
          ...newCards,
        ];
      }
    }

    lastChoosenColor = lastPlayerCard.chartAt(2);
    /* FIM RODADA PLAYER */

    /* RODADA MÁQUINA */
    const m1deck = players.filter((i) => i.playerId === "maquina1").cards;
    let lastM1Card = "";

    for (let i = 0; i < m1deck.length; i++) {
      const tryCard = chooseCard(
        m1deck[i],
        lastPlayerCard.substring(0, 2),
        lastPlayerCard.chartAt(2)
      );
      if (tryCard !== null) {
        if (tryCard.chartAt(0) === "C") {
          //necessário escolher uma cor
        } else if (tryCard.chartAt(0) === "F") {
          //necessário escolher uma cor e adicionar +4 cartas para o próximo player
        }
        lastM1Card = tryCard;
        return;
      }
    }
    /* FIM RODADA MÁQUINA */

    const sessionModified = {
      lastColor: lastChoosenColor,
      lastPlayer,
      order,
      playersCards: players,
      remainingCards,
      winner: "",
    };

    //Atualiza o banco de dados
    await GameSession.findByIdAndUpdate(sessionId, sessionModified);

    res.SendStatus(200);
  } catch (err) {
    res.status(500).send("Erro no servidor...");
    console.log(err);
  }
};

module.exports = { playCard, startGame, startNewSession };
