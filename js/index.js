/*
 * index.js
 * ?
 *
 * None
 * August 22 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 *
 */



$(document).ready(function() {

	//
	console.log('Index.js');

	$('.side-nav ul li').each(function(i, e) {
		console.log(i, e);
		$(e).css({ backgroundColor: ['#CC1C5F', '#FFC126', 'CF0C14'][i] });
	});

});