const bingo = function(bingoList){

	// Gets information from the URL
	function gup( name ) {
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		const regexS = "[\\?&]"+name+"=([^&#]*)";
		const regex = new RegExp( regexS );
		const results = regex.exec( window.location.href );
		if(results === null)
			 return "";
		return results[1];
	}

	let LANG = gup( 'lang' );
	if (LANG === '') LANG = 'name';
	let SEED = gup( 'seed' );
	let MODE = gup( 'mode' );
	
	// if no specified seed, random seed
	if(SEED === "") return reseedPage(MODE);

	//create opts options object
	const opts = {}
	opts.seed = SEED
	const bingoBoard = bingoGenerator(bingoList, opts);

	//populate the bingo board with goals
	bingoBoard.forEach(function(goal, index) {
		console.log(goal);
		const bingoSlot = document.getElementById('slot' + index);
		bingoSlot.innerHTML = goal.name;
	});

	// indices of the goals that belong to each row
	const rowMap = {
		row1: [0,1,2,3,4],
	  row2: [5,6,7,8,9],
	  row3: [10,11,12,13,14],
	  row4: [15,16,17,18,19],
	  row5: [20,21,22,23,24],
	  col1: [0,5,10,15,20],
	  col2: [1,6,11,16,21],
	  col3: [2,7,12,17,22],
	  col4: [3,8,13,18,23],
	  col5: [4,9,14,19,24],
	  tlbr: [0,6,12,18,24],
	  bltr: [4,8,12,16,20],
	};

	// Add classes to the slots based on which row they belong to
	// This is done to handle hovers
	for (const rowName in rowMap) {
		const slotsInRow = rowMap[rowName];
		slotsInRow.forEach(function(slotIndex) {
			const slotElement = document.getElementById('slot' + slotIndex);
			slotElement.classList.add(rowName);
		});
	}

	// Add Event listeners to the labels
	const rowLabelElements = document.querySelectorAll('.bingo-board-label');
	rowLabelElements.forEach(function(rowLabelElement) {
		rowLabelElement.addEventListener('click', handleLabelClick);
		rowLabelElement.addEventListener('mouseover', handleLabelHover);
		rowLabelElement.addEventListener('mouseout', handleLabelUnhover);
	});

	// Clicking a row label will display that row under the selected-row panel
	function handleLabelClick() {
		const rowName = this.id;
		
		// update selected-row label
		const selectedRowLabelElement = document.getElementById('selected-row-label');
		selectedRowLabelElement.innerHTML = rowName.toUpperCase();

		// update selected-row squares
		const slotElements = document.querySelectorAll('.' + rowName);
		slotElements.forEach(function(slotElement, index) {
			const slotId = slotElement.id;
			// each Id is 'slot#', we only want the #
			const slotIdNumber = slotId.slice(4);
			const goalName = bingoBoard[slotIdNumber].name;
			const selectedRowSlotElement = document.getElementById('selected-slot' + index);
			selectedRowSlotElement.innerHTML = goalName;
		});
	}

	// highlight all squares in the hovered row
	function handleLabelHover() {
		const rowName = this.id;
		const slotElements = document.querySelectorAll('.' + rowName);
		slotElements.forEach(function(slotElement) {
			slotElement.classList.add('hover');
		});
	}

	function handleLabelUnhover() {
		const rowName = this.id;
		const slotElements = document.querySelectorAll('.' + rowName);
		slotElements.forEach(function(slotElement) {
			slotElement.classList.remove('hover');
		});
	}

	// adds the toggle event listener to squares
	const bingoSquareElements = document.querySelectorAll('.bingo-board-square, .selected-row-square');
	bingoSquareElements.forEach(function(bingoSquareElement) {
		bingoSquareElement.addEventListener('click', handleBingoSquareClick);
		bingoSquareElement.addEventListener('contextmenu', handleBingoSquareRightClick);
	});


	// toggles squares red and green
	function handleBingoSquareClick() {
		const greenSquareClass = 'green-square';
		const redSquareClass = 'red-square'
		if (this.classList.contains(greenSquareClass)) {
			this.classList.remove(greenSquareClass);
			this.classList.add(redSquareClass);
		} else if (this.classList.contains(redSquareClass)) {
			this.classList.remove(redSquareClass);
		} else {
			this.classList.add(greenSquareClass);
		}
	}

	// puts goal info on right sidebar
	function handleBingoSquareRightClick(event) {
		event.preventDefault();
		const bingoSquareId = this.id;
		const bingoSquareIdNumber = bingoSquareId.slice(4);
		const goal = bingoBoard[bingoSquareIdNumber];
		const rightSidebarHtml = `
			<h1>${goal.name}</h1>
			<p>Difficulty: (insert difficulty number)</p>
			<a href="https://docs.google.com/document/d/118aFciP66p75XvEi9l4ofZVZQvud-381AzEYN2jXjDQ" target="_blank">
				Link to Route
			</a>
		`;

		const rightSidebarElement = document.getElementById('right-sidebar-column');
		rightSidebarElement.innerHTML = rightSidebarHtml;
	}


}

// Reloads the page with a new seed
function reseedPage(mode) {
	var qSeed = "?seed=" + Math.ceil(999999 * Math.random());
	var qMode = (mode == "short" || mode == "long") ? "&mode=" + mode : "";
	window.location = qSeed + qMode;
	return false;
}

