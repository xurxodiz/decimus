const TEXT = {
	alertNoDiceToReroll: "Tes que escoller que dados volver a rolar!",
	alertNonPositiveBet: "Tes que apostar ou subir unha cantidade positiva!",
	dismissAlertButton: "Entendido",

	playerScoreName: "Ti",
	rivalScoreName: "Rival",

	explanationSplash: "Dámosche a benvida a <strong>DECIMUS</strong>, o xogo de dados retromedieval.",
	explanationRolling: "Tes dúas oportunidades de rolar de novo tantos dados como queiras.",
	explanationBiggest: "En <strong>maiores</strong> contan os dados con maior valor.",
	explanationSmallest: "En <strong>menores</strong> contan os dados con menor valor.",
	explanationOneAsTwo: "En <strong>un en dous</strong> conta ter os dados máis pequenos tal que dous sumen o do outro.",
	explanationPairPlusAce: "En <strong>par e as</strong> conta a maior parella acompañada de as que teñas.",
	explanationResults: "Velaquí o resultado das túas apostas para {0}.",
	explanationEndOfRound: "Terminou esta rolda. Pero aínda non gañou ninguén.",
	explanationFinish: "A partida terminou.",

	initialButton: "Xogar",
	rerollButton: "Rolar de novo",
	endRollsButton: "Conforme",
	passButton: "Pasar",
	foldButton: "Retirarse",
	checkButton: "Ver",
	betButton: "Apostar",
	raiseButton: "Subir",

	subgameBiggest: "maiores",
	subgameSmallest: "menores",
	subgameOneAsTwo: "un en dous",
	subgamePairPlusAce: "par e as",

	currentBetNoneYet: "Tócache apostar.",
	currentBetUserPass: "Pasaches, levou {0}.",
	currentBetRivalPass: "Pasou, levaches {0}.",
	currentBetRivalRaise: "{0} {1}.",
	currentBetRivalRaiseBet: "Apostouche",
	currentBetRivalRaiseRaise: "Subiuche a",
	currentBetUserCheck: "Quedan a ver {0}.",
	currentBetRivalCheck: "Quedan a ver {0}.",
	currentBetUserFold: "Retirácheste, levou {0}.",
	currentBetRivalFold: "Retirouse, levaches {0}.",
	currentBetNoGame: "Non hai xogo.",
	currentBetUserNoGame: "Non tes xogo, levou {0}.",
	currentBetRivalNoGame: "Non ten xogo, levaches {0}.",
	currentBetUserWonCheck: "Gañaches {0}.",
	currentBetRivalWonCheck: "Gañou {0}.",
	currentBetAlreadyAssigned: "Os puntos xa foran asignados.",

	finishSubgameButton: "Continuar",
	nextResultsButton: "Continuar",
	nextRoundButton: "Seguinte rolda",

	playerWon: "Parabéns! Gañaches.",
	tie: "Vaites, un empate…",
	rivalWon: "Perdiches :(",

	helpButton: "?",
	helpCloseButton: "x",
	helpCloseEndButton: "Pechar",
	helpAndCredits: `
    <p><strong>Decimus</strong> é un xogo de dados que mestura os xogos descritos por Afonso X no seu <em><a href="https://gl.wikipedia.org/wiki/Libro_de_los_juegos#Libro_dos_dados">Libro dos dados</a></em> coas regras do Mus. O obxectivo é facer combinacións de dados que serán comparadas coas da rival nunha serie de apostas, e ter o maior número de puntos cando algunha xogadora iguale ou supere os trinta puntos.</p>
    <p>Ao comezar a rolda, cada xogadora rolará en segredo os cinco dados. Se non está satisfeita co resultado, pode escoller os que desexe para volvelos a rolar. Outra vez máis, logo desa segunda rolada, a xogadora poderá escoller calquera número de dados para volvelos a rolar, incluíndo aqueles que non foran rolados na ocasión anterior. Despois diso, o resultado é final e comeza a fase de apostas.</p>
    <p>As xogadoras apostarán a ver quen ten a mellor combinación en catro xogos diferentes:</p>
    <ul>
      <li><strong>Maiores</strong>: gaña quen teña a combinación de tres dados cuxa suma sexa máxima.</li>
      <li><strong>Menores</strong>: gaña quen teña a combinación de tres dados cuxa suma sexa mínima.</li>
      <li><strong>Un en dous</strong>: gaña quen teña dados máis pequenos tal que dous sumen outro.</li>
      <li><strong>Par e as</strong>: gaña quen teña a maior parella acompañada de as.</li>
    </ul>
    <p>Nestes dous últimos xogos pode darse o caso de que unha ou as dúas xogadoras non teñan unha combinación válida. Cada unha terá que anunciar se ten combinación válida ou non. Se ningunha ten, o xogo non se puntúa. Se unha ten e a outra non, a primeira leva un punto inmediatamente. Noutro caso, ao igual ca en maiores ou menores, continúase coa seguinte parte da fase de apostas.</p>
    <p>Comezando pola primeira xogadora, cada unha terá que escoller entre retirarse, pasar, ver ou apostar alternativamente:</p>
    <ul>
      <li><strong>Retirarse</strong>: a rival leva tantos puntos coma a última aposta da primeira xogadora. Se non houbo aposta previa, levará un punto.</li>
      <li><strong>Pasar</strong>: se non houbo apostas previas e ambas xogadoras pasan consecutivamente, o xogo resolverase na fase final con valor dun punto.</li>
      <li><strong>Ver</strong>: a aposta previa é aceptada e quedará pendente para resolver ao finalizar o resto dos xogos.</li>
      <li><strong>Apostar</strong>: establece unha aposta nova que a outra xogadora poderá rexeitar, ver ou apostar máis.</li>
    </ul>
    <p>Unha vez establecidas as apostas dos catro xogos ambas xogadoras amosan os seus dados. Para cada xogo que quedase con apostas pendentes, determínase a gañadora segundo as regras do xogo e esta leva os apuntos apostados. En caso de empate nas combinacións, a primeira xogadora é a gañadora.</p>
    <p>Logo de resolver todas as apostas a rolda remata. Se algunha xogadora iguala ou supera os trinta puntos a xogadora con máis puntos gaña a partida. Se ningunha os supera ou ambas teñen os mesmos puntos comeza unha nova rolda, alternando a condición de primeira xogadora.</p>
    <h2>Créditos</h2>
    <p>Participación na <em>game jam</em> <a href="https://itch.io/jam/afonso-x-e-galicia">Afonso X e Galicia</a> do Consello da Cultura Galega, feita por <a href="https://xurxodiz.eu/">Xurxo Diz</a> e <a href="https://xogon.eu">Xoán González</a>. Código libre en <a href="https://github.com/xurxodiz/decimus">GitHub</a>.</p>
    <p>Imaxes dos dados por <a href="https://thenounproject.com/rose-alice-design/">Alice Design</a>.</p>
	`
};
