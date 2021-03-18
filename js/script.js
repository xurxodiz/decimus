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
    let indexedDice = dice.map(function(value, index) {
        return {value: value, index: index};
    });
    // ordered from biggest to smallest by value
    indexedDice.sort((a, b) => b.value - a.value);
    switch(subgame) {
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
    for (var i = MAX_DICE-3; i >= 0; i--) {
        // on each, go towards the smallest end adding pairs
        for (var j = i+1; j < MAX_DICE; j++) {
            for (var k = j+1; k < MAX_DICE; k++) {
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
        for (var i = 0; i < MAX_DICE; i++) {
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
