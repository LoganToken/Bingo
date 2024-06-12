var bingoGenerator = function(bingoList, opts){
    if(!opts) opts = {};
    var LANG = opts.lang || 'name';
    var SEED = opts.seed || Math.ceil(999999 * Math.random()).toString();
    Math.seedrandom(SEED);
    var MODE = opts.mode || 'normal';

    //Guarantees no goal is on the card more than once
    var loc_by_id = bingoList_loc_by_id();
    var picked = new Array(loc_by_id.length);
    for (var i = 0; i < loc_by_id.length; i++){
        picked[i] = false;
    }

    //builds a 5x5 grid where each row, column, and diagonal add up to the same number
    function generate_bingo_template(weights1, weights2){
        var card = [];
        var last1 = weights1;
        var last2 = weights2;
        for( var i =0; i<5 ; i++){
            var row = [];
            for( var j =0; j<5 ; j++){
                row.push(last1[j] + last2[j])
                }
            card = card.concat(row);
            arrayRotate(last1);
            arrayRotate(last1);
            arrayRotate(last2);
            arrayRotate(last2);
            arrayRotate(last2);
            }
        return card;
    }

    var shuffle = function (array) {

        var currentIndex = array.length;
        var temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;

    };

    function arrayRotate(arr, reverse) {
      if (reverse) arr.unshift(arr.pop());
      else arr.push(arr.shift());
      return arr;
    }

    function generate_standard_template(){
        weights1 = shuffle([0, 5, 10, 15, 20]);
        weights2 = shuffle([1, 2, 3, 4, 5]);
        return generate_bingo_template(weights1, weights2);
    }

    //Get a uniformly shuffled array of all the goals of a given difficulty tier
    function getShuffledGoals(bingoList, difficulty){
        var newArray = bingoList[difficulty].slice();
        shuffle(newArray);
        return newArray;
    }

    function remove_elements_with_indices(array, indices){
        indices.sort(function(a,b){return b-a});
        for (var i = 0; i < indices.length; i++){
            array.splice(indices[i],1);
        }
    }

    function remove_elements(array, removeme){
        for (var i = 0; i < removeme.length; i++){
            var j = array.indexOf(removeme[i]);
            array.splice(j,1);
        }
    }

    //chooses the order in which squares will be populated with goals. Populates squares with more collisions (such as the center) earlier.
    function generate_population_order(template){
        var population_order = [];
        population_order[0] = 12;
        var diagonals = [0, 4, 6, 8, 16, 18, 20, 24];
        shuffle(diagonals);
        population_order = population_order.concat(diagonals);
        var nondiagonals = [1, 2, 3, 5, 7, 9, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
        shuffle(nondiagonals);
        population_order = population_order.concat(nondiagonals);
        //Difficulties 23, 24, and 25 are generated first, whichever position they are in
        for (var k = 23; k <= 25; k++){
            var positions = [];
            for (var i = 0; i < 25; i++){
                if (template[i] == k){
                    positions.push(i);
                }
            }
            if (positions.length > 0){
                remove_elements(population_order, positions);
                population_order = positions.concat(population_order);
            }
        }

        return population_order;
    }

    function match_arrays(arrA, arrB){
        for (var i = 0; i < arrA.length; i++){
            for (var j = 0; j < arrB.length; j++){
                if (arrA[i] == arrB[j]){
                    return true;
                }
            }
        }

        return false;
    }

    function choose_goal(bingoList, difficulty, type_list, subtype_list){

        var spillage = 0;
        while (spillage < 3 && difficulty <= 25){
            var goals_in_difficulty = bingoList[difficulty].slice();
            var candidates = [];
            for (var i = 0; i < goals_in_difficulty.length; i++){
                var candidate = goals_in_difficulty[i];
                if (picked[candidate.id]){
                    continue;
                }
                var types = candidate.types;
                var subtypes = candidate.subtypes;
                if (!match_arrays(type_list, types) && !match_arrays(subtype_list, types) && !match_arrays(type_list, subtypes)){
                    candidates.push(candidate);
                }
            }

            //console.log(candidates);

            if (candidates.length == 0){
                // console.log("ran out of candidate goals");
                spillage++;
                difficulty++;
                continue;
            }

            var total_weight = 0;
            for (var i = 0; i < candidates.length; i++){
                total_weight += candidates[i].weight;
            }
            var choice = Math.random()*total_weight;
            var running_total = 0;
            for (var i = 0; i < candidates.length; i++){
                running_total += candidates[i].weight;
                if (choice <= running_total){
                    picked[candidates[i].id] = true;
                    return candidates[i];
                }
            }
        }

        // console.log("NO SUITABLE GOALS");
        return null;
    }

    function merge_arrays(arrA, arrB){
        var new_array = arrA.slice();
        for (var i = 0; i < arrB.length; i++){
            if (!new_array.includes(arrB[i])){
                new_array.push(arrB[i]);
            }
        }
        return new_array;
    }

    var row_map = [];
    row_map[0] = [0,1,2,3,4];
    row_map[1] = [5,6,7,8,9];
    row_map[2] = [10,11,12,13,14];
    row_map[3] = [15,16,17,18,19];
    row_map[4] = [20,21,22,23,24];
    row_map[5] = [0,5,10,15,20];
    row_map[6] = [1,6,11,16,21];
    row_map[7] = [2,7,12,17,22];
    row_map[8] = [3,8,13,18,23];
    row_map[9] = [4,9,14,19,24];
    row_map[10] = [0,6,12,18,24];
    row_map[11] = [4,8,12,16,20];

    function make_card(bingoList){
        var template = generate_standard_template();
        
        var population_order = generate_population_order(template);

        var collisions = [];
        for (var i = 0; i < 25; i++){
            collisions[i] = {types: [], subtypes: []};
        }

        var card = []
        for (var i = 0; i < 25; i++){
            var square = population_order[i];
            var difficulty = template[square];
            var goal = choose_goal(bingoList, difficulty, collisions[square].types, collisions[square].subtypes);
            goal.difficulty = difficulty;
            card[square] = goal;
            var new_types = goal.types;
            var new_subtypes = goal.subtypes;

            //add collisions to affected rows
            for (var j = 0; j < 12; j++){
                if (row_map[j].includes(square)){
                    for (var k = 0; k < 5; k++){
                        // xid is a square in the same row as the goal just placed
                        var xid = row_map[j][k];
                        collisions[xid].types = merge_arrays(collisions[xid].types, goal.types);
                        collisions[xid].subtypes = merge_arrays(collisions[xid].subtypes, goal.subtypes);
                    }
                }
            }
        }

        //console.log(collisions);
        return card;
    }

    function make_cards_until_i_get_a_card(bingoList){
        var iterations = 0;
        while (iterations < 100){
            iterations++;
            try{
                return make_card(bingoList);
            }
            catch{
                //console.log("That card failed")
            }
        }
        return "Sorry I failed you";
    }

    var the_card = make_cards_until_i_get_a_card(bingoList);
    //console.log(picked)
    return the_card;
}

function get_card_with_names(card){
    card_with_names = [];
    for (var i = 0; i < 25; i ++){
        card_with_names[i] = card[i].name;
    }
    return card_with_names;
}

function check_distribution(n){
    var times_appeared = [];
    for (i = 0; i < 253; i++){
        times_appeared[i] = 0;
    }
    for (i = 0; i < n; i++){
        try{
            var card = bingoGenerator(bingoList);
            for (var j = 0; j < 25; j++){
                var goal_id = card[j].id
                times_appeared[goal_id] += 1;
            }
        }
        catch{
            // console.log("fuck that one");
        }
    }
    return times_appeared;
}

function ideal_appearance_rates(){
    var appearance_rate = [];
    for (var i = 1; i <= 25; i++){
        var goals = bingoList[i];
        for (var j = 0; j < goals.length; j++){
            appearance_rate[goals[j].id] = 1/goals.length;
        }
    }
    return appearance_rate;
}

function get_appearance_rate_ratios(n){
    var times_appeared = check_distribution(n);
    var appearance_rates = ideal_appearance_rates();
    var ratios = [];
    for (var i = 0; i < appearance_rates.length; i++){
        ratios[i] = times_appeared[i]/appearance_rates[i]/n;
    }
    return ratios;
}

function identify_problem_ratios(){
    var ratios = get_appearance_rate_ratios(10000);
    for (var i = 0; i < ratios.length; i++){
        if (ratios[i] < 0.5 || ratios[i] > 2){
            console.log(i);
            console.log(ratios[i]);
        }
    }
}

function bingoList_loc_by_id(){
    locations = [];
    for (var i = 1; i <= 26; i++){
        for (var j = 0; j < bingoList[i].length; j++){
            locations[bingoList[i][j].id] = {i: i, j: j};
        }
    }
    return locations;
}

function generate_weights(iterations){
    locations = bingoList_loc_by_id();
    while (iterations > 0){
        var ratios = get_appearance_rate_ratios(10000);
        for (var k = 0; k < ratios.length; k++){
            var weight = 1/ratios[k];
            bingoList[locations[k].i][locations[k].j].weight *= weight;
        }
    iterations--;
    }
}

function bound_weights(min_w, max_w){
    locs = bingoList_loc_by_id()
    for (var i = 0; i < locs.length; i++){
        var goal = bingoList[locs[i].i][locs[i].j];
        var w = goal.weight;
        if (w < min_w){
            w = min_w;
        }
        if (w > max_w){
            w = max_w;
        }
        w = +w.toFixed(2);
        goal.weight = w;
    }
}