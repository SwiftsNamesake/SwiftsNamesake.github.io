/*
 * Functional.js
 * A thin layer of elegant functional make-up on the hideous beast that is JavaScript
 *
 * None
 * June 20 2015
 *

 * TODO | - Caching
 *        - More functions (takeWhile, until, iterate, take, convert to array, filter, map, reduce)
 *        - Monads (duh)
 *        - Currying

 * SPEC | -
 *        -
 *
 */




var haskell = (function() {

	//
	"use strict";

	// var haskell = {};
	var haskell = {};
	var π    = Math.PI;


	haskell.polygon = function(sides, radius) {

		//
		console.log('Polygon');
		var side = 0;         //
		const θ  = 2*π/sides; // Internal angle for each segment

		var iterable = {};

		return haskell.iterator(function() {
			var value = side < sides ? { value: [radius*Math.cos(side*θ), radius*Math.sin(side*θ)], done: false }
			                         : { done: true };
			side++;
			return value;
		});

	};



	haskell.iterator = function(next) {

		// Creates an object supporting the iterable protocol
		// TODO: Return a function that returns an iterator, or return iterator directly (?)
		// var state = state || {}; // TODO: Remove state argument (?)
		var iterable = {};
		iterable[Symbol.iterator] = function() {
			return {
				next: function() {
					return next();
				}
			}
		};

		return iterable;

	};


	haskell.range = function(start, stop, step) {

		//
		// TODO: Allow negative step
		var start = stop !== undefined ? start : 0;     // 
		var stop  = stop !== undefined ? stop  : start; // 
		var step  = step !== undefined ? step  : 1;     //

		var n = start;

		function increment() {
			var next = n < stop ? { value: n, done: false } : { done: true };
			n += step;
			return next;
		}

		return haskell.iterator(increment);

	}


	haskell.runtests = function() {

		//
		console.log('Running tests');

		try {

			//
			for (let x of this.polygon(5, 1.2)) {
				console.log(x);
			}

			for (let x of this.range(0, 10, 2)) {
				console.log(x);
			}

		} catch (e) {
			console.log('Atleast one test failed');
			console.log(e);
		}

	};

	console.log(haskell.polygon(1,2));
	haskell.runtests();

	return haskell;

}());