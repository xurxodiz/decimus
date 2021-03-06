const MAX_DICE = 5;
const MAX_REROLLS = 2;
const SUBGAME_DICE = 3;
const WIN_POINTS = 30;

let Alerts = {
    NO_DICE_TO_REROLL: -1,
    NON_POSITIVE_BET: -2
};

let Audios = {
    MUSIC: 1,
    ROLL: 2
};

let Bets = {
    PASS: -1,
    FOLD: -2,
    CHECK: -3
};

let LastAction = {
    NONE_YET: 0,
    USER_PASS: 1,
    RIVAL_PASS: 2,
    USER_RAISE: 3,
    RIVAL_RAISE: 4,
    USER_CHECK: 5,
    RIVAL_CHECK: 6,
    USER_FOLD: 7,
    RIVAL_FOLD: 8,
    NO_GAME: 9,
    USER_NO_GAME: 10,
    RIVAL_NO_GAME: 11,
    USER_WON_CHECK: 12, // these three are resolutions for when displaying results
    RIVAL_WON_CHECK: 13,
    ALREADY_ASSIGNED: 14
}

let Steps = {
    SPLASH: "splash",
    ROLLING: "rolling",
    BETS: "bets",
    RESULTS: "results",
    END_OF_ROUND: "endOfRound",
    FINISH: "finish",
};

let Subgames = {
    BIGGEST: 0,
    SMALLEST: 1,
    ONE_AS_TWO: 2,
    PAIR_PLUS_ACE: 3
};

var game = {
    step: Steps.SPLASH,
    subgame: Subgames.BIGGEST,
    playerDice: [],
    remainingRerolls: 0,
    justRerolled: new Set(),
    selectedDiceKeys: new Set(),
    isPlayerStarting: true,
    playerBet: 0,
    rivalBet: 0,
    playerPoints: 0,
    rivalPoints: 0,
    betsAreSet: false,
    pendingBets: {},
    lastAction: undefined,
    lastBetStanding: 0, // not strictly last bet raised, e.g. after fold, this is the points earned, not rejected
    isFirstBetOfRound: true,
    audioCallback: undefined,
    renderFun: undefined,
    rival: undefined,
    alert: undefined, // used for alerts
    userHasSilenced: true
};


function dismissAlert() {
    game.alert = undefined;
    game.renderFun(game);
};

// Splash step
function beginGame(newRenderFun, rival, audioCallback) {
    game.step = Steps.SPLASH;
    game.audioCallback = audioCallback;
    game.renderFun = newRenderFun;
    game.rival = rival;
    game.playerPoints = 0;
    game.rivalPoints = 0;
    game.isPlayerStarting = true;
    game.lastAction = undefined;
    game.renderFun(game);
};

// Rolling step
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
};

function rollInitialDice() {
    game.audioCallback(Audios.MUSIC);
    game.step = Steps.ROLLING;
    game.selectedDiceKeys.clear();
    game.remainingRerolls = MAX_REROLLS;
    game.justRerolled = new Set();
    for (const x of Array(MAX_DICE).keys()) {
        game.playerDice[x] = rollDie();
        game.justRerolled.add(x);
    }
    game.rival.roll(game);
    game.audioCallback(Audios.ROLL);
    game.renderFun(game);
    game.justRerolled.clear();
};

function rerollDice() {
    if (!game.selectedDiceKeys.size) {
        game.alert = Alerts.NO_DICE_TO_REROLL;
        game.renderFun(game);
        return;
    }

    game.selectedDiceKeys.forEach(x =>
        game.playerDice[x] = rollDie()
    );
    game.remainingRerolls--;
    game.justRerolled = new Set(game.selectedDiceKeys);
    game.selectedDiceKeys.clear();
    game.audioCallback(Audios.ROLL);
    game.renderFun(game);
};

function endRollingStep() {
    game.step = Steps.BETS;
    game.pendingBets = {};
    game.justRerolled = new Set();
    startSubgame(Subgames.BIGGEST);
};

function updateSelectedDie(key, checked) {
    if (checked) {
        game.selectedDiceKeys.add(key);
    } else {
        game.selectedDiceKeys.delete(key);
    }
};

// Bets step
function startSubgame(subgame) {
    game.subgame = subgame;
    game.selectedDiceKeys.clear();
    game.playerBet = 0;
    game.rivalBet = 0;
    game.lastAction = LastAction.NONE_YET;
    game.isFirstBetOfRound = true;
    let playerBestDice = bestDice(subgame, game.playerDice);
    let rivalBestDice = bestDice(subgame, game.rival.dice);
    if (playerBestDice.length == 0 && rivalBestDice.length == 0) {
        game.lastAction = LastAction.NO_GAME;
        game.lastBetStanding = 0;
    } else if (playerBestDice.length == 0) {
        game.lastAction = LastAction.USER_NO_GAME;
        game.lastBetStanding = 1;
        game.rivalPoints += 1;
    } else if (rivalBestDice.length == 0) {
        game.lastAction = LastAction.RIVAL_NO_GAME;
        game.lastBetStanding = 1;
        game.playerPoints += 1;
    } else {
        game.lastAction = LastAction.NONE_YET;
        game.lastBetStanding = 0;
        playerBestDice.forEach(x => game.selectedDiceKeys.add(x));
    }
    game.betsAreSet = game.lastAction != LastAction.NONE_YET;
    if(!game.betsAreSet && !game.isPlayerStarting) {
        rivalBet();
    }
    game.renderFun(game);
};

