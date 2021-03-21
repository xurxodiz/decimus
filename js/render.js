let gameTemplate = undefined;

function begin() {
    let rival = initializeAI();
    beginGame(render, rival, audioCallback);
};

function render(game) {
    if (!gameTemplate) {
        fetch('templates/game.mustache')
            .then((response) => response.text())
            .then((template) => {
                gameTemplate = template;
                render(game);
            });
        return;
    }
    let isFirstBet = game.lastAction == LastAction.NONE_YET ||
                        (game.lastAction == LastAction.RIVAL_PASS && !game.isPlayerStarting)
    let gameToRender = {
        screen: game.step,
        stepSplash: game.step == Steps.SPLASH,
        stepBets: game.step == Steps.BETS,
        stepRolling: game.step == Steps.ROLLING,
        stepResults: game.step == Steps.RESULTS,
        stepEndOfRound: game.step == Steps.END_OF_ROUND,
        stepFinish: game.step == Steps.FINISH,
        playerScorePoints: game.playerPoints,
        rivalScorePoints: game.rivalPoints,
        canReroll: game.remainingRerolls > 0,
        isFirstBet: isFirstBet,
        betsAreSet: game.betsAreSet,
        userHasSilenced: game.userHasSilenced,
        text: {...TEXT,
            calcExplanationBox: getExplanationText(game.step, game.subgame),
            calcInfoBox: getInfoText(game),
            calcRaiseButton: getRaiseButtonText(game.lastAction),
            calcAlertPop: getAlertText(game.alert)
        }
    };
    gameToRender.playerDice = game.playerDice.map(function(x, i) {
        let selected = game.selectedDiceKeys.has(i);
        let rerolled = game.justRerolled.has(i);
        return {key: i, value: x, rerolled: rerolled, selected: selected};
    });
    if (game.step == Steps.RESULTS) {
        let rivalDice = game.rival.dice;
        let selectedRivalDice = new Set(bestDice(game.subgame, rivalDice));
        gameToRender.rivalDice = rivalDice.map(function(x, i) {
            let selected = selectedRivalDice.has(i);
            return {key: i, value: x, selected: selected};
        });
    }
    let rendered = Mustache.render(gameTemplate, gameToRender);
    $('#canvas').html(rendered);
};

function getInfoText(game) {
    switch (game.step) {
        case Steps.SPLASH: return TEXT.infoSplash;
        case Steps.ROLLING: return TEXT.infoRolling;
        case Steps.BETS:
            switch (game.lastAction) {
                case LastAction.NONE_YET: return TEXT.currentBetNoneYet;
                case LastAction.USER_PASS: return $.validator.format(TEXT.currentBetUserPass, [game.lastBetStanding]);
                case LastAction.RIVAL_PASS:
                    if (game.isPlayerStarting) {
                        return $.validator.format(TEXT.currentBetRivalPassSecond, [game.lastBetStanding]);
                    } else {
                        return TEXT.currentBetRivalPassFirst;
                    }
                case LastAction.USER_RAISE: return $.validator.format(TEXT.currentBetUserRaise, [game.lastBetStanding]);
                case LastAction.RIVAL_RAISE: return $.validator.format(TEXT.currentBetRivalRaise,
                    [((game.isFirstBetOfRound)? TEXT.currentBetRivalRaiseBet : TEXT.currentBetRivalRaiseRaise),
                     game.lastBetStanding]);
                case LastAction.USER_CHECK: return $.validator.format(TEXT.currentBetUserCheck, [game.lastBetStanding]);
                case LastAction.RIVAL_CHECK: return $.validator.format(TEXT.currentBetRivalCheck, [game.lastBetStanding]);
                case LastAction.USER_FOLD: return $.validator.format(TEXT.currentBetUserFold, [game.lastBetStanding]);
                case LastAction.RIVAL_FOLD: return $.validator.format(TEXT.currentBetRivalFold, [game.lastBetStanding]);
                case LastAction.NO_GAME: return TEXT.currentBetNoGame;
                case LastAction.USER_NO_GAME: return $.validator.format(TEXT.currentBetUserNoGame, [game.lastBetStanding]);
                case LastAction.RIVAL_NO_GAME: return $.validator.format(TEXT.currentBetRivalNoGame, [game.lastBetStanding]);
            }
        case Steps.RESULTS:
            switch (game.lastAction) {
                case LastAction.USER_WON_CHECK: return $.validator.format(TEXT.currentBetUserWonCheck, [game.lastBetStanding]);
                case LastAction.RIVAL_WON_CHECK: return $.validator.format(TEXT.currentBetRivalWonCheck, [game.lastBetStanding]);
                case LastAction.ALREADY_ASSIGNED: return TEXT.currentBetAlreadyAssigned;
            }
        case Steps.END_OF_ROUND: return TEXT.infoEndOfRound;
        case Steps.FINISH:
            switch (Math.sign(game.playerPoints-game.rivalPoints)) {
                case  1: return TEXT.playerWon;
                case  0: return TEXT.tie;
                case -1: return TEXT.rivalWon
            }
    }

}

function subgameToText(subgame) {
    switch (subgame) {
        case Subgames.BIGGEST: return TEXT.subgameBiggest;
        case Subgames.SMALLEST: return TEXT.subgameSmallest;
        case Subgames.ONE_AS_TWO: return TEXT.subgameOneAsTwo;
        case Subgames.PAIR_PLUS_ACE: return TEXT.subgamePairPlusAce;
    }
}

function getRaiseButtonText(lastAction) {
    return (lastAction == LastAction.NONE_YET || lastAction == LastAction.RIVAL_PASS)? TEXT.betButton : TEXT.raiseButton;
}

function getExplanationText(step, subgame) {
    switch (step) {
        case Steps.SPLASH: return TEXT.explanationSplash;
        case Steps.ROLLING: return TEXT.explanationRolling;
        case Steps.BETS:
            switch (subgame) {
                case Subgames.BIGGEST: return TEXT.explanationBiggest;
                case Subgames.SMALLEST: return TEXT.explanationSmallest;
                case Subgames.ONE_AS_TWO: return TEXT.explanationOneAsTwo;
                case Subgames.PAIR_PLUS_ACE: return TEXT.explanationPairPlusAce;
            }
        case Steps.RESULTS: return $.validator.format(TEXT.explanationResults, [subgameToText(subgame)]);
        case Steps.END_OF_ROUND: return TEXT.explanationEndOfRound;
        case Steps.FINISH: return TEXT.explanationFinish;
    }
}

function getAlertText(alert) {
    switch (alert) {
        case Alerts.NO_DICE_TO_REROLL: return TEXT.alertNoDiceToReroll;
        case Alerts.NON_POSITIVE_BET: return TEXT.nonPositiveBet;
        default: return "";
    }
}