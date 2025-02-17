import { RANK_ORDER, SPECIAL_RANKS } from './constants';

export function compareCards(card1, card2) {
    if (!card2) return true;
    if (SPECIAL_RANKS.CLEAR_PILE.includes(card1.rank)) return true;
    return RANK_ORDER.indexOf(card1.rank) >= RANK_ORDER.indexOf(card2.rank);
}

export function canPlayCard(card, topCard, isLastCard = false) {
    if (isLastCard && card.rank === 'J') return true;
    return !topCard || compareCards(card, topCard);
}

export function checkForFourOfAKind(pile) {
    if (pile.length < 4) return false;
    const lastFour = pile.slice(-4);
    return lastFour.every((card) => card.rank === lastFour[0].rank);
}

export function shouldClearPile(card, pile) {
    return (
        SPECIAL_RANKS.CLEAR_PILE.includes(card.rank) ||
        checkForFourOfAKind(pile)
    );
}

export function getValidMoves(player, topCard) {
    const moves = {
        hand: [],
        faceUp: [],
        faceDown:
            player.faceDown.length > 0 &&
            player.hand.length === 0 &&
            player.faceUp.length === 0,
    };

    if (player.hand.length > 0) {
        moves.hand = player.hand.map((card, index) => ({
            card,
            index,
            valid: canPlayCard(card, topCard),
        }));
    } else if (player.faceUp.length > 0) {
        moves.faceUp = player.faceUp.map((card, index) => ({
            card,
            index,
            valid: canPlayCard(card, topCard),
        }));
    }

    return moves;
}

export function findPlayableCard(cards, topCard, isLastCard = false) {
    for (let i = 0; i < cards.length; i++) {
        if (canPlayCard(cards[i], topCard, isLastCard)) {
            return { card: cards[i], index: i };
        }
    }
    return null;
}

export function botPlay(bot, pile, deck) {
    const topCard = pile[pile.length - 1];
    const isLastCard =
        bot.hand.length + bot.faceUp.length + bot.faceDown.length === 1;
    let playedCard = null;

    if (bot.hand.length > 0) {
        const result = findPlayableCard(bot.hand, topCard, isLastCard);
        if (result) {
            playedCard = result.card;
            bot.hand.splice(result.index, 1);

            if (deck.length > 0 && bot.hand.length < 3) {
                bot.hand.push(deck.pop());
            }
        }
    } else if (bot.faceUp.length > 0) {
        const result = findPlayableCard(bot.faceUp, topCard, isLastCard);
        if (result) {
            playedCard = result.card;
            bot.faceUp.splice(result.index, 1);
        }
    } else if (bot.faceDown.length > 0) {
        playedCard = bot.faceDown.pop();
    }

    return playedCard;
}
