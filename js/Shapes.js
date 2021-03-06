/*
 * Shapes.js
 * ?
 *
 * None
 * June 17 2015
 *

 * TODO | - Palette defaults (?)
 *        - Caching, saving constants
 *          -- As private variables (?)
 *          -- Make sure all functions are referentially transparent
 *
 *        - Support primitives other than GL.TRIANGLES
 *          -- Include primitive type in return value (?)
 *
 *        - Pure vertex functions (or use parameter to decide whether to include colours) (?)
 *          -- More flexible colour handling
 *
 *        - Separate colours and normals from vertices (?)
 *          -- Allow chaining (eg. shapes.sphere(r).monochrome([r,g,b,a]).normals(...).object()) (?)
 *        -

 * SPEC | -
 *        -
 *
 */



var shapes = (function() {

	//

	"use strict";

	var shapes = {};

	// Default colours for cube and box shapes
	var somecolours = {'top':    [1.00, 0.00, 0.00, 1.00],
					   'bottom': [0.00, 1.00, 0.00, 1.00],
					   'front':  [0.00, 0.00, 1.00, 1.00],
					   'back':   [0.50, 0.00, 0.00, 1.00],
					   'left':   [0.00, 0.50, 0.00, 1.00],
					   'right':  [0.00, 0.00, 0.50, 1.00]};

	const cubesides = ['top', 'bottom', 'front', 'back', 'left', 'right']; // This is a constant


	shapes.box = function(dx, dy, dz, palette) {

		//
		// TODO: Which direction does the Z axis go in (into screen our away from screen)?
		var hx = dx/2, hy = dy/2, hz = dz/2;  //
		var palette = palette || somecolours; //

		// All unique vertices (each vertex is used three times in a cube)
		// (L|R T|B F|B) => (Left|Right Top|Bottom Front|Back)
		var unique = [[-hx,  hy, -hz],  // LTF (0)
					  [-hx,  hy,  hz],  // LTB (1)
					  [ hx,  hy,  hz],  // RTB (2)
					  [ hx,  hy, -hz],  // RTF (3)
					  [-hx, -hy, -hz],  // LBF (4)
					  [-hx, -hy,  hz],  // LBB (5)
					  [ hx, -hy,  hz],  // RBB (6)
					  [ hx, -hy, -hz]]; // RBF (7)

		var normals = {
			left:   [-1,  0,  0], //
			right:  [ 1,  0,  0], //
			top:    [ 0,  1,  0], //
			bottom: [ 0, -1,  0], //
			front:  [ 0,  0, -1], // Backwards (because the normal of the front points backwards)
			back:   [ 0,  0,  1]  // Forwards  (becase the normal of the back points forwards)
		}

		// TODO: Cache this constant array (?)
		const indeces = [0, 1, 3, 3, 1, 2,  // Top    (✓)
						 4, 5, 7, 7, 5, 6,  // Bottom (✓)
						 0, 3, 4, 4, 3, 7,  // Front  (✓)
						 1, 2, 5, 5, 2, 6,  // Back   (✓)
						 0, 1, 4, 4, 1, 5,  // Left   (✓)
						 3, 2, 7, 7, 2, 6]; // Right  (✓)

		var vertices = indeces.map(function(index)    { return unique[index]; });
		var colours  = indeces.map(function(index, i) { return palette[cubesides[Math.floor(i/6)]]; });
		var normals  = indeces.map(function(index, i) { return normals[cubesides[Math.floor(i/6)]]; });

		return { vertices: vertices.flatten(), colours: colours.flatten(), normals: normals.flatten() }; // TODO: Decide whether to concat buffers or keep them as they are

	};



	shapes.cube = function(side, palette) { return shapes.box(side, side, side, palette); };



	shapes.rectangle = function(dx, dy, colour) {

		// A monochrome rectangle parallel to the XY plane
		var hdx = dx/2;
		var hdy = dy/2;

		var vertices = [[-hdx, -hdy, 0.00],
						[-hdx,  hdy, 0.00],
						[ hdx,  hdy, 0.00],
						[-hdx, -hdy, 0.00],
						[ hdx,  hdy, 0.00],
						[ hdx, -hdy, 0.00]];

		return shapes.monochrome(vertices, vertices.map(function(_) { return [0, 0, -1]; }), colour);

	};


	// shapes.plane = function() {};
	// shapes.planeXY = function() {};
	// shapes.planeXZ = function() {};
	// shapes.planeYZ = function() {};



	shapes.sphere = function(radius, palette) {

		//
		// TODO: Use indeces
		// TODO: Use palette

		//
		// TODO: Normals
		// TODO: Spheroids and partial spheres
		// TODO: Texture and colours
		// TODO: Shading
		// TODO: Plenty of room for optimisation (eg. unit sphere + scaling, using indeces, etc.)
		var vertices = [];
		var colours  = [];
		var normals  = [];

		const resolution = 5.0;         // TODO: Better name (?)
		const dx = radius / resolution; // The distance between adjacent circles

		// TODO: Use the same number of longitudinal and latitudinal segments (?)
		const segments = 18;        // For now. Juicy, delicious segments.
		const angle = 2*π/segments; // Internal angle of a segment (degrees)

		var radiusLeft  = Math.sqrt(radius*radius);         // Radius of the left-hand circle
		var radiusRight = Math.sqrt(radius*radius - dx*dx); // Radius of the right-hand circle

		const dTheta = π/segments;

		var normalise = function(vec) { return [vec[0]/radius, vec[1]/radius, vec[2]/radius]; }

		for (var xSegment = 0; xSegment <= segments; xSegment++) {

			//
			var θ  = xSegment * dTheta;
			var rightX = radius * Math.cos(θ);
			var leftX  = radius * Math.cos(θ+dTheta);

			radiusLeft  = Math.sqrt(radius*radius - leftX*leftX);
			radiusRight = Math.sqrt(radius*radius - rightX*rightX);
			
			for (var segment = 0; segment <= segments; segment++) {
				vertices.push([leftX,  radiusLeft  * Math.sin(segment*angle), radiusLeft  * Math.cos(segment*angle)]);
				vertices.push([rightX, radiusRight * Math.sin(segment*angle), radiusRight * Math.cos(segment*angle)]);
			}

		}

		// TODO: 
		var data = shapes.monochrome(vertices, vertices.map(function(_) { return [1,0,0]; }), [1.0, 0.0, 0.0, 1.0]);
		data.normals = vertices.map(function(v) { return normalise(v); }).flatten();
		return data;

	};



	shapes.cylinder = function(radius, height, palette) {
		
		//
		// TODO: Use the palette
		// TODO: Normals
		// TODO: Add top and bottom (?)
		var vertices = [];
		var colours  = [];

		const segments = 18;
		const θ = 2*π / segments;
		
		for (var segment = 0; segment <= segments; ++segment) {
			var x = radius*Math.cos(θ*segment);
			var z = radius*Math.sin(θ*segment);

			vertices.push([x, -height/2, z]);
			vertices.push([x,  height/2, z]);
		}

		return shapes.monochrome(vertices, vertices.map(function(v) { return [1,0,0]; }), [1.0, 0.0, 0.0, 1.0]);

	};



	shapes.cone = function(radius, height, palette) {

		//
		// TODO: Use palette
		// TODO: Create proper normals
		var vertices = [];
		var colours  = [];

		const segments = 18;
		const θ = 2*π / segments;

		for (var segment = 0; segment <= segments; ++segment) {
			var x = radius*Math.cos(θ*segment);
			var z = radius*Math.sin(θ*segment);
			vertices.push([x, -height/2, z]);
			vertices.push([0,  height/2, 0]);
		}
		
		return shapes.monochrome(vertices, vertices.map(function(_) { return [1,0,0]; }), [1.0, 0.0, 0.0, 1.0]);

	};



	shapes.pyramid = function(dx, dz, height, palette) {

		//
		// TODO: Use palette
		// TODO: Create proper normals

		var hx = dx/2, hz = dz/2, hHeight = height/2; //

		var unique = [[  0,  hHeight,   0],  // Summit      (0)
					  [-hx, -hHeight, -hz],  // Left  back  (1)
 					  [ hx, -hHeight, -hz],  // Right back  (2)
 					  [ hx, -hHeight,  hz],  // Right front (3)
 					  [-hx, -hHeight,  hz]]; // Left  front (4)

 		var indeces = [3, 4, 0,  // Front
 		               1, 2, 0,  // Back
 		               4, 1, 0,  // Left
 		               2, 3, 0,  // Right
 		               4, 3, 2,  // Base (first half)
 		               2, 1, 4]; // Base (second half)

 		var vertices = indeces.map(function(index) { return unique[index]; }).flatten(); //
 		var colours  = ['front',  'front',  'front',
 		                'back',   'back',   'back',
 		                'left',   'left',   'left',
 		                'right',  'right',  'right',
 		                'bottom', 'bottom', 'bottom',
 		                'bottom', 'bottom', 'bottom'].map(function(side) { return (palette || somecolours)[side]; }).flatten();

		return { vertices: vertices, colours: colours, normals: vertices.map(function(_) { return [1,0,0]; }) };

	};



	shapes.spiral = function(radius, dy, inclination, revolutions, palette) {

		// Renders a one-dimensional spiral
		// TODO: Come up with a better name for dy/revolution (height) (cf. inclination) (✓)
		// TODO: Use palette
		// TODO: Add normals

		var vertices = [];

		const segments = 18;             // Segments per revolution
		const delta    = 2*π/segments; // Internal angle of a single segment

		for (var segment = 0; segment <= segments * revolutions; ++segment) {
			var y = inclination * segment/segments;
			vertices.push([radius*Math.cos(segment*delta), y,    radius*Math.sin(segment*delta)]);
			vertices.push([radius*Math.cos(segment*delta), y+dy, radius*Math.sin(segment*delta)]);
		}

		return { vertices: indeces.map(function(index) { return unique[index]; }).flatten(), colours: colours, normals: vertices.map(function(_) { return [1,0,0]; }) };

	};



	shapes.cartesian = function(origin, extents, markerstep) {

		//

	}



	shapes.monochrome = function(vertices, normals, colour) {
		// Creates a monochrome shape.
		return { vertices: vertices.flatten(), colours: vertices.map(function(_) { return colour; }).flatten(), normals: normals.flatten() };
	};



	shapes.merge = function() {
		//
		// components|constituents|parts
		// TODO: Rename (?)
		// TODO: Disparate (non-attached) objects
		// TODO: Let Mesh class handle composites instead (?)
		// TODO: Rotations and offsets when merging shapes
		// return
	};


	// Functions for producing meta data
	shapes.bounds = function(vertices) {
		// Calculates the maximum and minimum X, Y and Z coordinates for the vertex array
		// Right is positive X, upwards is positive Y and inwards is positive Z
		// TODO: Create vertex data for bounding box (?)
		return {
			left:   Math.min.apply(null, vertices.map(function(v) { return v[0] })),
			right:  Math.max.apply(null, vertices.map(function(v) { return v[0] })),
			top:    Math.max.apply(null, vertices.map(function(v) { return v[1] })),
			bottom: Math.min.apply(null, vertices.map(function(v) { return v[1] })),
			front:  Math.min.apply(null, vertices.map(function(v) { return v[2] })),
			back:   Math.max.apply(null, vertices.map(function(v) { return v[2] }))
		};
	};

	return shapes;



}());