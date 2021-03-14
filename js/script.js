const MAX_REROLLS = 2;
const DICE_ICONS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
};

function rollDice(dice) {
    dice.html(function (i, el) {
        return DICE_ICONS[rollDie() - 1];
    });
} 

function rollInitialDice() {
    $('#divDice').show();
    $('#btnInitialThrow').hide();
    $('input.checkDie').prop('checked', false);
    var dice = $('label.labelDie');
    rollDice(dice);
};

function rerollDice() {
    var checkboxes = $('input.checkDie:checked');
    if (!checkboxes.length) {
        alert("Escolle os dados para rolar");
        return;
    }
    var dice = $('input.checkDie:checked + label');
    rollDice(dice);

    var rerollButton = $('#btnReroll');
    var newRerolls = parseInt(rerollButton.data('times') + 1);
    rerollButton.data('times', newRerolls);
    if (newRerolls == MAX_REROLLS) {
        endRollPhase();
    }
};

function endRollPhase() {
    $('#btnReroll').hide();
    $('#btnEndRolls').hide();
    $('input.checkDie').hide();
    $('input.checkDie').prop('checked', false);
    alert("Rematada a fase de tiradas");
};
