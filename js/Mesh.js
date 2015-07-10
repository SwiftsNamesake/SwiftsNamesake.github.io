/*
 * Mesh.js
 * Encapsulates a set of buffers and attributes needed to render a single mesh.
 *
 * None
 * June 17 2015
 *

 * TODO | - Custom shaders (?)
 *        - Load from file (cf. WaveFront)
 *        - Change geometry at runtime
 *        - Textures and materials
 *        - Index buffers
 *        - Separate physics attributes/console.logic (eg. create a Body type)
 *          -- If we let wrapper objects worry about position/rotation, we can re-use the same mesh without risking interference
 *
 *        - Queries, metadata (volume, collisions, boolean operations, contours, etc.)
 *
 *        - Inheritance
 *          -- Common solids and 2D shapes (triangle, rectangle, block, cube, sphere, cone, cylinder, dodecahedron, etc.)
 *
 *        - Robustness
 *          -- logging and debugging
 *          -- Type-checking, function signatures
 
 * SPEC | -
 *        -
 *
 */



var Mesh = function(context, data, name) {

	//
	// TODO: Accept single object as argument (?)
	// TODO: Don't hard-code colour size (optional alpha) (?)
	// var texture = context.createBuffer(data.texture, 2)
	'use strict';

	this.name = name; 
	console.log('Creating Mesh: ' + this.name);
	
	console.assert(data.normals !== undefined, 'Normals needed!');
	
	console.assert(data.vertices.length % 3 === 0);
	console.assert(data.normals.length  % 3 === 0);
	console.assert(data.colours.length  % 4 === 0);
	
	console.assert(data.normals.length === data.vertices.length)
	console.assert((data.vertices.length/3) === (data.colours.length/4), (data.vertices.length/3 - data.colours.length/4)); // TODO: Floating-point issues (?)

	this.vertices = context.createBuffer(data.vertices, 3); //
	this.colours  = context.createBuffer(data.colours,  4); //
	this.normals  = data.normals !== undefined ? context.createBuffer(data.vertices, 3) : undefined;
	if ((data.textures || new Set()).size > 0) {
		console.log('Mesh has textures. Loading...');
		this.texcoords = context.createBuffer(data.texcoords, 2);
		this.textures  = [];
		for (var texture of data.textures) {
			// TODO: Path
			var path = 'https://swiftsnamesake.github.io/data/models/';
			context.loadTexture(path+texture).then(function(tex) {
				console.log('Loaded texture');
				this.textures.push(tex);
			});
		}
	} else {
		console.log(this.name + 'is not textured. Creating dummy buffer...');
		this.texcoords = context.createBuffer(data.vertices.map(function(_) { return [0,0] }).flatten(), 2);
	}

	this.buffers = { vertex: this.vertices, colour: this.colours, normal: this.normals, texcoords: (this.texcoords || []) }
	this.primitive = context.context.TRIANGLES; // Triangles by default


	this.render = function(uniforms, position, rotation) { context.renderVertices(this.buffers, this.primitive, uniforms, position, rotation); }

	// this.addColour = function (rgb) {}
	// this.addTexture = function (path) {}

}