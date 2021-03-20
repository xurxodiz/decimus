const MAX_AI_DICE = 5;
const MAX_AI_ROLLS = 3;
const SIMULATION_RUNS = 100;

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
    console.log("Rolling");
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
    let smallRaise = Math.floor(Math.random() * 2) + 1; // bet in [1,2]
    let bigRaise = Math.floor(Math.random() * 4) + 3; // bet in [3,6]
    let subgame = game.subgame;
    let winRate = game.rival.winRate[subgame];
    if (winRate > 0.9) {
        return bigRaise;
    } else if (winRate > 0.75) {
        if (game.playerBet > 2) {
            return Bets.CHECK;
        } else {
            return smallRaise;
        }
    } else if (winRate > 0.4 && game.playerBet <= 2) {
        return Bets.CHECK;
    } else if (game.playerBet <= 1) {
        return Bets.CHECK;
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

function rollDice() {
    return [...Array(MAX_AI_DICE).keys()].map(x => Math.floor(Math.random() * 6) + 1);
};