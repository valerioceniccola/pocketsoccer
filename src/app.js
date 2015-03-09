/**
 * Serie A Poket
 * Author: Valerio Ceniccola
 * Made with love from Italy @ Copyright 2015
 */

var UI = require('ui');
var ajax = require('ajax');

// Serie A Map
var mapName = [];
mapName['AC Chievo Verona'] = 'Chievo Verona';
mapName['Juventus Turin'] = 'Juventus';
mapName['AS Rom'] = 'Roma';
mapName['AC Florenz'] = 'Fiorentina';
mapName['AC Mailand'] = 'Milan';
mapName['Lazio Rom'] = 'Lazio';
mapName['Atalanta Bergamo'] = 'Atalanta';
mapName['Hellas Verona'] = 'Verona';
mapName['Sassuolo Calcio'] = 'Sassuolo';
mapName['Cagliari Calcio'] = 'Cagliari';
mapName['US Palermo'] = 'Palermo';
mapName['Sampdoria Genua'] = 'Sampdoria';
mapName['Udinese Calcio'] = 'Udinese';
mapName['FC Empoli'] = 'Empoli';
mapName['CFC Genua 1983'] = 'Genoa';
mapName['SSC Neapel'] = 'Napoli';
mapName['AC Cesena'] = 'Cesena';
mapName['FC Parma'] = 'Parma';
mapName['FC Turin'] = 'Torino';
mapName['Inter Mailand'] = 'Inter';

// Manual league name with their id numbers
var leagueList = [
	{title: "Premier League", id:354, icon:'images/icn_premier.png'},
	{title: "Bundesliga", id:351, icon:'images/icn_bundesliga.png'},
	{title: "Liga", id:358, icon:'images/icn_liga.png'},
	{title: "Serie A", id:357, icon:'images/icn_seriea.png'},
	{title: "Ligue", id:355, icon:'images/icn_ligue.png'},
	// {title: "Champions League", id:362}
];

// Create card navigation main
var cardNavMain = new UI.Menu({
	sections: [{
		title: 'Select league',
		items: leagueList
	}]
});
cardNavMain.show();

// Create card next match
var cardNextMatch = new UI.Card({
	title:'Next match',
	subtitle:'Loading...',
	scrollable: true
});

