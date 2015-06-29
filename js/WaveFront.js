/*
 * WaveFront.js
 * Loading WaveFront OBJ models and associated MTL data
 *
 * None
 * June 17 2015
 *

 * TODO | - Use functional iterators
 *        - Format debugging messages
 *        - Support multiple MTL files (part of standard?) (?)

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
			console.log(line);

			// For each line that is not blank or a comment
			var values = line.split(/\s+/); // Split on space

			if (contains(values[0], ['Ka', 'Kd', 'Ks'])) {
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
			} else if (contains(values[0], ['Ns', 'Ni', 'd', 'Tr', 'illum'])) {
				// ?, ?, d(issolved), Tr(ansparent), ?
				// Dissolved and Transparent are synonyms
				// console.log('The valid MTL property \'{0}\' is currently unsupported by this parser and will have no effect.'.format(values[0]));
			} else {
				// Unknown parameter encountered
				// throw ValueError('\'{0}\' is not a recognised parameter.'.format(values[0]))
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

		var data = { vertices: [], normals: [], textures: [], faces: [], groups: [], mtl: undefined, material: undefined }; //
		// var path 	= parent(filename);  // Path to containing folder

		/*var lookup = {
			'v': undefined,
			'vn': undefined,
			'vt': undefined,
			'f': undefined,
			'g': undefined,
			'o': undefined,
			's': undefined,
			'mtllib': undefined,
			'usemtl': undefined,
			['l']: undefined
		}*/

		for (var line of source.split(/\n+/).filter(WaveFront.notComment)) {

			values = line.split(/\s+/);

			if (values[0] == 'v') {
				// Vertex coordinates
				data.vertices.append(values.slice(1, 4).map(parseFloat)); // TODO: Handle invalid vertex data
			} else if (values[0] == 'vn') {
				// Vertex normal
				data.normals.append(values.slice(1, 4).map(parseFloat)); // TODO: Handle invalid normal data
			} else if (values[0] == 'vt') {
				// Texture coordinates
				data.textures.append(values.slice(1, 3).map(parseFloat)); // TODO: Handle invalid texture data
			} else if (values[0] == 'f') {
				// Face
				// TODO: Save indeces instead (would probably save memory) (?)
				// TODO: Refactor (?)
				// TODO: Handle absent values for normals and texture coords (✓)
				// TODO: Handle vertex definitions of varying length (eg. 50/2/1 55/2 60) ()
				var face = values.slice(1).map(function(vertex) { return vertex.split(/\//) }); // Extract indices for each vertex of the face
				console.assert(face.every(function(vertex) { return vertex.length == face[0].length; }));

				data.faces.append({ vertices:  face.map(function(vertex) { return data.vertices[parseInt(vertex[0])-1]; }), 							// Vertices
									texcoords: face.map(function(vertex) { return face[0].length > 1 ? data.textures[parseInt(vertex[1])-1] : null; }), // Texture coordinates
									normals:   face.map(function(vertex) { return face[0].length > 2 ? data.normals[parseInt(vertex[2])-1]  : null; }), // Normals
									material:  data.material }); 																	                    // Material
			} else if (values[0] == 'g') {
				// Group
				// console.log('Adding group:', values[2])
				// TODO: Use object instead of a two-item array (?) (✓)
				data.groups.append({ name: values[2], lower: len(data['faces']) }) // Group name with its lower bound (index into faces array)
			} else if (values[0] == 'o') {
				// Object
				// console.log('Ignoring OBJ property \'{0}\''.format(values[0]));
			} else if (values[0] == 's') {
				// Smooth shading
				// console.log('Ignoring OBJ property \'{0}\''.format(values[0]));
			} else if (values[0] == 'mtllib') {
				// MTL library
				// Load materials defined in an external file
				data.mtl = parseMTL(join(path, values[1])); // TODO: FIX PATH HANDLING!!!!!
			} else if (values[0] == 'usemtl') {
				// Use MTL material
				// TODO: Handle usemtl (null)
				data.material = data.mtl[values[1]] // Current material
			} else if (contains(values[0], ['l'])) {
				// console.log('Unsure how to handle property \'{0}\'.'.format(values[0]));
			} else {
				// Unknown parameter encountered
				// throw ValueError('\'{0}\' is not a recognised parameter.'.format(values[0]));
			}
		
		}

		// TODO: Handle data with no group definitions
		var prev = data.groups.length;
		// console.log('Groups', data.groups)
		console.assert(data.groups.length == 0 || data.groups[0][1] == 0, 'All faces must belong to a group. (lowest index is {0})'.format(data.groups[0][1]))
		
		// Map group names to their lower and upper bounds
		// TODO: Optimise (the tail slice is very expensive, use islice instead)
		// TODO: Refactor (or atleast explain) this line
		// TODO: NO DICT COMPREHENSIONS IN JAVASCRIPT
		// data.groups = { group : (low, upp) for (group, low), (_, upp) in zip(data.groups, chain(islice(data.groups, 1, None), [(None, len(data['faces']))])) }

		data.groups.append({ name: null, lower: data['faces'].length }); //

		var bounded = {}; //

		for(let group of haskell.zip(data.groups, haskell.islice(1, groups.length, 1))) {
			bounded[group[0].name] = { lower: group[0].lower, upper: group[1].lower };
		}

		data.groups = bounded;

		// assert len(data.groups) == prev
		// console.log('Groups', data.groups)

		// Meta data
		// TODO: Additional meta data
		// TODO: Return an object instead, to facilitate marshalling (?)
		data.meta = {};

		for (let attribute of ['vertices', 'normals', 'faces']) {
			data.meta[attribute] = data[attribute].length;
		}

		return data

	}


	WaveFront.loadOBJ = function(fn) { return $.ajax(fn).then(WaveFront.parseOBJ); };
	WaveFront.loadMTL = function(fn) { return $.ajax(fn).then(WaveFront.parseMTL); };


	return WaveFront;


}());