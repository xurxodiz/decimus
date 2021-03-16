const MAX_DICE = 5;
const MAX_REROLLS = 2;

var game = {
    "playerDice": [],
    "remainingRerolls": 0,
    "selectedDiceKeys": new Set()
};

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
};

function rollInitialDice() {
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
    console.log("Rematada a fase de tiradas");
};

function updateSelectedDie(key, checked) {
    if (checked) {
        game.selectedDiceKeys.add(key);
    } else {
        game.selectedDiceKeys.delete(key);
    }
};