/*
 * Shapes.js
 * ?
 *
 * None
 * June 17 2015
 *

 * TODO | - Palette defaults (?)
 *        - Caching, saving constants

 * SPEC | -
 *        -
 *
 */



var shapes = (function() {

	//
	var shapes = {};

	var somecolours = {'top':    [1.00, 0.00, 0.00, 1.00],
					   'bottom': [0.00, 1.00, 0.00, 1.00],
					   'front':  [0.00, 0.00, 1.00, 1.00],
					   'back':   [0.50, 0.00, 0.00, 1.00],
					   'left':   [0.00, 0.50, 0.00, 1.00],
					   'right':  [0.00, 0.00, 0.50, 1.00]};

	var sides = ['top', 'bottom', 'front', 'back', 'left', 'right']; // This is a constant



	shapes.cube = function(side, palette) {

		//
		// (L|R T|B F|B) => (Left|Right Top|Bottom Front|Back)
		// TODO: Which direction does the Z axis go in (into screen our away from screen)?
		var half    = side/2;
		var palette = palette || somecolours; //

		var unique = [[-half,  half, -half],  // LTF (0)
					  [-half,  half,  half],  // LTB (1)
					  [ half,  half,  half],  // RTB (2)
					  [ half,  half, -half],  // RTF (3)
					  [-half, -half, -half],  // LBF (4)
					  [-half, -half,  half],  // LBB (5)
					  [ half, -half,  half],  // RBB (6)
					  [ half, -half, -half]]; // RBF (7)

		// TODO: This is really a constant (worth caching?)
		var indeces = [0, 1, 3, 3, 1, 2,  // Top    (✓)
					   4, 5, 7, 7, 5, 6,  // Bottom (✓)
					   0, 3, 4, 4, 3, 7,  // Front  (✓)
					   1, 2, 5, 5, 2, 6,  // Back   (✓)
					   0, 1, 4, 4, 1, 5,  // Left   (✓)
					   3, 2, 7, 7, 2, 6]; // Right  (✓)


		var vertices = indeces.map(function(index)    { return unique[index]; });
		var colours  = indeces.map(function(index, i) { return palette[sides[Math.floor(i/6)]]; });

		return { vertices: vertices.flatten(), colours: colours.flatten() }; // TODO: Decide whether to concat buffers or keep them as they are

	};



	shapes.rectangle = function(dx, dy, colour) {

		// A monochrome rectangle parallel to the XY plane
		var hdx = dx/2;
		var hdy = dy/2;

		var vertices = [[-hdx, -hdy, 0.00],
						[-hdx,  hdy, 0.00],
						[ hdx,  hdy, 0.00],
						[-hdx, -hdy, 0.00],
						[ hdx,  hdy, 0.00],
						[ hdx, -hdy, 0.00]].flatten();

		var colours = vertices.map(function(_) { return colour; }).flatten();

		return { vertices: vertices, colours: colours };

	};


	// this.plane = function() {};
	// this.planeXY = function() {};
	// this.planeXZ = function() {};
	// this.planeYZ = function() {};



	this.sphere = function(radius, palette) {

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

		const resolution = 5.0;         // TODO: Better name (?)
		const dx = radius / resolution; // The distance between adjacent circles

		// TODO: Use the same number of longitudinal and latitudinal segments (?)
		const segments = 18;             // For now. Juicy, delicious segments.
		const angle = 360.0/segments; // Internal angle of a segment (degrees)

		var radiusLeft  = Math.sqrt(radius*radius);         // Radius of the left-hand circle
		var radiusRight = Math.sqrt(radius*radius - dx*dx); // Radius of the right-hand circle

		const dTheta = 180.0/segments;

		for (var xSegment = 0; xSegment <= segments; xSegment++) {

			//
			var theta  = xSegment * dTheta;
			var rightX = radius * cosine(theta);
			var leftX  = radius * cosine(theta+dTheta);

			radiusLeft  = Math.sqrt(radius*radius - leftX*leftX);
			radiusRight = Math.sqrt(radius*radius - rightX*rightX);
			
			for (var segment = 0; segment <= segments; segment++) {
				vertices.push(leftX,  radiusLeft  * Math.sin(segment*angle), radiusLeft  * Math.cos(segment*angle));
				vertices.push(rightX, radiusRight * Math.sin(segment*angle), radiusRight * Math.cos(segment*angle));
			}

		}

		return this.monochrome(vertices, [1.0, 0.0, 0.0, 1.0]);

	}



	this.cylinder = function(radius, height, palette) {
		
		//
		// TODO: Use the palette
		var vertices = [];
		var colours  = [];

		const segments = 18;
		const θ = 360.0 / segments;
		
		for (var segment = 0; segment <= segments; ++segment) {
			//
			var x = radius*cosine(θ*segment), z = radius*sine(θ*segment);
			// glColor4f(color.r, color.g, color.b, color.a);
			vertices.push(x, -height/2, z);
			vertices.push(x,  height/2, z);
		}

		return this.monochrome(vertices, [1.0, 0.0, 0.0, 1.0]);

	}



	this.cone = function(radius, height) {

		//
		var vertices = [];
		var colours  = [];

		const segments = 18;
		const θ = 360.0 / segments;

		for (int segment = 0; segment <= segments; ++segment) {
			// glColor3f(0.2f, 0.35f, 0.65f);
			vertices.push(radius*cosine(theta*segment), -height/2, radius*sine(theta*segment));
			vertices.push(0.0,                          height/2, 0.0);
		}

		return this.monochrome(vertices, [1.0, 0.0, 0.0, 1.0]);

	}



	this.pyramid = function(dx, dz, height, palette) {

		//
		// TODO: Use palette
		var colours  = [];

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

		return this.monochrome(indeces.map(function(index) { return unique[index]; }).flatten(), [1.0, 0.0, 0.0, 1.0]);

	}



	this.spiral = function(radius, dy, inclination, revolutions, palette) {

		// Renders a one-dimensional spiral
		// TODO: Come up with a better name for dy/revolution (height) (cf. inclination) (✓)
		// TODO: Use palette

		var vertices = [];

		const segments = 18;             // Segments per revolution
		const delta    = 360.0/segments; // Internal angle of a single segment

		for (int segment = 0; segment <= segments * revolutions; ++segment) {
			var y = inclination * segment/segments;
			vertices.push(radius*cosine(segment*delta), y,    radius*sine(segment*delta));
			vertices.push(radius*cosine(segment*delta), y+dy, radius*sine(segment*delta));
		}

		return { vertices: indeces.map(function(index) { return unique[index]; }).flatten(), colours: colours };

	}



	shapes.monochrome = function(vertices, colour) {
		// Creates a monochrome shape.
		return { vertices: vertices.flatten(), colours: vertices.map(function(_) { return colour; }).flatten() };
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



	return shapes;



}());