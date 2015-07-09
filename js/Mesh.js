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
 *          -- console.logging and debugging
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
	if (name) { console.log('Creating Mesh: ' + name); this.name = name; }
	console.assert(data.normals !== undefined, 'Normals needed!');

	
	console.assert(data.vertices.length % 3 === 0);
	console.assert(data.normals.length  % 3 === 0);
	console.assert(data.colours.length  % 4 === 0);
	
	console.assert(data.normals.length === data.vertices.length)
	console.assert((data.vertices.length/3) === (data.colours.length/4), (data.vertices.length/3 - data.colours.length/4)); // TODO: Floating-point issues (?)

	this.vertices = context.createBuffer(data.vertices, 3); //
	this.colours  = context.createBuffer(data.colours,  4); //
	this.normals  = data.normals !== undefined ? context.createBuffer(data.vertices, 3) : undefined;
	this.buffers = { vertex: this.vertices, colour: this.colours, normal: this.normals }
	// console.log(this.vertices, this.colours)

	this.primitive = context.context.TRIANGLES; // Triangles by default

	// this.position = position || [0.0, 0.0, 0.0];
	// this.rotation = rotation || [0.0, 0.0, 0.0];


	this.render = function(modelview, projection, position, rotation) { context.renderVertices(this.buffers, position, rotation, modelview, projection); }

	// this.addColour = function (rgb) {}
	// this.addTexture = function (path) {}

}