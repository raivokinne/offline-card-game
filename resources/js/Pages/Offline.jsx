import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPECIAL_RANKS } from '@/utils/constants';
import { createDeck, createPlayer, dealCards } from '@/utils/deck';
import {
    botPlay,
    checkForFourOfAKind,
    getValidMoves,
    shouldClearPile,
} from '@/utils/game';
import { AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
                'Your turn. Click a card then press Enter to play or Space to play all matching cards.',
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

                if (shouldClearPile(cardToPlay, newPile)) {
                    newState.pile = [];
                    newState.message = SPECIAL_RANKS.CLEAR_PILE.includes(
                        cardToPlay.rank,
                    )
                        ? `You played a ${cardToPlay.rank}. Pile cleared. Play again.`
                        : 'Four identical cards. Pile cleared. Play again.';
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

                if (shouldClearPile(cardPlayed, newPile)) {
                    newState.pile = [];
                    newState.message = SPECIAL_RANKS.CLEAR_PILE.includes(
                        cardPlayed.rank,
                    )
                        ? `Bot played a ${cardPlayed.rank}. Pile cleared. Bot plays again.`
                        : 'Bot played four identical cards. Pile cleared. Bot plays again.';
                    setTimeout(() => botTurn(), 1000);
                } else {
                    newState.pile = newPile;
                    newState.currentPlayer = 'player';
                    newState.message = 'Your turn.';
                }

                if (newState.deck.length > 0 && newState.bot.hand.length < 3) {
                    newState.bot.hand.push(newState.deck.pop());
                }

                if (checkWinCondition(newState.bot)) {
                    newState.gameOver = true;
                    newState.message = 'Game over. Bot wins!';
                }
            } else {
                newState.currentPlayer = 'player';
                newState.message = 'Bot has no valid moves. Your turn.';
            }

            return newState;
        });
    }, [gameState.bot]);

    const handleMultipleCardPlay = useCallback(
        (matchingIndices) => {
            if (!gameState.selectedCard || !gameState.player) return;

            setGameState((prev) => {
                const newState = { ...prev };
                const { player, pile, deck } = newState;
                const { rank } = gameState.selectedCard.card;

                const indices = [...matchingIndices].sort((a, b) => b - a);
                const cardsToPlay = indices.map((idx) => player.hand[idx]);

                indices.forEach((idx) => {
                    player.hand.splice(idx, 1);
                });

                const newPile = [...pile, ...cardsToPlay];

                if (
                    SPECIAL_RANKS.CLEAR_PILE.includes(rank) ||
                    checkForFourOfAKind(newPile)
                ) {
                    newState.pile = [];
                    newState.message = SPECIAL_RANKS.CLEAR_PILE.includes(rank)
                        ? `You played a ${rank}. Pile cleared. Play again.`
                        : 'Four identical cards. Pile cleared. Play again.';
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
        [gameState.selectedCard, botTurn],
    );

    const playCard = useCallback(
        (cardIndex, from = 'hand') => {
            if (
                gameState.currentPlayer !== 'player' ||
                !gameState.player ||
                !gameState.validMoves
            )
                return;

            if (from === 'hand' && gameState.validMoves.hand.length > 0) {
                const move = gameState.validMoves.hand[cardIndex];
                if (move?.valid) {
                    handleCardPlay(move.card, cardIndex, from);
                } else {
                    setGameState((prev) => ({
                        ...prev,
                        message: 'Invalid move. Select another card.',
                    }));
                }
            } else if (
                from === 'faceUp' &&
                gameState.validMoves.faceUp.length > 0
            ) {
                const move = gameState.validMoves.faceUp[cardIndex];
                if (move?.valid) {
                    handleCardPlay(move.card, cardIndex, from);
                } else {
                    setGameState((prev) => ({
                        ...prev,
                        message: 'Invalid move. Select another card.',
                    }));
                }
            } else if (from === 'faceDown' && gameState.validMoves.faceDown) {
                const cardToPlay = gameState.player.faceDown[cardIndex];
                handleCardPlay(cardToPlay, cardIndex, from);
            } else {
                setGameState((prev) => ({
                    ...prev,
                    message: 'You must play all cards from your hand first!',
                }));
            }
        },
        [gameState, handleCardPlay],
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState.currentPlayer !== 'player' || !gameState.selectedCard)
                return;

            if (e.code === 'Enter') {
                playCard(
                    gameState.selectedCard.index,
                    gameState.selectedCard.from,
                );
            } else if (e.code === 'Space') {
                if (gameState.selectedCard.from === 'hand') {
                    const rank = gameState.selectedCard.card.rank;
                    const matchingIndices = gameState.player.hand
                        .map((card, idx) => (card.rank === rank ? idx : null))
                        .filter((x) => x !== null);
                    if (matchingIndices.length > 1) {
                        handleMultipleCardPlay(matchingIndices);
                    } else {
                        playCard(
                            gameState.selectedCard.index,
                            gameState.selectedCard.from,
                        );
                    }
                } else {
                    playCard(
                        gameState.selectedCard.index,
                        gameState.selectedCard.from,
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, handleMultipleCardPlay, playCard]);

    const checkWinCondition = (playerState) => {
        return (
            playerState.hand.length === 0 &&
            playerState.faceUp.length === 0 &&
            playerState.faceDown.length === 0
        );
    };

    const handleCardSelection = (card, index, from) => {
        if (gameState.currentPlayer !== 'player') return;

        if (
            gameState.selectedCard &&
            gameState.selectedCard.index === index &&
            gameState.selectedCard.from === from
        ) {
            playCard(index, from);
        } else {
            setGameState((prev) => ({
                ...prev,
                selectedCard: { card, index, from },
            }));
        }
    };

    const renderCard = (card, index, from) => {
        const isSelected =
            gameState.selectedCard &&
            gameState.selectedCard.index === index &&
            gameState.selectedCard.from === from;
        const isValid =
            gameState.validMoves &&
            gameState.validMoves[from] &&
            gameState.validMoves[from][index]?.valid;

        return (
            <div
                key={index}
                className={`relative m-1 flex h-24 w-16 cursor-pointer items-center justify-center rounded-lg border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'} ${isValid ? 'hover:border-green-500' : ''} ${gameState.currentPlayer === 'player' ? 'hover:border-blue-300' : ''} bg-white shadow-sm transition-all duration-200 hover:shadow-md ${SPECIAL_RANKS.CLEAR_PILE.includes(card?.rank) ? 'bg-blue-50' : ''}`}
                onClick={() => {
                    if (gameState.currentPlayer === 'player') {
                        handleCardSelection(card, index, from);
                    }
                }}
            >
                {card && (
                    <>
                        <span
                            className={`text-xl font-semibold ${
                                card.suit === '♥' || card.suit === '♦'
                                    ? 'text-red-500'
                                    : 'text-black'
                            }`}
                        >
                            {card.rank}
                            <span className="text-2xl">{card.suit}</span>
                        </span>
                        {SPECIAL_RANKS.CLEAR_PILE.includes(card.rank) && (
                            <div className="absolute -right-2 -top-2">
                                <Info className="h-4 w-4 text-blue-500" />
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    if (!gameState.player || !gameState.bot) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="mx-auto max-w-4xl">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Shithead Card Game</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startNewGame}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            New Game
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {gameState.gameOver ? (
                        <div className="text-center">
                            <p className="mb-4 text-xl font-semibold">
                                {gameState.message}
                            </p>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-center justify-center space-y-8">
                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
                                <AlertCircle className="h-5 w-5 text-blue-500" />
                                <p className="font-medium text-blue-700">
                                    {gameState.message}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700">
                                    Bot's Cards
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap">
                                        {gameState.bot.faceUp.map(
                                            (card, index) =>
                                                renderCard(
                                                    card,
                                                    index,
                                                    'faceUp',
                                                ),
                                        )}
                                    </div>
                                    <div className="flex flex-wrap">
                                        {Array(gameState.bot.hand.length)
                                            .fill(null)
                                            .map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="m-1 h-24 w-16 rounded-lg bg-gray-200"
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700">
                                    Current Pile
                                </h3>
                                <div className="flex flex-wrap">
                                    {gameState.pile
                                        .slice(-4)
                                        .map((card, index) =>
                                            renderCard(card, index, 'pile'),
                                        )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700">
                                    Your Cards
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap">
                                        {gameState.player.hand.map(
                                            (card, index) =>
                                                renderCard(card, index, 'hand'),
                                        )}
                                    </div>
                                    <div className="flex flex-wrap">
                                        {gameState.player.faceUp.map(
                                            (card, index) =>
                                                renderCard(
                                                    card,
                                                    index,
                                                    'faceUp',
                                                ),
                                        )}
                                    </div>
                                    <div className="flex flex-wrap">
                                        {gameState.player.faceDown.map(
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className="m-1 h-24 w-16 cursor-pointer rounded-lg bg-gray-300 transition-all duration-200 hover:bg-gray-400"
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

                            <div className="mt-4 space-y-2">
                                <h3 className="font-semibold text-gray-700">
                                    Game Controls
                                </h3>
                                <div className="rounded-lg bg-gray-100 p-4">
                                    <p className="text-sm text-gray-600">
                                        • Press{' '}
                                        <span className="font-mono">Enter</span>{' '}
                                        to play the selected card
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        • Press{' '}
                                        <span className="font-mono">Space</span>{' '}
                                        to play all matching cards from hand
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <h3 className="font-semibold text-gray-700">
                                    Special Cards
                                </h3>
                                <div className="rounded-lg bg-gray-100 p-4">
                                    <p className="text-sm text-gray-600">
                                        • 10 can be played on any card clears
                                        the pile
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        • 6 can be played on any card any card
                                        can be placed on
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        • Playing four cards of the same rank
                                        clears the pile
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        • Jack can be played on any card when
                                        it's your last card
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
