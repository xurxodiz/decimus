function begin() {
    beginGame(render);
};

function render(what) {
    if (typeof(what) == "string") {
        alert(what);
        return;
    }
    let game = what;
    fetch('templates/game.mustache')
        .then((response) => response.text())
        .then((template) => {
            let gameToRender = {
                canReroll: game.remainingRerolls > 0 && game.step == Steps.ROLLING,
                screen: game.step,
                betsAreSet: game.step == Steps.BETS, // TODO: Only when bets are final
                diceNotAcknowledgedYet: game.step == Steps.ROLLING
            };
            gameToRender.playerDice = game.playerDice.map(function(x, i) {
                let selected = game.selectedDiceKeys.has(i);
                return {key: i, value: x, selected: selected};
            });
            let rendered = Mustache.render(template, gameToRender);
            $('#canvas').html(rendered);
        });
};
