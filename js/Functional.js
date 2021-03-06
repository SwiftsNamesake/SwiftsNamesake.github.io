/*
 * Functional.js
 * A thin layer of elegant functional make-up on the hideous beast that is JavaScript
 *
 * None
 * June 20 2015
 *

 * TODO | - Caching
 *        - More functions (takeWhile, until, iterate, take, convert to array, filter, map, reduce, const, id)
 *        - Monads (duh)
 *        - Currying
 *        - Iterator objects (?)
 *          -- Allow chaining
 *
 *        - Should iterable functions also accept iterators (?)

 * SPEC | -
 *        -
 *
 */




var haskell = (function() {

	//

	// TODO: Rename (to Prelude) (?)

	"use strict";

	// var haskell = {};
	var haskell = {};
	var π = Math.PI;


	haskell.polygon = function(sides, radius) {

		//
		console.log('Polygon');
		var side = 0;         //
		const θ  = 2*π/sides; // Internal angle for each segment

		var iterable = {};

		return haskell.iterable(function() {
			var value = side < sides ? { value: [radius*Math.cos(side*θ), radius*Math.sin(side*θ)], done: false }
			                         : { done: true };
			side++;
			return value;
		});

	};


	haskell.iterable = function(next) {

		// Creates an object supporting the iterable protocol
		// TODO: Return a function that returns an iterator, or return iterator directly (?)
		// TODO: Rename (iterable)
		// var state = state || {}; // TODO: Remove state argument (?)
		var iterable = {};
		iterable[Symbol.iterator] = function() {
			return {
				next: function() {
					return next();
				}
			}
		};

		iterable.slice   = function(start, stop, step) { return haskell.slice(iterable, start, stop, step) };
		iterable.map     = function(f)                 { return haskell.map(f, iterable);  };
		iterable.toArray = function()                  { return haskell.toArray(iterable); };
		
		return iterable;

	};


	haskell.iterator = function(iterable) { return iterable[Symbol.iterator](); };


	// haskell.map = function(f, iterable) {};
	// haskell.filter = function(p, iterable) {};


	haskell.range = function(start, stop, step) {

		//
		// TODO: TEST
		// TODO: Allow negative step
		var fr   = (stop !== undefined) ? start : 0;     // 
		var to   = (stop !== undefined) ? stop  : start; // 
		var step = (step !== undefined) ? step  : 1;     //

		var n = fr;

		function increment() {
			var next = n < to ? { value: n, done: false } : { done: true };
			n += step;
			return next;
		}

		return haskell.iterable(increment);

	}


	// haskell.reverse = function(iterable) {};


	haskell.slice = function(iterable, start, stop, step) {

		//
		// TODO: TEST
		// TODO: Infinite upper bounds (stop)
		// TODO: Optimise random-access iterators (rather than skipping one at a time)
		var start = stop !== undefined ? start : 0;     // 
		var stop  = stop !== undefined ? stop  : start; // 
		var step  = step !== undefined ? step  : 1;     // 

		// console.log('Start is ' + start + '.');
		// console.log('Stop  is ' + stop  + '.');
		// console.log('Step is '  + step  + '.');		
		
		var n = start;
		var iterator = iterable[Symbol.iterator]();

		for (var i = 0; i < start; i++) { iterator.next(); } // Skip items preceding start

		function next() {
			var value = n < stop ? iterator.next(): { done: true };
			for (var i = 1; i < step; i++) { iterator.next(); } // Skip intermediate values (step-1 items)
			n += step;
			return value;

		}

		return haskell.iterable(next);	

	};


	haskell.zip   = function(a, b) {

		// 
		// TODO: Use object to pair up items (eg. { first: value, second: value }) (?)
		return haskell.zipWith(function(fst, snd) { return [fst, snd]; }, a, b) };


	haskell.zipWith = function(f, a, b) {

		//
		// TODO: TEST
		// TODO: Allow any number of iterables
		// TODO: Implement with haskell.map (?)
		var iterators = { a: haskell.iterator(a), b: haskell.iterator(b) };
		// console.log(iterators);
		function next() {
			var first  = iterators.a.next();
			var second = iterators.b.next();
			// console.log(first, second)
			return { value: f(first.value, second.value), done: first.done || second.done };
		}

		return haskell.iterable(next);
		
	};


	haskell.replicate = function(n, value) { return haskell.map(function(_) { return value; }, haskell.range(n)); };


	haskell.map = function(f, iterable) {

		//
		var iter = haskell.iterator(iterable);

		function next() {
			var item = iter.next()
			return { value: f(item.value), done: item.done };
		}

		return haskell.iterable(next);

	};


	haskell.toArray = function(iterable) {

		//
		var array = [];
		// array.push.apply(array, iterable[Symbol.iterator]());
		for (let item of iterable) { array.push(item); }
		return array;

	};


	haskell.runtests = function() {

		//
		console.log('Running tests');

		//
		console.log('Testing haskell.polygon');
		for (let x of haskell.polygon(5, 1.2)) {
			console.log(x);
		}

		//
		console.log('Testing haskell.range');
		for (let x of haskell.range(0, 10, 2)) {
			console.log(x);
		}

		//
		console.log('Testing zipWith');
		for (let x of haskell.zipWith(function(fst, snd) { return [fst, snd, fst*snd]; }, haskell.range(0, 10, 2), haskell.range(0, 10, 1))) {
			console.log(x[0] + ' * ' + x[1] + ' = ' + x[2] + '.');
		}

		//
		console.log('Testing zip');
		for (let x of haskell.zip(haskell.range(0, 10, 2), haskell.range(0, 10, 1))) {
			console.log(x);
		}

		//
		console.log('Testing map');
		for (let x of haskell.map(function (n) { return n*n; }, haskell.range(0, 10))) {
			console.log(x);
		}

		console.log(haskell.toArray(haskell.map(function (n) { return n*n; }, haskell.range(0, 10))));

	};

	console.log(haskell.polygon(1,2));
	// haskell.runtests();

	return haskell;

}());