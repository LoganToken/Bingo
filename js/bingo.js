var bingo = function(bingoList){

	//Gets information from the URL
	function gup( name ) {
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( window.location.href );
		if(results == null)
			 return "";
		return results[1];
	}

	var LANG = gup( 'lang' );
	if (LANG == '') LANG = 'name';
	var SEED = gup( 'seed' );
	var MODE = gup( 'mode' );
	
	//if no specified seed, random seed
	if(SEED == "") return reseedPage(MODE);

	//displays info about the card
	var cardtype = "string";
	if (MODE == "short") { cardtype = "Short"; } 
	else if (MODE == "long") { cardtype = "Long"; }
	else { cardtype = "Normal";	}
	var results = $("#results");
	results.append ("<p>SRT Bingo <strong>v1</strong>&emsp;Seed: <strong>" + 
	SEED + "</strong>&emsp;Card type: <strong>" + cardtype + "</strong></p>");

	//create opts options object
	var opts = {}
	opts.seed = SEED
	
	var bingoBoard = bingoGenerator(bingoList, opts);

	//populate the actual table on the page
	for (i=1; i<=25; i++) {
		console.log(bingoBoard[i-1]);
		$('#slot'+i).append(bingoBoard[i-1].name);
	}

	//Puts the selected row on the left side of the screen
	$('.rowcol:not(#selected-row-name)').click(function(){
		var line = $(this).attr('id');
		var name = $(this).html();
		var cells = $('#bingo .'+ line);
		for (var i = 0; i < 5; i++) {
		  $('#selected-slot'+ (i+1)).html($(cells[i]).html());
		}
		$('#selected-row-name').html(name);
	});

	//toggles squares red and green
	$("#bingoPage .bingo-square").toggle(
		function () { $(this).addClass("green-square"); },
		function () { $(this).addClass("red-square").removeClass("green-square"); },
		function () { $(this).removeClass("red-square"); }
	);

	//highlights squares in a row when hovering that row
	$(".rowcol").hover(
		function(){
			var line = $(this).attr('id')
			$("."+ line).addClass("hover");
		},
		function(){
			var line = $(this).attr('id')
			$("."+ line).removeClass("hover");
		}
	)

}

function reseedPage(mode) {
	var qSeed = "?seed=" + Math.ceil(999999 * Math.random());
	var qMode = (mode == "short" || mode == "long") ? "&mode=" + mode : "";
	window.location = qSeed + qMode;
	return false;
}

