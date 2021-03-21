const MAX_AI_DICE = 5;
const MAX_AI_ROLLS = 3;
const SIMULATION_RUNS = 1000;

function initializeAI() {
    return {
        bet: betFunction,
        roll: rollFunction
    };
};

function rollFunction(game) {
    // AI rolls all dice N times and keeps the best dice
    // (this is different from the player rolling rules
    // but should give similar results).
    let bestChance = 0;
    let bestDice = [];
    let bestWinRate = [];
    for (let x = 0; x < MAX_AI_ROLLS; x++) {
        let candidateDice = rollDice();
        let winRate = calculateWinRate(candidateDice);
        let candidateChance = winRate.reduce((acc, val) => acc + val);
        if (candidateChance > bestChance) {
            bestChance = candidateChance;
            bestDice = candidateDice;
            bestWinRate = winRate;
        }
    }
    game.rival.dice = bestDice;
    game.rival.winRate = bestWinRate;
};

function betFunction(game) {
    let smallRaise = game.rivalBet == 0 ? 2 : Math.floor(Math.random() * 2) + 1; // bet in [1,2]
    let bigRaise = Math.floor(Math.random() * 4) + 3; // bet in [3,6]
    let diffPoints = game.playerPoints - game.rivalPoints;
    let subgame = game.subgame;
    let winRate = game.rival.winRate[subgame];
    if (foldWillLose(game) || (game.playerPoints >= WIN_POINTS && diffPoints > 0)) {
        // Player is winning, we need to play risky
        return diffPoints + 5;
    } else if (game.playerPoints < WIN_POINTS
            && game.playerBet + game.playerPoints >= WIN_POINTS
            && winRate <= 0.75) {
        // The player might win the match, fold if not sure
        return Bets.FOLD;
    } else if (winRate > 0.99) {
        return bigRaise;
    } else if (winRate > 0.9) {
        if (game.playerBet > 9) {
            return Bets.CHECK;
        } else {
            return bigRaise;
        }
    } else if (winRate > 0.75) {
        if (game.playerBet > 2) {
            return Bets.CHECK;
        } else {
            return smallRaise;
        }
    } else if (winRate > 0.4 && game.playerBet <= 2) {
        return passOrCheck(game);
    } else if (game.playerBet <= 1) {
        return passOrCheck(game);
    }
    return Bets.FOLD;
};

function calculateWinRate(candidateDice) {
    let winRate = [];
    $.each(Subgames, function(name, subgame) {
        let subgameWins = 0;
        for (let r = 0; r < SIMULATION_RUNS; r++) {
            let winner = determineWinner(subgame, rollDice(), candidateDice);
            if(winner == -1) {
                subgameWins++;
            }
        }
        winRate[subgame] = subgameWins/SIMULATION_RUNS;
    });
    return winRate;
};

function foldWillLose(game) {
    const pointsInPlay = Math.max(1, game.rivalBet);
    const potentialPoints = pointsInPlay + game.playerPoints;
    return potentialPoints >= WIN_POINTS && potentialPoints >= game.rivalPoints;
};

function passOrCheck(game) {
    if (game.lastAction == LastAction.NONE_YET || game.lastAction == LastAction.USER_PASS) {
        return Bets.PASS;
    } else {
        return Bets.CHECK;
    }
};

function rollDice() {
    return [...Array(MAX_AI_DICE).keys()].map(x => Math.floor(Math.random() * 6) + 1);
};
