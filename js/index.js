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
	'use strict';

	//
	console.log('Index.js');

	$('.side-nav ul li').each(function(i, e) {
		$(e).css({ backgroundColor: palette.UIColoursList[i%palette.UIColoursList.length] });
	});


	$('div.side-nav').click(function(e) {
		radiotoggle('extended', 'div.side-nav', $(this));
	});


	$('.page').click(function(e) {
		// $(this).
	});


	// var margin = random.choice(['margin-top', 'margin-bottom', 'margin-left', 'margin-right'])
	// $('div.page').css(margin, '100%');
	// setTimeout(function() {
	// 	$('div.page').css('-webkit-transition', margin + ' 1.2s ease').css(margin, '0%'); 
	// 	new Audio('data/audio/swooshing.mp3').play();
	// }, 2.5*1000)

});


function radiotoggle(classname, query, chosen) {
	console.log('Radiotoggle:', classname, query, chosen);
	var hasclass = chosen.hasClass(classname);
	$(query).removeClass(classname);
	chosen[hasclass ? 'removeClass' : 'addClass'](classname);
	return hasclass;
};