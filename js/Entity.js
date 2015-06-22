/*
 * Entity.js
 * Bundles a Body and a Mesh and ensures that their rotation and position are the same
 *
 * None
 * June 18 2015
 *

 * TODO | - Generalise transformations (keep a 4x4 matrix, not just a position/rotation vector)
 *        - 

 * SPEC | -
 *        -
 *
 */



var Entity = function(properties) {

	// 
	// TODO: Use $.extend (?)
	// TODO: Better way of implementing 'synonym' keys
	var pr = properties;
	// var defaults = {};

	this.body = new Body({ position:     pr.position     || pr.p,
						   rotation:     pr.rotation     || pr.r,
						   mass:         pr.mass         || pr.m,
						   velocity:     pr.velocity     || pr.v,
						   angular:      pr.angular      || pr.ω,
						   acceleration: pr.acceleration || pr.a,
						   connected:    pr.mesh });

	this.mesh = pr.mesh;


	this.render  = function(modelview, projection) { return this.mesh.render(modelview, projection, this.body.p, this.body.r); }
	this.animate = function(dt)                    { return this.body.animate(dt); };

};