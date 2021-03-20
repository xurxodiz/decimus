function begin() {
    let rival = initializeAI();
    beginGame(render, rival);
};

function render(game) {
    fetch('templates/game.mustache')
        .then((response) => response.text())
        .then((template) => {
            let gameToRender = {
                screen: game.step,
                stepSplash: game.step == Steps.SPLASH,
                stepBets: game.step == Steps.BETS,
                stepRolling: game.step == Steps.ROLLING,
                canReroll: game.remainingRerolls > 0,
                isFirstBet: game.lastAction == LastAction.NONE_YET,
                betsAreSet: game.betsAreSet,
                currentBetText: getCurrentBetText(game.lastAction),
                explanationText: getExplationText(game.step, game.subgame),
                raiseText: getRaiseText(game.lastAction),
                alert: game.alert
            };
            gameToRender.playerDice = game.playerDice.map(function(x, i) {
                let selected = game.selectedDiceKeys.has(i);
                return {key: i, value: x, selected: selected};
            });
            let rendered = Mustache.render(template, gameToRender);
            $('#canvas').html(rendered);
        });
};

function getCurrentBetText(lastAction) {
    switch (lastAction) {
        case LastAction.NONE_YET: return "tócache apostar";
        case LastAction.USER_PASS: return "pasaches, levou " + game.lastBetStanding;
        case LastAction.RIVAL_PASS: return "pasou, levaches " + game.lastBetStanding;
        case LastAction.USER_RAISE: return "subiches a " + game.lastBetStanding;
        case LastAction.RIVAL_RAISE: return "subiuche a " + game.lastBetStanding;
        case LastAction.USER_CHECK: return "quedan a ver " + game.lastBetStanding;
        case LastAction.RIVAL_CHECK: return "quedan a ver " + game.lastBetStanding;
        case LastAction.USER_FOLD: return "pasaches, levou " + game.lastBetStanding;
        case LastAction.RIVAL_FOLD: return "pasou, levaches " + game.lastBetStanding;
        case LastAction.NO_GAME: return "non hai xogo";
        case LastAction.USER_NO_GAME: return "non tes xogo, levou " + game.lastBetStanding;
        case LastAction.RIVAL_NO_GAME: return "non ten xogo, levaches " + game.lastBetStanding;
    }
}

function getRaiseText(lastAction) {
    return (lastAction == LastAction.NONE_YET)? "Apostar" : "Subir";
}

function getExplationText(step, subgame) {
    switch (step) {
        case Steps.SPLASH: return "Dámosche a benvida a DECIMUS, o xogo de dados retromedieval!";
        case Steps.ROLLING: return "Tes dúas oportunidades de rolar de novo tantos dados como queiras.";
        case Steps.BETS:
            switch (subgame) {
                case Subgames.BIGGEST: return "En MAIORES contan os dados con maior valor.";
                case Subgames.SMALLEST: return "En MENORES contan os dados con menor valor.";
                case Subgames.ONE_AS_TWO: return "En TANTO EN UN COMO EN DOUS conta ter os dados máis pequenos tal que dous sumen o do outro.";
                case Subgames.PAIR_PLUS_ACE: return "En PAR E AS conta a maior parella acompañada de as que teñas.";
            }
        case Steps.RESULTS: return "Velaquí o resultado das túas apostas.";
    }
}