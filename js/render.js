function renderGame(game) {
    fetch('templates/game.mustache')
        .then((response) => response.text())
        .then((template) => {
            var gameToRender = {
                "canReroll": game.remainingRerolls > 0
            };
            gameToRender.playerDice = game.playerDice.map(function(x, i) {
                return {"key": i, "value": x};
            });
            var rendered = Mustache.render(template, gameToRender);
            $('#game').html(rendered);
        });
};