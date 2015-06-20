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

	//
	"use strict";

	// var haskell = {};
	var self = {};
	var π    = Math.PI;


	self.polygon = function(sides, radius) {

		//
		console.log('Polygon');
		var side = 0;         //
		const θ  = 2*π/sides; // Internal angle for each segment

		var iterable = {};

		iterable[Symbol.iterator] = function() {
			return {
				next: function() {
					var value = side < sides ? { value: [radius*Math.cos(side*θ), radius*Math.sin(side*θ)], done: false }
				                             : { done: true };
					side++;
					return value;
				}	
			}
		};

		return iterable;

	};



	self.runtests = function() {

		//
		console.log('Running tests');

		try {
			for (let x of this.polygon(5, 1.2)) {
				console.log(x);
			}
		} catch (e) {
			console.log(e);
		}

	};

	console.log(self.polygon(1,2));
	self.runtests();

	return self;

}());