let js = require('./game.js');

let nextRivalBet = undefined;
let rival = {
    bet: function(x) { return nextRivalBet; },
    dice: [1,2,3,4,5]
};

const mockRenderFun = jest.fn();
beforeEach(() => { js.beginGame(mockRenderFun, rival); });

test('game starts on splash step', () => {
    expect(js.game.step).toBe(js.Steps.SPLASH);
});

describe('on the rolling step', () => {
    beforeEach(() => { js.rollInitialDice(); });

    test('game is on rolling step', () => {
        expect(js.game.step).toBe(js.Steps.ROLLING);
    });

    test('player has five dice', () => {
        expect(js.game.playerDice).toHaveLength(5);
    });

    js.game.playerDice.forEach(function(x, i) {
        test('dice ' + i + ' > 0', () => {
            expect(x).toBeGreaterThan(0);
        });

        test('dice ' + i + ' < 7', () => {
            expect(x).toBeLessThan(7);
        });
    });

    test('player can reroll twice', () => {
        expect(js.game.remainingRerolls).toBe(2);
    });

    test('rerolling 0 dice doesn\'t count', () => {
        js.rerollDice();
        expect(js.game.remainingRerolls).toBe(2);
    });


    describe('when rerolling four dice', () => {
        const lastDie = 4;
        let previousDice;
        beforeEach(() => {
            previousDice = js.game.playerDice.map(x => x);
            js.game.playerDice.forEach((x,i) => js.updateSelectedDie(i, true));
            js.updateSelectedDie(lastDie, false);
            js.rerollDice();
        });

        test('they might change', () => {
            // 1 in 1296 chance of this failing ¯\_(ツ)_/¯
            expect(js.game.playerDice).not.toEqual(previousDice);
        });

        test('the fifth one remains unchanged', () => {
            expect(js.game.playerDice[lastDie]).toBe(previousDice[lastDie]);
        });

        test('player can reroll once more', () => {
            expect(js.game.remainingRerolls).toBe(1);
        });

        test('all dice are unselected', () => {
            expect(js.game.selectedDiceKeys.size).toBe(0);
        });

        describe('after rerolling once more', () => {
            beforeEach(() => {
                js.updateSelectedDie(0, true);
                js.rerollDice();
            });

            test('player can no longer reroll', () => {
                expect(js.game.remainingRerolls).toBe(0);
            });
        });
    });
});