cardNavMain.on('select', function(event) {
	
	var leagueID = leagueList[event.itemIndex].id;
	
	var cardNavDetailList = [
		{title: 'Ranking', id:leagueID},
		{title: 'Next match', id:leagueID}
	];

	// Create secondary menu navigation
	var cardNavDetail = new UI.Menu({
		sections: [{
			title:'Season 2014/2015',
			items:cardNavDetailList,
			scrollable:true
		}]
	});
	
	cardNavDetail.show();
	
	cardNavDetail.on('select', function(event) {

		// Take the id from the item selected
		var leagueID = cardNavDetailList[event.itemIndex].id;

		var JSONleague = 'http://api.football-data.org/alpha/soccerseasons/' + leagueID + '/leagueTable';
		var JSONteamList = 'http://api.football-data.org/alpha/soccerseasons/' + leagueID + '/teams';
		
		// Clear string function
		var clearString = function htmlspecialchars(str) {
			if (typeof(str) == "string") {
				str = str.replace(/Ä/g, "A");
				str = str.replace(/ä/g, "a");
				str = str.replace(/Ö/g, "O");
				str = str.replace(/ö/g, "o");
				str = str.replace(/Ü/g, "U");
				str = str.replace(/ü/g, "u");
				str = str.replace(/À/g, "A");
				str = str.replace(/à/g, "a");
				str = str.replace(/á/g, "a");
				str = str.replace(/È/g, "E");
				str = str.replace(/È/g, "E");
				str = str.replace(/è/g, "e");
				str = str.replace(/é/g, "e");
				str = str.replace(/Ì/g, "I");
				str = str.replace(/ì/g, "i");
				str = str.replace(/Ò/g, "O");
				str = str.replace(/o/g, "o");
				str = str.replace(/ó/g, "o");
				str = str.replace(/Ù/g, "U");
				str = str.replace(/u/g, "u");
			}
			return str;
		};

		// Make the request if -ranking- is clicked
		if (event.itemIndex === 0) {
			ajax(
				{
					headers: { 'X-Auth-Token': '3f5aa8c405444642bb941123f5fc5acc' },
					url: JSONleague,
					type: 'json'
				},
				function(data) {

					var parseRankItems = function(data, quantity) {

						var rankItems = [];

						for(var i = 0; i < quantity; i++) {
							
							var title;
							
							// If -SerieA- is selected, map name
							if (leagueID == 357) {
								title = data.standing[i].position + ' ' + mapName[data.standing[i].teamName];
							} else {
								title = data.standing[i].position + ' ' + data.standing[i].teamName;
							}
							
							var titleClear = clearString(title);

							// Push into array
							rankItems.push({
								title:titleClear,
								subtitle:data.standing[i].points +  ' PTS - ' + data.standing[i].playedGames + ' PG'
							});
						}

						// Array return
						return rankItems;
					};

					var cardLeagueLi = parseRankItems(data, (data.standing).length);

					var cardLeagueTable = new UI.Menu({
						sections: [{
							title: 'Day ' + data.matchday + ' ' + data.leagueCaption,
							items: cardLeagueLi
						}]
					});

					cardLeagueTable.show();

				},
				function(error) {
					// Failure!
					console.log('Error log: ' + error);
				}
			);
		}
		
		// Make the request if -next match- is clicked
		else if (event.itemIndex === 1) {
			
			ajax(
				{
					headers: { 'X-Auth-Token': '3f5aa8c405444642bb941123f5fc5acc' },
					url: JSONteamList,
					type: 'json'
				},
				function(data) {

					var parseTeamItems = function(data, quantity) {

						var teamItems = [];

						for(var i = 0; i < quantity; i++) {

							var getUrlTeam = data.teams[i]._links.self.href;
							var idTeam = getUrlTeam.replace("http://api.football-data.org/alpha/teams/", "");
							
							var title;
							
							// If -SerieA- is selected, map name
							if (leagueID == 357) {
								title = mapName[data.teams[i].name];
							} else {
								title = data.teams[i].name;
							}
							
							var titleClear = clearString(title);

							// Push items into array
							teamItems.push({
								title:titleClear,
								id:idTeam
							});
						}
						
						// Sort item -title- in the array
						teamItems.sort(function(a, b) {
							var textA = a.title.toUpperCase();
							var textB = b.title.toUpperCase();
							return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
						});

						// Array return
						return teamItems;
					};

					var cardTeamLi = parseTeamItems(data, (data.teams).length);

					var cardTeam = new UI.Menu({
						sections: [{
							title: 'Select team',
							items: cardTeamLi
						}]
					});

					cardTeam.show();
					
					cardTeam.on('select', function(event) {

						// Take the id from the item selected
						var teamID = event.item.id;						
						var JSONteamFixtures = 'http://api.football-data.org/alpha/teams/' + teamID + '/fixtures';

						ajax(
							{
								headers: { 'X-Auth-Token': '3f5aa8c405444642bb941123f5fc5acc' },
								url: JSONteamFixtures,
								type: 'json'
							},
							function(data) {

								var timedArray = [];

								for(var i = 0; i < (data.fixtures).length; i++) {

									if (data.fixtures[i].status == "TIMED") {
										timedArray.push(data.fixtures[i]);
									}

								}

								var a = timedArray[0];

								// Take minutes timezone difference and convert into hours
								var offset = new Date().getTimezoneOffset();
								var myOffset = ((offset / 60) * (-1));

								// Take date from string
								var dateDay = a.date.substr(8,2);
								var dateMounth = a.date.substr(5,2);
								
								var dateGetHours = a.date.substr(11,2);
								var dateTimeHours = parseFloat(dateGetHours) + (parseFloat(myOffset));
								var dateTimeMinutes = a.date.substr(14,2);

								cardNextMatch.title('Matchday ' + a.matchday);
								cardNextMatch.body(
									dateDay + '-' + dateMounth + ' at ' + dateTimeHours + ':' + dateTimeMinutes
								);
								
								var title;
							
								if (leagueID == 357) {
									title = mapName[a.homeTeamName] + ' vs ' + mapName[a.awayTeamName];
								} else {
									title = a.homeTeamName + ' vs ' + a.awayTeamName;
								}
								
								cardNextMatch.subtitle(title);
						
								cardNextMatch.show();
								
							}
						);
						
					});

				},
				function(error) {
					// Failure!
					console.log('Error log: ' + error);
				}
			);
		}
		
	});

});
