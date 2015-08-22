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


UIColours = {
	'turquoise':      rgb(26, 188, 156),
    'emerland':       rgb(46, 204, 113),
    'peter-river':    rgb(52, 152, 219),
    'amethyst':       rgb(155, 89, 182),
    'wet-asphalt':    rgb(52, 73, 94),
    'green-sea':      rgb(22, 160, 133),
    'nephritis':      rgb(39, 174, 96),
    'belize-hole':    rgb(41, 128, 185),
    'wisteria':       rgb(142, 68, 173),
    'midnight-blue':  rgb(44, 62, 80),
    'sun-flower':     rgb(241, 196, 15),
    'carrot':         rgb(230, 126, 34),
    'alizarin':       rgb(231, 76, 60),
    'clouds':         rgb(236, 240, 241),
    'concrete':       rgb(149, 165, 166),
    'orange':         rgb(243, 156, 18),
    'pumpkin':        rgb(211, 84, 0),
    'pomegranate':    rgb(192, 57, 43),
    'silver':         rgb(189, 195, 199),
    'asbestos':       rgb(127, 140, 141)
};


var UIColoursList = Object.keys(UIColours).map(function(k) { return UIColours[k]; });


$(document).ready(function() {

	//
	'use strict';

	//
	console.log('Index.js');

	$('.side-nav ul li').each(function(i, e) {
		console.log(i, e);
		$(e).css({ backgroundColor: UIColoursList[i] });
	});

});


function hexpad(n, l) {
	return '0'.repeat(l - Math.log(n)/Math.log(16)) + n.toString(16);
}


function rgb(r, g, b) {
	return '#' + hexpad(r) +
	             hexpad(g) +
	             hexpad(b);
};