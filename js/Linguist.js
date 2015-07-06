/*
 * Linguist.js
 * Language and string utilities
 *
 * None
 * July 06 2015
 *

 * TODO | - Multiple languages
 *        - 

 * SPEC | -
 *        -
 *
 */



var linguist = (function() {
	
	//
	var linguist = {};

	// Data
	var numerals = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

	//
	linguist.numeral = function(n, cap) {
		// TODO: Implement cap
		return (numerals[count] || String(n));
	};

	return linguist;

}());