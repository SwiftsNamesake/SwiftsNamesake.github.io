/*
 * Functional.js
 * A thin layer of elegant functional make-up on the hideous beast that is JavaScript
 *
 * None
 * June 20 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 *
 */



var haskell = (function() {


	var haskell = {};


	haskell.polygon = function(sides, radius) {

		//
		var side = 0;         //
		const θ  = 2*π/sides; // Internal angle for each segment'

		return {
			next: function() {
				var value = side < sides ? { value: [radius*Math.cos(side*θ), radius*Math.cos(side*θ)], done: false }
				                         : { done: true, };
				side++;
				return value;
			}
		};
	};



	haskell.runtests = function() {
		for (let x of haskell.polygon(5, 1.2)) {
			console.log(x);
		}
	};

	haskell.runtests();

	return haskell;

}());