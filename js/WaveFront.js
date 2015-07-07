/*
 * WaveFront.js
 * Loading WaveFront OBJ models and associated MTL data
 *
 * None
 * June 17 2015
 *

 * TODO | - Use functional iterators
 *
 *        - Logging
 *          -- Format debugging messages
 *
 *        - Support multiple MTL files (part of standard?) (?)
 *        - Figure out resource dependencies (MTL/textures/etc.)
 *          -- Include a list of MTL dependencies in the return object (?)
 *          -- High-level API function for loading an OBJ file and related material files
 *
 *        - Support index arrays (setting?)
 *        - Optimise, profile
 *
 *        - Decide on an API
 *          -- Hide internal utility functions (?)
 *
 *        - Fix parser bugs
 *          -- Formal spec compliance
 *          -- Support coordinates inside parentheses
 *
 *        - User hooks, configurability
 *          -- Scaling, centering
 *          -- Decide what to do with groups and objects
 *
 *        - Meta data
 *          -- Bounding boxes
 *
 *        - Polygons
 *          -- Fix WaveFront.tessellate
 *          -- Assume clockwise vertices (?)

 * SPEC | -
 *        -
 *
 */



var WaveFront = (function() {

	//

	"use strict";

	var WaveFront = {};

	WaveFront.notComment = function(line) { return /^\s*#/.exec(line) === null; }
	WaveFront.contains   = function(element, list) { return list.indexOf(element) !== (-1); }


	WaveFront.parseMTLLine = function(line) {};
	WaveFront.parseOBJLine = function(line) {};


	WaveFront.tessellate = function(vertices) {

		// Divides a flat polygon [[Float]] into triangles [[Float]]
		// TODO: Optimise
		// TODO: Support convex shapes
		// TODO: Verify 'flatness' (?)
		// TODO: Verify correctness, tests
		var focal = vertices[0]; // 
		var triangles = vertices.slice(1, vertices.length-1).map(function(v, i) { return [focal, v, vertices[i+2]]; }).flatten();

		console.assert(triangles.every(function(t) { return (typeof t !== 'undefined') && ((typeof t[0])+(typeof t[1])+(typeof t[2])) === 'numbernumbernumber'; }), vertices);
		console.assert(vertices[0].length === 3);
		console.assert(triangles[0].length === 3);

		console.assert((vertices.length-2)*3 === triangles.length);
		if (vertices.length === 3) { console.assert(vertices.every(function(v, i) { return v === triangles[i]; })); }
		return triangles;
		// return vertices;
	}



	WaveFront.parseMTL = function(source) {

		// Parses an MTL file

		// Adapted from my Python MTL parser

		// TODO: Spec compliance
		// TODO: Blender compliance (MTL properties: Ns, Ni, d, illum)

		// From Wikipedia:
		// 0. Color on and Ambient off
		// 1. Color on and Ambient on
		// 2. Highlight on
		// 3. Reflection on and Ray trace on
		// 4. Transparency: Glass on, Reflection: Ray trace on
		// 5. Reflection: Fresnel on and Ray trace on
		// 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
		// 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
		// 8. Reflection on and Ray trace off
		// 9. Transparency: Glass on, Reflection: Ray trace off
		// 10. Casts shadows onto invisible surfaces

		//throw NotImplementedError('Walk along. Nothing to see here.')

		// console.log('Parsing MTL file: %s\n' % filename, kind='log')

		"use strict";
		
		var materials = {}; 			  // TODO: Dict comprehension, itertools, split on "newmtl" (?)
		var current   = undefined; 		  // Name of the current material
		// var path 	  = parent(filename); // Path to containing folder

		for (var line of source.split(/\n+/).filter(WaveFront.notComment)) {
			
			// TODO: Decide between abbreviated and full-length keys
			// console.log(line);

			// For each line that is not blank or a comment
			var values = line.split(/\s+/); // Split on space

			if (WaveFront.contains(values[0], ['Ka', 'Kd', 'Ks'])) {
				// Ambient, Diffuse and Specular
				// TODO: Convert to tuple (?)
				materials[current][values[0]] = values.slice(1).map(parseFloat); // (R, G, B, A) channels
			} else if (values[0] == 'map_Kd') {
				// Texture
				materials[current][values[0]] = values[1]; //loadTexture(join(path, values[1]));
			} else if (values[0] == 'newmtl') {
				// New material definition
				current = values[1];
				materials[current] = {};
			} else if (WaveFront.contains(values[0], ['Ns', 'Ni', 'd', 'Tr', 'illum'])) {
				// ?, ?, d(issolved), Tr(ansparent), ?
				// Dissolved and Transparent are synonyms
				console.log('The valid MTL property \'{0}\' is currently unsupported by this parser and will have no effect.'); //.format(values[0]));
			} else {
				// Unknown parameter encountered
				console.log('\'{0}\' is not a recognised parameter.'); //.format(values[0]))
				// throw ValueError('\'{0}\' is not a recognised parameter.'); //.format(values[0]))
			}

		}

		return materials

	}




	WaveFront.parseOBJ = function(source) {

		// Parses the contents of an OBJ file

		// TODO: Use namedtuple to pack face data (?)
		// TODO: Difference between groups and objects (?)
		// TODO: Handle multiple groups properly (eg. g group1 group2 group3)
		// TODO: Handle convex polygons correctly

		// TODO: Handle 'off' instruction

		// TODO: Spec compliance
		// TODO: Blender compliance

		//throw NotImplementedError('Walk along. Nothing to see here.')

		// console.log('Parsing OBJ file: %s\n' % filename, kind='log')

		"use strict";

		// TODO: Rename mtl (?)
		// TODO: Separate intermediary data (the components of the 'state machine', eg. mtl, material) and the final output (?)
		var data = { vertices:  [], // Unique vertices
		             normals:   [], // Unique normal vectors
		             texcoords: [], // Unique texture coordinates
		             faces:     [], // Faces ([{vertices: [[Double]], normals: [[Double]], texcoords: [[Double]], material: String })
		             groups:    [], // List of group objects ({name: String, lower: Int}), converted to a dictionary ({name: { lower: Int, upper: Int }}) at the end
		             mtl:       undefined,   // Current MTL file (as defined by the most recent mtllib statement)
		             material:  undefined,   // Current MTL material name (as defined by the most recent usemtl statement)
		             dependencies: new Set() // A set of the names of all MTL dependencies for this OBJ model
		           };

		for (var line of source.split(/\n+/).filter(WaveFront.notComment)) {

			var values = line.trim().split(/\s+/); // TODO: This seems to be the cause of the pesky 'undefined' bug

			if (values[0] == 'v') {
				// Vertex coordinates
				data.vertices.push(values.slice(1, 4).map(parseFloat)); // TODO: Handle invalid vertex data
				console.assert(data.vertices[data.vertices.length-1].indexOf(NaN) === (-1), values);
			} else if (values[0] === 'vn') {
				// Vertex normal
				data.normals.push(values.slice(1, 4).map(parseFloat)); // TODO: Handle invalid normal data
			} else if (values[0] === 'vt') {
				// Texture coordinates
				data.texcoords.push(values.slice(1, 3).map(parseFloat)); // TODO: Handle invalid texture data
			} else if (values[0] === 'f') {
				// Face
				// TODO: Save indeces instead (would probably save memory) (?)
				// TODO: Refactor (?)
				// TODO: Handle absent values for normals and texture coords (✓)
				// TODO: Calculate normals automatically if they're missing (?)
				// TODO: Handle vertex definitions of varying length (eg. 50/2/1 55/2 60)
				var face = values.slice(1).map(function(vertex) { return vertex.split(/\//) }); // Extract indices for each vertex of the face
				// console.assert(face.every(function(vertex) { return vertex.length === face[0].length; }));

				data.faces.push({ vertices:  face.map(function(vertex) { return parseInt(vertex[0])-1; }),                             // Vertices
								  texcoords: face.map(function(vertex) { return face[0].length > 1 ? parseInt(vertex[1])-1 : null; }), // Texture coordinates
								  normals:   face.map(function(vertex) { return face[0].length > 2 ? parseInt(vertex[2])-1 : null; }), // Normals
								  material:  data.material });                                                                         // Material
			} else if (values[0] === 'g') {
				// Group
				// console.log('Adding group:', values[2])
				// TODO: Use object instead of a two-item array (?) (✓)
				data.groups.push({ name: values[2], lower: data.faces.length }) // Group name with its lower bound (index into faces array)
			} else if (values[0] === 'o') {
				// Object
				console.log('Ignoring OBJ property \'{0}\''); //.format(values[0]));
			} else if (values[0] === 's') {
				// Smooth shading
				console.log('Ignoring OBJ property \'{0}\''); //.format(values[0]));
			} else if (values[0] === 'mtllib') {
				// MTL library
				data.mtl = values[1]; //WaveFront.parseMTL(join(path, values[1])); // TODO: FIX PATH HANDLING!!!!!
				data.dependencies.add(values[1]);
			} else if (values[0] === 'usemtl') {
				// Use MTL material
				// TODO: Handle usemtl (null)
				data.material = { file: data.mtl, material: values[1] }; //data.mtl[values[1]] // Current material
			} else if (WaveFront.contains(values[0], ['l'])) {
				console.log('Unsure how to handle property \'{0}\'.'); //.format(values[0]));
			} else {
				// Unknown parameter encountered
				console.log('\'{0}\' is not a recognised parameter.'); //.format(values[0]))
				// throw ValueError('\'{0}\' is not a recognised parameter.'); //.format(values[0]))
			}
		
		}

		// TODO: Handle data with no group definitions
		var prev = data.groups.length;
		// console.log('Groups', data.groups)
		// console.assert(data.groups.length === 0 || data.groups[0][1] === 0, 'All faces must belong to a group. (lowest index is {0})'); //.format(data.groups[0][1]))
		// console.assert(data.groups.length === 0 || data.groups[0][1] === 0, 'All faces must belong to a group. (lowest index is ' + data.groups.lower + ')')

		
		// Map group names to their lower and upper bounds
		// TODO: Optimise (the tail slice is very expensive, use islice instead)
		// TODO: Refactor (or atleast explain) this line
		// TODO: NO DICT COMPREHENSIONS IN JAVASCRIPT
		// data.groups = { group : (low, upp) for (group, low), (_, upp) in zip(data.groups, chain(islice(data.groups, 1, None), [(None, len(data['faces']))])) }

		data.groups.push({ name: null, lower: data['faces'].length }); //

		var bounded = {}; //

		for (var group of haskell.zip(data.groups, haskell.slice(data.groups, 1, data.groups.length))) {
			bounded[group[0].name] = { lower: group[0].lower, upper: group[1].lower };
		}

		data.groups = bounded;

		// assert len(data.groups) === prev
		// console.log('Groups', data.groups)

		// Meta data
		// TODO: Additional meta data (eg. bounding box)
		// TODO: Return an object instead, to facilitate marshalling (?)
		data.meta = {};

		for (var attribute of ['vertices', 'normals', 'faces']) {
			data.meta[attribute] = data[attribute].length;
		}

		// TODO: Fill this in
		data.bounds = shapes.bounds(data.vertices);

		data.vertices.map(function(v, i) { console.assert(v.indexOf(NaN) === (-1) && v.indexOf(undefined) === (-1) && v.length === 3, 'Invalid vertex at ' + i); });

		return data

	}


	WaveFront.loadOBJ = function(fn) { return $.ajax(fn).then(WaveFront.parseOBJ); };
	WaveFront.loadMTL = function(fn) { return $.ajax(fn).then(WaveFront.parseMTL); };

	WaveFront.loadMeshes = function(context, fn, path) {

		//
		// TODO: Assume the MTL files are in the same directory (?)
		console.log('Loading OBJ file: ', fn);
		console.log('Path to MTL files is: ', path);

		return WaveFront.loadOBJ(fn).then(function(OBJ) {

			//
			var count = OBJ.dependencies.size;
			console.log('Finished loading OBJ file: ', fn);
			console.log('Loading ' + linguist.numeral(count)  + ' MTL dependenc' + (count === 1 ? 'y' : 'ies') + '.');
			
			OBJ.path = fn; // TODO: Remove this in 'release builds' (?)

			var dependencies = [];
			for (var name of OBJ.dependencies) {
				// Make sure the callback inside the loop is not affected by scoping issues w.r.t 'name'.
				dependencies.push(WaveFront.loadMTL(path + name).then(function(MTL) {
					console.log('Loaded MTL file: ', name);
					return { name: name, data: MTL };
				}));
			}

			return $.when.apply($, dependencies).then(function() {
				var MTLs = {};
				for (var MTL of arguments) {
					MTLs[MTL.name] = MTL.data;
				}

				return WaveFront.createMeshes(context, OBJ, MTLs);

			});
		});

	};


	WaveFront.createMeshes = function(context, OBJ, MTLs) {

		// Creates a dictionary of mesh objects ({groupname: mesh}) from parsed OBJ and MTL data
		// TODO: Optimise arrays
		// TODO: Use index buffers
		// TODO: Support textures and normals
		// TODO: Support all MTL attributes
		// TODO: Create one mesh per group or object (what's the difference?)
		// TODO: Handle faces with more than three vertices
		console.log('\n%cCreating mesh for ' + OBJ.path, "background: green; font-size: 28pt; ");

		// One list of coordinates per face [[Float]]
		var vertices = OBJ.faces.map(function(f, i) { return WaveFront.tessellate(f.vertices.map(function(vi) { return OBJ.vertices[vi]; })) }).flatten();
		var normals  = OBJ.faces.map(function(f) { return f.normals.map(function(n) { return OBJ.normals[n];  }).flatten(); });
		var colours  = OBJ.faces.map(function(f, i) {
			var colours = [];

			var ambient  = MTLs[f.material.file][f.material.material]['Ka'];
			var diffuse  = MTLs[f.material.file][f.material.material]['Kd'];
			var specular = MTLs[f.material.file][f.material.material]['Ks'];

			var colour = [((ambient[0]||0)+(diffuse[0]||0)+(specular[0]||0))/3,
			              ((ambient[1]||0)+(diffuse[1]||0)+(specular[1]||0))/3,
			              ((ambient[2]||0)+(diffuse[2]||0)+(specular[2]||0))/3,
			              ((ambient[3]||1)+(diffuse[3]||1)+(specular[3]||1))/3];

			// TODO: Don't hard-code the count
			for (var n = 0; n < (f.vertices.length-2)*3; n++) { colours.push(colour); }
			return colours;
		}).flatten();

		// var texcoords = OBJ.faces.map(function(f) { return f.texcoords.map(function(t) { return OBJ.texcoords[t]; }); }).flatten();
		return new Mesh(context, { vertices: vertices.flatten(), colours: colours.flatten() });

	};


	return WaveFront;


}());