function betCheck() {
    game.lastAction = LastAction.USER_CHECK;
    game.lastBetStanding = game.rivalBet;
    game.playerBet = game.lastBetStanding;
    game.pendingBets[game.subgame] = game.lastBetStanding;
    game.betsAreSet = true;
    game.renderFun(game);
};

function betFold() {
    game.lastAction = LastAction.USER_FOLD;
    game.lastBetStanding = Math.max(1, game.playerBet);
    game.rivalPoints += game.lastBetStanding;
    game.betsAreSet = true;
    game.renderFun(game);
};

function betPass() {
    if (game.isPlayerStarting) {
        rivalBet();
    } else {
        game.lastAction = LastAction.USER_PASS;
        game.betsAreSet = true;
        game.lastBetStanding = 1;
        game.pendingBets[game.subgame] = 1;
    }
    game.renderFun(game);
};

function betRaise(amount) {
    if (amount < 1) {
        game.alert = Alerts.NON_POSITIVE_BET;
        game.renderFun(game);
        return;
    }
    game.lastAction = LastAction.USER_RAISE;
    game.lastBetStanding = game.rivalBet + amount;
    game.playerBet = game.lastBetStanding;
    game.isFirstBetOfRound = false;
    rivalBet();
    game.renderFun(game);
};

function finishSubgame() {
    let nextSubgame = game.subgame + 1;
    if (nextSubgame < Object.keys(Subgames).length) {
        startSubgame(nextSubgame);
    } else {
        startResults();
    }
};

function rivalBet() {
    let action = game.rival.bet(game);
    switch (action) {
        case Bets.PASS:
            game.lastAction = LastAction.RIVAL_PASS;
            if (game.isPlayerStarting || game.playerBet > 0) {
                game.lastBetStanding = 1;
                game.pendingBets[game.subgame] = 1;
                game.betsAreSet = true;
            }
            break;
        case Bets.FOLD:
            game.lastAction = LastAction.RIVAL_FOLD;
            game.lastBetStanding = Math.max(1, game.rivalBet);
            game.playerPoints += game.lastBetStanding;
            game.betsAreSet = true;
            break;
        case Bets.CHECK:
            game.lastAction = LastAction.RIVAL_CHECK;
            if (game.isPlayerStarting || game.playerBet > 0) {
                game.lastBetStanding = game.playerBet;
                game.rivalBet = game.lastBetStanding;
                game.pendingBets[game.subgame] = game.lastBetStanding;
                game.betsAreSet = true;
            }
            break;
        default:
            game.lastAction = LastAction.RIVAL_RAISE;
            game.lastBetStanding = game.playerBet + action;
            game.rivalBet = game.lastBetStanding;
    }
};

// Results step
function startResults() {
    game.step = Steps.RESULTS;
    calculateResults(Subgames.BIGGEST);
};

function calculateResults(subgame) {
    game.subgame = subgame;
    let pendingBet = game.pendingBets[subgame];
    if (pendingBet) {
        if (determineWinner(subgame, game.playerDice, game.rival.dice, game.isPlayerStarting) == 1) {
            game.lastAction = LastAction.USER_WON_CHECK;
            game.lastBetStanding = pendingBet;
            game.playerPoints += game.lastBetStanding;
        } else {
            game.lastAction = LastAction.RIVAL_WON_CHECK;
            game.lastBetStanding = pendingBet;
            game.rivalPoints += game.lastBetStanding;
        }
    } else {
        game.lastAction = LastAction.ALREADY_ASSIGNED;
    }
    game.selectedDiceKeys.clear();
    let playerBestDice = bestDice(subgame, game.playerDice);
    playerBestDice.forEach(x => game.selectedDiceKeys.add(x));
    game.renderFun(game);
};

function nextResults() {
    let nextSubgame = game.subgame + 1;
    if (nextSubgame < Object.keys(Subgames).length) {
        calculateResults(nextSubgame);
    } else {
        // TODO: Add "reflection" step
        endOfRoundOrFinish();
    }
}

function endOfRoundOrFinish() {
    game.lastAction = undefined;
    game.selectedDiceKeys.clear();
    if (isGameFinished()) {
        game.step = Steps.FINISH;
        game.renderFun(game);
    } else {
        game.step = Steps.END_OF_ROUND;
        game.renderFun(game);
    }
};

function nextRound() {
    game.isPlayerStarting = !game.isPlayerStarting;
    rollInitialDice();
}

