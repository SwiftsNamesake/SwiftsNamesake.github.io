/*
 * WaveFront.js
 * Loading WaveFront OBJ models and associated MTL data
 *
 * None
 * June 17 2015
 *

 * TODO | - 
 *        - 

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


	WaveFront.parseMTL = function(mtl) {

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
		var path 	  = parent(filename); // Path to containing folder

		for (var line of mtl.split(/\n+/).filter(notComment)) {
			
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
				materials[current][values[0]] = loadTexture(join(path, values[1]));
			} else if (values[0] == 'newmtl') {
				// New material definition
				current = values[1];
				materials[current] = {};
			} else if (contains(values[0], ['Ns', 'Ni', 'd', 'Tr', 'illum'])) {
				// ?, ?, d(issolved), Tr(ansparent), ?
				// Dissolved and Transparent are synonyms
				console.log('The valid MTL property \'{0}\' is currently unsupported by this parser and will have no effect.'.format(values[0]));
			} else {
				// Unknown parameter encountered
				// throw ValueError('\'{0}\' is not a recognised parameter.'.format(values[0]))
			}

		}

		return materials

	}




	WaveFront.parseOBJ = function(obj) {

		// Parses an OBJ file

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

		for (var line of filter(lambda ln: not (ln.isspace() or ln.startswith('#')), open(filename, 'r'))):

			values = line.split();

			if (values[0] == 'v') {
				// Vertex coordinates
				data['vertices'].append(values.slice(1, 4).map(parseFloat)); // TODO: Handle invalid vertex data
			} else if (values[0] == 'vn') {
				// Vertex normal
				data['normals'].append(values.slice(1, 4).map(parseFloat)); // TODO: Handle invalid normal data
			} else if (values[0] == 'vt') {
				// Texture coordinates
				data['textures'].append(values.slice(1, 3).map(parseFloat)); // TODO: Handle invalid texture data
			} else if (values[0] == 'f') {
				// Face
				// TODO: Save indices instead (would probably save memory) (?)
				// TODO: Refactor (?)
				// TODO: Handle absent values for normals and texture coords
				// TODO: Handle vertex definitions of varying length (eg. 50/2/1 55/2 60)
				var face = [vertex.split('/') for vertex in values[1:]] // Extract indices for each vertex of the face
				console.assert(all(len(vertex) == len(face[0]) for vertex in face))
				// data['faces'].append(data[key][int(vertex[index]-1)] for index, attr in enumerate(('vertices', 'textures', 'normals') if len(face[0])>index) else None)
				// data['faces'].append(data['material'])
				data['faces'].append(([data['vertices'][int(vertex[0])-1] for vertex in face], 								 // Vertices
									  [data['textures'][int(vertex[1])-1] for vertex in face] if len(face[0])>1 else None,   // Texture coordinates
									  [data['normals'][int(vertex[2])-1]  for vertex in face] if len(face[0])>2 else None,   // Normals
									   data['material'])) 																	 // Material
			} else if (values[0] == 'g') {
				// Group
				// print('Adding group:', values[2])
				data['groups'].append((values[2], len(data['faces']))) // Group name with its lower bound (index into faces array)
			} else if (values[0] == 'o') {
				// Object
				// console.log('Ignoring OBJ property \'{0}\''.format(values[0]))
			} else if (values[0] == 's') {
				// Smooth shading
				// console.log('Ignoring OBJ property \'{0}\''.format(values[0]))
			} else if (values[0] == 'mtllib') {
				// MTL library
				// Load materials defined in an external file
				data['mtl'] = parseMTL(join(path, values[1])); // TODO: FIX PATH HANDLING!!!!!
			} else if (values[0] == 'usemtl') {
				// Use MTL material
				// TODO: Handle usemtl (null)
				data['material'] = data['mtl'][values[1]] // Current material
			} else if (contains(values[0], ['l'])) {
				// console.log('Unsure how to handle property \'{0}\'.'.format(values[0]))
			} else {
				// Unknown parameter encountered
				// throw ValueError('\'{0}\' is not a recognised parameter.'.format(values[0]))
			}

		// TODO: Handle data with no group definitions
		var prev = len(data['groups'])
		// print('Groups', data['groups'])
		console.assert(len(data['groups']) == 0 || data['groups'][0][1] == 0, 'All faces must belong to a group. (lowest index is {0})'.format(data['groups'][0][1]))
		
		// Map group names to their lower and upper bounds
		// TODO: Optimise (the tail slice is very expensive, use islice instead)
		// TODO: Refactor (or atleast explain) this line
		data['groups'] = { group : (low, upp) for (group, low), (_, upp) in zip(data['groups'], chain(islice(data['groups'], 1, None), [(None, len(data['faces']))])) }

		// assert len(data['groups']) == prev
		// print('Groups', data['groups'])

		// Meta data
		// TODO: Additional meta data
		// TODO: Return an object instead, to facilitate marshalling (?)
		data['meta'] = {};

		for (let attribute of ['vertices', 'normals', 'faces']) {
			data['meta'][attribute] = data[attribute].length;
		}

		return data

	}


	WaveFront.loadOBJ = function() {};
	WaveFront.loadMTL = function() {};


	return WaveFront;


}());