describe('on the bets step', () => {
    beforeEach(() => {
        js.rollInitialDice();
        js.endRollingStep();
    });

    test('starts on the biggest subgame', () => {
        expect(js.game.subgame).toBe(js.Subgames.BIGGEST);
    });

    describe('after biggest subgame', () => {
        beforeEach(() => { js.finishSubgame(); });

        test('continues to the smallest subgame', () => {
            expect(js.game.subgame).toBe(js.Subgames.SMALLEST);
        });

        describe('after smallest subgame', () => {
            beforeEach(() => { js.finishSubgame(); });

            test('continues to the one-as-two subgame', () => {
                expect(js.game.subgame).toBe(js.Subgames.ONE_AS_TWO);
            });

            describe('after one-as-two subgame', () => {
                beforeEach(() => { js.finishSubgame(); });

                test('continues to the pair-plus-ace subgame', () => {
                    expect(js.game.subgame).toBe(js.Subgames.PAIR_PLUS_ACE);
                });

                describe('after one-as-two subgame', () => {
                    beforeEach(() => { js.finishSubgame(); });

                    test('goes to the results step', () => {
                        expect(js.game.step).toBe(js.Steps.RESULTS);
                    });
                });
            });
        });
    });

    test('player can\'t raise zero', () => {
        js.betRaise(0);
        expect(js.game.playerBet).toBe(0);
    });

    describe('the player/rival', () => {
        let raise = 3;
        describe("passes/passes", () => {
            beforeEach(() => {
                nextRivalBet = js.Bets.PASS;
                js.betPass();
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('player bet is 0', () => {
                expect(js.game.playerBet).toBe(0);
            });

            test('rival bet is 0', () => {
                expect(js.game.rivalBet).toBe(0);
            });

            test('subgame pending bets are empty', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });
        });

        describe("passes/raises", () => {
            beforeEach(() => {
                nextRivalBet = raise;
                js.betPass();
            });

            test('bets are not set', () => {
                expect(js.game.betsAreSet).toBeFalsy();
            });

            test('player bet is 0', () => {
                expect(js.game.playerBet).toBe(0);
            });

            test('rival bet is increased', () => {
                expect(js.game.rivalBet).toBe(raise);
            });

            test('subgame pending bets are empty', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });
        });

        describe("raises/fold", () => {
            beforeEach(() => {
                nextRivalBet = js.Bets.FOLD;
                js.betRaise(raise);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('player bet is raised', () => {
                expect(js.game.playerBet).toBe(raise);
            });

            test('rival bet is 0', () => {
                expect(js.game.rivalBet).toBe(0);
            });

            test('subgame pending bets are empty', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points increase by 1', () => {
                expect(js.game.playerPoints).toBe(1);
            });
        });

        describe("raises/check", () => {
            beforeEach(() => {
                nextRivalBet = js.Bets.CHECK;
                js.betRaise(raise);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('player bet is raised', () => {
                expect(js.game.playerBet).toBe(raise);
            });

            test('rival bet is raised', () => {
                expect(js.game.rivalBet).toBe(raise);
            });

            test('subgame pending bets are set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBe(raise);
            });

            test('player points don\'t increase', () => {
                expect(js.game.playerPoints).toBe(0);
            });

            test('rival points don\'t increase', () => {
                expect(js.game.rivalPoints).toBe(0);
            });
        });

        describe("raises/raises", () => {
            let rivalRaise = 4;
            beforeEach(() => {
                nextRivalBet = rivalRaise;
                js.betRaise(raise);
            });

            test('bets are not set', () => {
                expect(js.game.betsAreSet).toBeFalsy();
            });

            test('player bet is raised', () => {
                expect(js.game.playerBet).toBe(raise);
            });

            test('rival bet is raised twice', () => {
                expect(js.game.rivalBet).toBe(raise+rivalRaise);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points don\'t increase', () => {
                expect(js.game.playerPoints).toBe(0);
            });

            test('rival points don\'t increase', () => {
                expect(js.game.rivalPoints).toBe(0);
            });

            describe("and player folds", () => {
                beforeEach(() => { js.betFold(); });

                test('bets are set', () => {
                    expect(js.game.betsAreSet).toBeTruthy();
                });

                test('player bet remains', () => {
                    expect(js.game.playerBet).toBe(raise);
                });

                test('rival bet remains', () => {
                    expect(js.game.rivalBet).toBe(raise+rivalRaise);
                });

                test('subgame pending bets are not set', () => {
                    expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
                });

                test('player points don\'t increase', () => {
                    expect(js.game.playerPoints).toBe(0);
                });

                test('rival points increase by last player raise', () => {
                    expect(js.game.rivalPoints).toBe(raise);
                });
            });

            describe("and player checks", () => {
                beforeEach(() => { js.betCheck(); });

                test('bets are set', () => {
                    expect(js.game.betsAreSet).toBeTruthy();
                });

                test('player bet increases', () => {
                    expect(js.game.playerBet).toBe(raise+rivalRaise);
                });

                test('rival bet remains', () => {
                    expect(js.game.rivalBet).toBe(raise+rivalRaise);
                });

                test('subgame pending bets are set', () => {
                    expect(js.game.pendingBets[js.game.subgame]).toBe(raise+rivalRaise);
                });

                test('player points don\'t increase', () => {
                    expect(js.game.playerPoints).toBe(0);
                });

                test('rival points don\'t increase', () => {
                    expect(js.game.rivalPoints).toBe(0);
                });
            });
        });
    });

    describe('when betting on one-as-two', () => {
        describe('without game', () => {
            beforeEach(() => {
                js.game.playerDice = [1, 1, 1, 1, 1];
                js.game.rival.dice = [2, 2, 2, 2, 2];
                js.startSubgame(js.Subgames.ONE_AS_TWO);
            });

            test('there\'s no game', () => {
                expect(js.game.lastAction).toBe(js.LastAction.NO_GAME);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('bet value is 0', () => {
                expect(js.game.lastBetStanding).toBe(0);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points don\'t increase', () => {
                expect(js.game.playerPoints).toBe(0);
            });

            test('rival points don\'t increase', () => {
                expect(js.game.rivalPoints).toBe(0);
            });
        });

        describe('without user game', () => {
            beforeEach(() => {
                js.game.playerDice = [5, 5, 5, 5, 5];
                js.game.rival.dice = [1, 2, 3, 4, 5];
                js.startSubgame(js.Subgames.ONE_AS_TWO);
            });

            test('there\'s no user game', () => {
                expect(js.game.lastAction).toBe(js.LastAction.USER_NO_GAME);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('bet value is 1', () => {
                expect(js.game.lastBetStanding).toBe(1);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points don\'t increase', () => {
                expect(js.game.playerPoints).toBe(0);
            });

            test('rival points increase by 1', () => {
                expect(js.game.rivalPoints).toBe(1);
            });
        });

       describe('without rival game', () => {
            beforeEach(() => {
                js.game.playerDice = [6, 2, 3, 4, 5];
                js.game.rival.dice = [6, 4, 4, 3, 4];
                js.startSubgame(js.Subgames.ONE_AS_TWO);
            });

            test('there\'s no rival game', () => {
                expect(js.game.lastAction).toBe(js.LastAction.RIVAL_NO_GAME);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('bet value is 1', () => {
                expect(js.game.lastBetStanding).toBe(1);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points increase by 1', () => {
                expect(js.game.playerPoints).toBe(1);
            });

            test('rival points don\'t increase', () => {
                expect(js.game.rivalPoints).toBe(0);
            });
        });
    });

    describe('when betting on pair-plus-ace', () => {
        describe('without game', () => {
            beforeEach(() => {
                js.game.playerDice = [1, 4, 3, 2, 1];
                js.game.rival.dice = [2, 2, 2, 2, 2];
                js.startSubgame(js.Subgames.PAIR_PLUS_ACE);
            });

            test('there\'s no game', () => {
                expect(js.game.lastAction).toBe(js.LastAction.NO_GAME);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('bet value is 0', () => {
                expect(js.game.lastBetStanding).toBe(0);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points don\'t increase', () => {
                expect(js.game.playerPoints).toBe(0);
            });

            test('rival points don\'t increase', () => {
                expect(js.game.rivalPoints).toBe(0);
            });
        });

        describe('without user game', () => {
            beforeEach(() => {
                js.game.playerDice = [5, 5, 5, 5, 5];
                js.game.rival.dice = [1, 2, 5, 4, 5];
                js.startSubgame(js.Subgames.PAIR_PLUS_ACE);
            });

            test('there\'s no user game', () => {
                expect(js.game.lastAction).toBe(js.LastAction.USER_NO_GAME);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('bet value is 1', () => {
                expect(js.game.lastBetStanding).toBe(1);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points don\'t increase', () => {
                expect(js.game.playerPoints).toBe(0);
            });

            test('rival points increase by 1', () => {
                expect(js.game.rivalPoints).toBe(1);
            });
        });

       describe('without rival game', () => {
            beforeEach(() => {
                js.game.playerDice = [6, 2, 2, 1, 5];
                js.game.rival.dice = [6, 4, 4, 4, 4];
                js.startSubgame(js.Subgames.PAIR_PLUS_ACE);
            });

            test('there\'s no rival game', () => {
                expect(js.game.lastAction).toBe(js.LastAction.RIVAL_NO_GAME);
            });

            test('bets are set', () => {
                expect(js.game.betsAreSet).toBeTruthy();
            });

            test('bet value is 1', () => {
                expect(js.game.lastBetStanding).toBe(1);
            });

            test('subgame pending bets are not set', () => {
                expect(js.game.pendingBets[js.game.subgame]).toBeUndefined();
            });

            test('player points increase by 1', () => {
                expect(js.game.playerPoints).toBe(1);
            });

            test('rival points don\'t increase', () => {
                expect(js.game.rivalPoints).toBe(0);
            });
        });
    });
});

describe('best dice functions', () => {
    describe('biggest subgame', () => {
        let dice = [1, 6, 6, 5, 6];
        let bestDiceIndexes = js.bestDice(js.Subgames.BIGGEST, dice);

        test('returns three dices', () => {
            expect(bestDiceIndexes).toHaveLength(3);
        });

        test('correct indexes', () => {
            expect(bestDiceIndexes).toContain(1);
            expect(bestDiceIndexes).toContain(2);
            expect(bestDiceIndexes).toContain(4);
        });
    });

    describe('smallest subgame', () => {
        let dice = [1, 4, 6, 5, 6];
        let bestDiceIndexes = js.bestDice(js.Subgames.SMALLEST, dice);

        test('returns three dices', () => {
            expect(bestDiceIndexes).toHaveLength(3);
        });

        test('has correct indexes', () => {
            expect(bestDiceIndexes).toContain(0);
            expect(bestDiceIndexes).toContain(1);
            expect(bestDiceIndexes).toContain(3);
        });
    });

    describe('one-as-two subgame', () => {
        describe('without valid combination', () => {
            let dice = [1, 4, 4, 6, 4];
            let bestDiceIndexes = js.bestDice(js.Subgames.ONE_AS_TWO, dice);

            test('returns no dices', () => {
                expect(bestDiceIndexes).toHaveLength(0);
            });
        });

        describe('with a valid combination', () => {
            let dice = [4, 1, 3, 2, 1];
            let bestDiceIndexes = js.bestDice(js.Subgames.ONE_AS_TWO, dice);

            test('returns three dices', () => {
                expect(bestDiceIndexes).toHaveLength(3);
            });

            test('has correct indexes', () => {
                expect(bestDiceIndexes).toContain(1);
                expect(bestDiceIndexes).toContain(3);
                expect(bestDiceIndexes).toContain(4);
            });
        });
    });

    describe('pair-plus-ace subgame', () => {
        describe('without pair', () => {
            let dice = [1, 5, 1, 6, 3];
            let bestDiceIndexes = js.bestDice(js.Subgames.PAIR_PLUS_ACE, dice);

            test('returns no dices', () => {
                expect(bestDiceIndexes).toHaveLength(0);
            });
        });

        describe('without one', () => {
            let dice = [3, 2, 5, 3, 5];
            let bestDiceIndexes = js.bestDice(js.Subgames.PAIR_PLUS_ACE, dice);

            test('returns no dices', () => {
                expect(bestDiceIndexes).toHaveLength(0);
            });
        });

        describe('with a valid combination', () => {
            let dice = [5, 1, 2, 2, 5];
            let bestDiceIndexes = js.bestDice(js.Subgames.PAIR_PLUS_ACE, dice);

            test('returns three dices', () => {
                expect(bestDiceIndexes).toHaveLength(3);
            });

            test('has correct indexes', () => {
                expect(bestDiceIndexes).toContain(0);
                expect(bestDiceIndexes).toContain(1);
                expect(bestDiceIndexes).toContain(4);
            });
        });
    });
});

describe('determine winner', () => {
   describe('biggest subgame', () => {
        test('dice1 wins', () => {
            let dice1 = [6, 6, 6, 6, 6];
            let dice2 = [1, 1, 1, 1, 1];
            expect(js.determineWinner(js.Subgames.BIGGEST, dice1, dice2)).toBe(1);
        });

        test('dice2 wins', () => {
            let dice1 = [5, 5, 6, 6, 5];
            let dice2 = [1, 1, 6, 6, 6];
            expect(js.determineWinner(js.Subgames.BIGGEST, dice1, dice2)).toBe(-1);
        });

        test('dice1 wins when tied', () => {
            let dice1 = [1, 1, 1, 1, 1];
            let dice2 = [1, 1, 1, 1, 1];
            expect(js.determineWinner(js.Subgames.BIGGEST, dice1, dice2)).toBe(1);
        });
    });

    describe('smallest subgame', () => {
        test('dice1 wins', () => {
            let dice1 = [1, 1, 1, 6, 6];
            let dice2 = [2, 2, 2, 2, 2];
            expect(js.determineWinner(js.Subgames.SMALLEST, dice1, dice2)).toBe(1);
        });

        test('dice2 wins', () => {
            let dice1 = [5, 5, 6, 6, 5];
            let dice2 = [1, 1, 1, 6, 6];
            expect(js.determineWinner(js.Subgames.SMALLEST, dice1, dice2)).toBe(-1);
        });

        test('dice1 wins when tied', () => {
            let dice1 = [1, 1, 1, 1, 1];
            let dice2 = [1, 1, 1, 1, 1];
            expect(js.determineWinner(js.Subgames.SMALLEST, dice1, dice2)).toBe(1);
        });
    });

    describe('one-as-two subgame', () => {
        test('dice1 wins', () => {
            let dice1 = [1, 1, 1, 2, 2];
            let dice2 = [2, 2, 4, 2, 2];
            expect(js.determineWinner(js.Subgames.ONE_AS_TWO, dice1, dice2)).toBe(1);
        });

        test('dice2 wins', () => {
            let dice1 = [5, 5, 6, 6, 5];
            let dice2 = [1, 2, 2, 4, 6];
            expect(js.determineWinner(js.Subgames.ONE_AS_TWO, dice1, dice2)).toBe(-1);
        });

        test('dice1 wins when tied when game', () => {
            let dice1 = [1, 1, 1, 2, 1];
            let dice2 = [1, 1, 2, 1, 1];
            expect(js.determineWinner(js.Subgames.ONE_AS_TWO, dice1, dice2)).toBe(1);
        });

        test('both tie if there\'s no game', () => {
            let dice1 = [4, 4, 4, 4, 6];
            let dice2 = [5, 5, 3, 4, 5];
            expect(js.determineWinner(js.Subgames.ONE_AS_TWO, dice1, dice2)).toBe(0);
        });
    });

    describe('pair-plus-ace subgame', () => {
        test('dice1 wins', () => {
            let dice1 = [1, 1, 1, 2, 2];
            let dice2 = [2, 2, 4, 2, 2];
            expect(js.determineWinner(js.Subgames.PAIR_PLUS_ACE, dice1, dice2)).toBe(1);
        });

        test('dice2 wins', () => {
            let dice1 = [1, 5, 2, 2, 5];
            let dice2 = [1, 6, 2, 4, 6];
            expect(js.determineWinner(js.Subgames.PAIR_PLUS_ACE, dice1, dice2)).toBe(-1);
        });

        test('dice1 wins when tied when game', () => {
            let dice1 = [1, 1, 1, 2, 1];
            let dice2 = [1, 1, 2, 1, 1];
            expect(js.determineWinner(js.Subgames.PAIR_PLUS_ACE, dice1, dice2)).toBe(1);
        });

        test('both tie if there\'s no game', () => {
            let dice1 = [4, 4, 3, 2, 6];
            let dice2 = [1, 2, 3, 4, 5];
            expect(js.determineWinner(js.Subgames.PAIR_PLUS_ACE, dice1, dice2)).toBe(0);
        });
    });
});