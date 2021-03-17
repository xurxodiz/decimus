const MAX_DICE = 5;
const MAX_REROLLS = 2;
const SUBGAME_DICE = 3;

let Steps = {
    SPLASH: "splash",
    ROLLING: "rolling",
    BETS: "bets",
    RESULT: "result"
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
    selectedDiceKeys: new Set()
};

// Splash step
function begin() {
    renderGame(game);
};

// Rolling step
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
};

function rollInitialDice() {
    game.step = Steps.ROLLING,
    game.selectedDiceKeys.clear();
    game.remainingRerolls = MAX_REROLLS;
    for (const x of Array(MAX_DICE).keys()) {
        game.playerDice[x] = rollDie();
    }
    renderGame(game);
};

function rerollDice() {
    if (!game.selectedDiceKeys.size) {
        alert("Escolle os dados para rolar");
        return;
    }

    game.selectedDiceKeys.forEach(x =>
        game.playerDice[x] = rollDie()
    );
    game.remainingRerolls--;
    game.selectedDiceKeys.clear();
    renderGame(game);

    if (game.remainingRerolls == 0) {
        endRollPhase();
    }
};

function endRollPhase() {
    game.step = Steps.BETS;
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
    bestDice(subgame, game.playerDice).forEach(x =>
        game.selectedDiceKeys.add(x)
    );
    renderGame(game);
};

function finishSubgame() {
    let nextSubgame = game.subgame + 1;
    if (nextSubgame < Object.keys(Subgames).length) {
        startSubgame(nextSubgame);
    } else {
        // nextPhase
    }
};

function bestDice(subgame, dice) {
    switch(subgame) {
        case Subgames.BIGGEST:
            return bestDiceBiggest(dice);
        case Subgames.SMALLEST:
            return bestDiceSmallest(dice);
        case Subgames.ONE_AS_TWO:
            return bestDiceOneAsTwo(dice);
        case Subgames.PAIR_PLUS_ACE:
            return bestDicePairPlusAce(dice);
    }
};

function bestDiceBiggest(dice) {
    let indexedDice = dice.map(function(value, index) {
        return {value: value, index: index};
    });
    indexedDice.sort((a, b) => b.value - a.value);
    return indexedDice.slice(0, SUBGAME_DICE).map(x => x.index);
};

function bestDiceSmallest(dice) {
    let indexedDice = dice.map(function(value, index) {
        return {value: value, index: index};
    });
    indexedDice.sort((a, b) => a.value - b.value);
    return indexedDice.slice(0, SUBGAME_DICE).map(x => x.index);
};

function bestDiceOneAsTwo(dice) {
    for (var i = 0; i < MAX_DICE; i++) {
        if (dice[i] < 2) {
            continue;
        }
        for (var j = 0; j < MAX_DICE; j++) {
            if (j == i || dice[j] >= dice[i]) {
                continue;
            }
            for (var k = 0; k < MAX_DICE; k++) {
                if (k == i || k == j) {
                    continue;
                }
                if (dice[i] == dice[j] + dice[k]) {
                    return [i, j, k];
                }
            }
        }
    };
    return [];
};

function bestDicePairPlusAce(dice) {
    var result = [];
    for (var i = 0; i < MAX_DICE; i++) {
        if (dice[i] != 1) {
            continue;
        }
        for (var j = 0; j < MAX_DICE; j++) {
            if (j == i) {
                continue;
            }
            for (var k = 0; k < MAX_DICE; k++) {
                if (k == i || k == j) {
                    continue;
                }
                if (dice[k] == dice[j] && (result.length == 0 ||  dice[k] > dice[result[1]])) {
                    result = [i, j, k];
                }
            }
        }
    };
    return result;
};