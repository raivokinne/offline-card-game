import { RANKS, SUITS } from './constants';

export function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank });
        }
    }
    return shuffleDeck(deck);
}

export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function createPlayer() {
    return {
        hand: [],
        faceUp: [],
        faceDown: [],
    };
}

export function dealCards(deck, player, bot) {
    for (let i = 0; i < 3; i++) {
        player.faceDown.push(deck.pop());
        bot.faceDown.push(deck.pop());
    }

    for (let i = 0; i < 3; i++) {
        player.faceUp.push(deck.pop());
        bot.faceUp.push(deck.pop());
    }

    for (let i = 0; i < 3; i++) {
        player.hand.push(deck.pop());
        bot.hand.push(deck.pop());
    }
}