function isGameFinished() {
    return game.playerPoints >= WIN_POINTS || game.rivalPoints >= WIN_POINTS
            && !(game.playerPoints == game.rivalPoints);
};

// Dice evaluation
function bestDice(subgame, dice) {
    let indexedDice = dice.map(function(value, index) {
        return {value: value, index: index};
    });
    // ordered from biggest to smallest by value
    indexedDice.sort((a, b) => b.value - a.value);
    switch (subgame) {
        case Subgames.BIGGEST:
            return bestDiceBiggest(indexedDice);
        case Subgames.SMALLEST:
            return bestDiceSmallest(indexedDice);
        case Subgames.ONE_AS_TWO:
            return bestDiceOneAsTwo(indexedDice);
        case Subgames.PAIR_PLUS_ACE:
            return bestDicePairPlusAce(indexedDice);
    }
};

function bestDiceBiggest(dice) {
    return dice.slice(0, SUBGAME_DICE).map(x => x.index);
};

function bestDiceSmallest(dice) {
    return dice.slice(-SUBGAME_DICE).map(x => x.index);
};

function bestDiceOneAsTwo(dice) {
    // start from third smallest die and grow bigger
    for (let i = MAX_DICE-3; i >= 0; i--) {
        // on each, go towards the smallest end adding pairs
        for (let j = i+1; j < MAX_DICE; j++) {
            for (let k = j+1; k < MAX_DICE; k++) {
                if (dice[i].value == dice[j].value + dice[k].value) {
                    return [dice[i].index, dice[j].index, dice[k].index];
                }
            }
        }
    };
    return [];
};

function bestDicePairPlusAce(dice) {
    // only proceed if there's at least one ace
    if (dice[dice.length-1].value == 1) {
        for (let i = 0; i < MAX_DICE; i++) {
            if (i == dice.length - 2) {
                // we are about to compare something to the last ace
                // and the last ace can't be part of the pair
                break;
            }
            if (dice[i].value == dice[i+1].value) {
                return [dice[dice.length-1].index, dice[i].index, dice[i+1].index]
            }
        }
    }
    return [];
};

function determineWinner(subgame, dice1, dice2, firstPlayerWinsTies) {
    let bestDice1 = bestDice(subgame, dice1);
    let bestDiceSum1 = bestDice1.reduce((acc, val) => acc + dice1[val], 0);
    let bestDice2 = bestDice(subgame, dice2);
    let bestDiceSum2 = bestDice2.reduce((acc, val) => acc + dice2[val], 0);
    switch (subgame) {
        case Subgames.BIGGEST:
        case Subgames.PAIR_PLUS_ACE:
            // Bigger = better
            if (bestDiceSum1 == 0 && bestDiceSum2 == 0) {
                // No game
                return 0
            } else if (bestDiceSum1 == bestDiceSum2) {
                return firstPlayerWinsTies ? 1 : -1;
            } else if (bestDiceSum1 > bestDiceSum2) {
                return 1;
            } else {
                return -1;
            }
        case Subgames.SMALLEST:
        case Subgames.ONE_AS_TWO:
            // Bigger = better
            if (bestDiceSum1 == 0 && bestDiceSum2 == 0) {
                // No game
                return 0
            } else if (bestDiceSum1 == bestDiceSum2) {
                return firstPlayerWinsTies ? 1 : -1;
            } else if (bestDiceSum1 > 0 && bestDiceSum1 < bestDiceSum2) {
                return 1;
            } else {
                return -1;
            }
    }
};


function playAgain() {
    beginGame(game.renderFun, game.rival, game.audioCallback);
}

function enableUserHasSilenced() {
    game.userHasSilenced = true;
    game.renderFun(game);
}

function disableUserHasSilenced() {
    game.userHasSilenced = false;
    game.renderFun(game);
}

function setUserHasSilenced(value) {
    game.userHasSilenced = value;
    game.renderFun(game);
}

function readUserHasSilenced() {
    return game.userHasSilenced;
}

// Exports
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Don't export module for the browser
    module.exports = {
        // Enums
        Bets: Bets,
        LastAction: LastAction,
        Steps: Steps,
        Subgames: Subgames,
        // Objects
        game: game,
        // Functions
        beginGame: beginGame,
        bestDice: bestDice,
        betCheck: betCheck,
        betFold: betFold,
        betPass: betPass,
        betRaise: betRaise,
        determineWinner: determineWinner,
        dismissAlert: dismissAlert,
        endRollingStep: endRollingStep,
        finishSubgame: finishSubgame,
        nextResults: nextResults,
        nextRound: nextRound,
        playAgain: playAgain,
        rerollDice: rerollDice,
        rollInitialDice: rollInitialDice,
        startSubgame: startSubgame,
        updateSelectedDie: updateSelectedDie,
        // Audio functions
        enableUserHasSilenced: enableUserHasSilenced,
        disableUserHasSilenced: disableUserHasSilenced,
        setUserHasSilenced: setUserHasSilenced,
        readUserHasSilenced: readUserHasSilenced
    };
}
