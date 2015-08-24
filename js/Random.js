/*
 * Random.js
 * Totally pseudo-random
 *
 * Jonatan H Sundqvist
 * August 24 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 */



var random = (function() {
	
	var module = {};

	module.randint = function(lower, upper) {
		return lower + Math.floor((upper-lower)*Math.random()); // TODO: Optional lower bound (default to 0) (?)
	};


	module.choice = function(sequence) {
		var c = sequence[module.randint(0, sequence.length)];
		console.log(c);
		return c;
	};

	return module;

}());