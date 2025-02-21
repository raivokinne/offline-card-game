'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createDeck, createPlayer, dealCards } from '@/utils/deck';
import { botPlay, getValidMoves } from '@/utils/game';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const SPECIAL_RANKS = {
    RESET: ['6'],
    CLEAR_PILE: ['10'],
};

export default function Offline() {
    const [gameState, setGameState] = useState({
        deck: [],
        player: null,
        bot: null,
        pile: [],
        currentPlayer: 'player',
        gameOver: false,
        message: '',
        selectedCard: null,
        validMoves: null,
    });

    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        if (gameState.player) {
            const topCard = gameState.pile[gameState.pile.length - 1];
            setGameState((prev) => ({
                ...prev,
                validMoves: getValidMoves(prev.player, topCard),
            }));
        }
    }, [gameState.player, gameState.pile]);

    const startNewGame = () => {
        const newDeck = createDeck();
        const newPlayer = createPlayer();
        const newBot = createPlayer();
        dealCards(newDeck, newPlayer, newBot);

        setGameState({
            deck: newDeck,
            player: newPlayer,
            bot: newBot,
            pile: [],
            currentPlayer: 'player',
            gameOver: false,
            message:
                "Your turn. Click a card to play or pick up if you can't play.",
            selectedCard: null,
            validMoves: null,
        });
    };

    const handleCardPlay = useCallback(
        (cardToPlay, cardIndex, from) => {
            if (!gameState.player) return;

            setGameState((prev) => {
                const newState = { ...prev };
                const { player, pile, deck } = newState;

                if (from === 'hand') {
                    player.hand.splice(cardIndex, 1);
                } else if (from === 'faceUp') {
                    player.faceUp.splice(cardIndex, 1);
                } else {
                    player.faceDown.splice(cardIndex, 1);
                }

                const newPile = [...pile, cardToPlay];
                const { clearPile, extraTurn, message } = handleSpecialCards(
                    cardToPlay,
                    newPile,
                );

                if (clearPile) {
                    newState.pile = [];
                    newState.message = message;
                    if (!extraTurn) {
                        newState.currentPlayer = 'bot';
                        setTimeout(() => botTurn(), 1000);
                    }
                } else {
                    newState.pile = newPile;
                    newState.currentPlayer = 'bot';
                    newState.message = "Bot's turn.";
                    setTimeout(() => botTurn(), 1000);
                }

                if (deck.length > 0 && player.hand.length < 3) {
                    player.hand.push(deck.pop());
                }

                if (checkWinCondition(player)) {
                    newState.gameOver = true;
                    newState.message = 'Congratulations! You win!';
                }

                return {
                    ...newState,
                    selectedCard: null,
                };
            });
        },
        [gameState.player],
    );

    const botTurn = useCallback(() => {
        if (!gameState.bot) return;

        setGameState((prev) => {
            const newState = { ...prev };
            const cardPlayed = botPlay(
                newState.bot,
                newState.pile,
                newState.deck,
            );

            if (cardPlayed) {
                const newPile = [...newState.pile, cardPlayed];
                const { clearPile, extraTurn, message } = handleSpecialCards(
                    cardPlayed,
                    newPile,
                );

                if (clearPile) {
                    newState.pile = [];
                    newState.message = message;
                    if (extraTurn) {
                        setTimeout(() => botTurn(), 1000);
                        return newState;
                    }
                } else {
                    newState.pile = newPile;
                }
            } else {
                // Bot picks up the pile
                newState.bot.hand.push(...newState.pile);
                newState.pile = [];
                newState.message = 'Bot picked up the pile.';
            }

            newState.currentPlayer = 'player';
            newState.message = 'Your turn.';

            if (newState.deck.length > 0 && newState.bot.hand.length < 3) {
                newState.bot.hand.push(newState.deck.pop());
            }

            if (checkWinCondition(newState.bot)) {
                newState.gameOver = true;
                newState.message = 'Game over. Bot wins!';
            }

            return newState;
        });
    }, [gameState.bot]);

    const handleCardSelection = (card, index, from) => {
        if (gameState.currentPlayer !== 'player') return;

        const topCard = gameState.pile[gameState.pile.length - 1];
        if (canPlayCard(card, topCard)) {
            handleCardPlay(card, index, from);
        } else {
            setGameState((prev) => ({
                ...prev,
                message: "Invalid move. Pick up the pile if you can't play.",
            }));
        }
    };

    const canPlayCard = (card, topCard) => {
        if (!topCard) return true;
        if (
            SPECIAL_RANKS.RESET.includes(card.rank) ||
            SPECIAL_RANKS.CLEAR_PILE.includes(card.rank)
        )
            return true;
        return Number.parseInt(card.rank) >= Number.parseInt(topCard.rank);
    };

    const handlePickUp = () => {
        setGameState((prev) => {
            const newState = { ...prev };
            newState.player.hand.push(...newState.pile);
            newState.pile = [];
            newState.message = "You picked up the pile. Bot's turn.";
            newState.currentPlayer = 'bot';
            setTimeout(() => botTurn(), 1000);
            return newState;
        });
    };

    const checkWinCondition = (playerState) => {
        return (
            playerState.hand.length === 0 &&
            playerState.faceUp.length === 0 &&
            playerState.faceDown.length === 0
        );
    };

    const renderCard = (card, index, from) => {
        const isSelected =
            gameState.selectedCard &&
            gameState.selectedCard.index === index &&
            gameState.selectedCard.from === from;

        return (
            <div
                key={index}
                className={`relative flex h-32 w-24 cursor-pointer items-center justify-center rounded-md ${
                    isSelected ? 'ring-2 ring-white' : ''
                } ${
                    gameState.currentPlayer === 'player'
                        ? 'hover:ring-2 hover:ring-gray-300'
                        : ''
                } bg-black text-white shadow-md transition-all duration-200 hover:shadow-lg`}
                onClick={() => {
                    if (gameState.currentPlayer === 'player') {
                        handleCardSelection(card, index, from);
                    }
                }}
                style={{
                    boxShadow:
                        '0 4px 6px rgba(255, 255, 255, 0.1), 0 1px 3px rgba(255, 255, 255, 0.08)',
                }}
            >
                {card && (
                    <span className="text-3xl font-bold">
                        {card.rank}
                        <span className="text-4xl">{card.suit}</span>
                    </span>
                )}
            </div>
        );
    };

    if (!gameState.player || !gameState.bot) return null;

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <Card className="mx-auto max-w-4xl bg-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                            Shithead Card Game
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startNewGame}
                            className="flex items-center gap-2 bg-gray-700 text-white hover:bg-gray-600"
                        >
                            <RefreshCw className="h-4 w-4" />
                            New Game
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {gameState.gameOver ? (
                        <div className="text-center">
                            <p className="mb-4 text-2xl font-bold">
                                {gameState.message}
                            </p>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-center justify-center space-y-8">
                            <div className="flex items-center gap-2 rounded-lg bg-gray-700 p-4">
                                <AlertCircle className="h-5 w-5 text-gray-300" />
                                <p className="font-medium text-gray-300">
                                    {gameState.message}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-300">
                                    Bot's Cards
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap justify-center">
                                        {gameState.bot.faceUp.map(
                                            (card, index) =>
                                                renderCard(
                                                    card,
                                                    index,
                                                    'faceUp',
                                                ),
                                        )}
                                    </div>
                                    <div className="flex flex-wrap justify-center">
                                        {Array(gameState.bot.hand.length)
                                            .fill(null)
                                            .map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="m-1 h-24 w-16 rounded-md bg-gray-600"
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-300">
                                    Current Pile
                                </h3>
                                <div className="flex flex-wrap justify-center">
                                    {gameState.pile
                                        .slice(-4)
                                        .map((card, index) =>
                                            renderCard(card, index, 'pile'),
                                        )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-300">
                                    Your Cards
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap justify-center">
                                        {gameState.player.faceUp.map(
                                            (card, index) =>
                                                renderCard(
                                                    card,
                                                    index,
                                                    'faceUp',
                                                ),
                                        )}
                                    </div>
                                    <div className="relative h-40 w-full">
                                        <div
                                            className="absolute bottom-30 right-24 flex justify-center"
                                            style={{
                                                transform: 'translateX(-50%)',
                                            }}
                                        >
                                            {gameState.player.hand.map(
                                                (card, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            transform: `translateX(250%) rotate(${(index - (gameState.player.hand.length - 1) / 2) * 5}deg)`,
                                                            transformOrigin:
                                                                'bottom center',
                                                            zIndex: index,
                                                        }}
                                                        className=""
                                                    >
                                                        {renderCard(
                                                            card,
                                                            index,
                                                            'hand',
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap justify-center">
                                        {gameState.player.faceDown.map(
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className="m-1 h-24 w-16 cursor-pointer rounded-md bg-gray-600 transition-all duration-200 hover:bg-gray-500"
                                                    onClick={() => {
                                                        if (
                                                            gameState.currentPlayer ===
                                                            'player'
                                                        ) {
                                                            handleCardSelection(
                                                                gameState.player
                                                                    .faceDown[
                                                                    index
                                                                ],
                                                                index,
                                                                'faceDown',
                                                            );
                                                        }
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handlePickUp}
                                disabled={
                                    gameState.currentPlayer !== 'player' ||
                                    gameState.pile.length === 0
                                }
                                className="mt-4 bg-gray-700 text-white hover:bg-gray-600"
                            >
                                Pick Up Pile
                            </Button>

                            <div className="mt-4 space-y-2">
                                <h3 className="font-bold text-gray-300">
                                    Game Rules
                                </h3>
                                <div className="rounded-lg bg-gray-700 p-4 text-sm text-gray-300">
                                    <p>• Max cards: 52 (No jokers)</p>
                                    <p>
                                        • Card suit doesn't matter (e.g., ♠8
                                        can be placed on ♥8)
                                    </p>
                                    <p>
                                        • Play a card of equal or higher value,
                                        or pick up the pile
                                    </p>
                                    <p>
                                        • 6 resets the pile (any card can be
                                        placed on top)
                                    </p>
                                    <p>
                                        • 10 clears the pile and grants an extra
                                        turn
                                    </p>
                                    <p>
                                        • Four identical cards in a row clears
                                        the pile and grants an extra turn
                                    </p>
                                    <p>
                                        • Use face-up cards when hand is empty,
                                        face-down cards when no other options
                                    </p>
                                    <p>• Win by playing all your cards</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

const handleSpecialCards = (card, newPile) => {
    if (SPECIAL_RANKS.RESET.includes(card.rank)) {
        return {
            clearPile: true,
            extraTurn: false,
            message: `Played a ${card.rank}. Pile reset. Play any card.`,
        };
    }
    if (SPECIAL_RANKS.CLEAR_PILE.includes(card.rank)) {
        return {
            clearPile: true,
            extraTurn: true,
            message: `Played a ${card.rank}. Pile cleared. Play again.`,
        };
    }
    if (checkForFourOfAKind(newPile)) {
        return {
            clearPile: true,
            extraTurn: true,
            message: 'Four identical cards. Pile cleared. Play again.',
        };
    }
    return { clearPile: false, extraTurn: false, message: '' };
};

const checkForFourOfAKind = (pile) => {
    if (pile.length < 4) return false;
    const lastFour = pile.slice(-4);
    return lastFour.every((card) => card.rank === lastFour[0].rank);
};
