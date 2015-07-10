/*
 * Camera.js
 * ?
 *
 * Jonatan H Sundqvist
 * July 10 2015
 *

 * TODO | - 
 *        - 

 * SPEC | -
 *        -
 *
 */



var Camera = function(position, rotation) {
	
	//
	// TODO: Use vec3 (?)
	this.position = position || [0,0,0];
	this.rotation = rotation || [0,0,0];

	this.translate = function(vector) {
		this.position.x += vector.x;
		this.position.y += vector.y;
		this.position.z += vector.z;
		return this;
	};

	this.rotate = function(vector) {
		this.rotation.x += vector.x;
		this.rotation.y += vector.y;
		this.rotation.z += vector.z;
		return this;
	};

	this.applyTransformations = function(modelview, projection) {
		//
		mat4.translate(modelview, [-this.position[0], -this.position[1], -this.position[2]]);
		mat4.rotate(modelview, -rotation[0], [1, 0, 0]);
		mat4.rotate(modelview, -rotation[1], [0, 1, 0]);
		mat4.rotate(modelview, -rotation[2], [0, 0, 1]);
	}

};