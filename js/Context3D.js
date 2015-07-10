/*
 * Context3D.js
 * Enhances the plain WebGL context object with auxiliary methods (mostly boilerplate)
 *
 * None
 * June 17 2015
 *

 * TODO | - Use 'global' matrices or accept them as arguments (matrix stack) (?)
 *        - Make certain methods and attributes private (eg. create)
 *        - Set plain context object as prototype (?)

 * SPEC | -
 *        -
 *
 */



var Context3D = function(canvas) {

	//
	'use strict';

	this.create = function(canvas) {

		//
		var context;

		try {
			context = canvas.getContext('experimental-webgl');
			context.viewportWidth  = canvas.width;
			context.viewportHeight = canvas.height;
			console.log('%cCreated 3D context.', 'background-color: green;');
			return context;
		} catch (e) {
			if (!context) {
				console.error('Download a modern browser, you fossil!');
				return undefined;
			} else {
				console.error('Something weird just happened.');
				return undefined;
			}
		}

	};



	this.configure = function() {

		//
		// TODO: Rename function (?)

		this.context.enable(this.context.DEPTH_TEST);  //
		this.context.clearColor(0.0, 0.35, 0.42, 1.0); // TODO: Don't hard-code background

		// This needs some explaining (related to shader programs)
		// This part is specific to the shaders we're using (should probably be extricated from Context3D class)
		var uniforms   = ['projection',    'modelview',   'normalMat', 'mode', 'light']; // 
		var attributes = ['inputPosition', 'inputColour', 'inputNormal',]; // 'inputTexCoord',

		this.program.uniforms   = {};
		this.program.attributes = {};

		for (var uniform of uniforms) {
			this.program.uniforms[uniform] = this.context.getUniformLocation(this.program, uniform);
		}

		for (var attribute of attributes) {
			console.log(attribute);
			this.program.attributes[attribute] = this.context.getAttribLocation(this.program, attribute);
			this.context.enableVertexAttribArray(this.program.attributes[attribute]);
		}

	}
	


	this.loadShaders = function(shaderpaths) {

		//
		var self = this; // We can't use 'this' directly inside the callback

		//
		return shaders.programFromSourceFiles(this.context, shaderpaths.vertex, shaderpaths.pixel).then(function(program) {
			
			//
			self.program = program;                //
			self.context.useProgram(self.program); //
			self.configure();                      //

			return self;

		});

	}



	this.createBuffer = function(data, itemsize) {

		//
		
		var buffer = this.context.createBuffer();
		buffer.itemsize = itemsize;
		buffer.size     = data.length / buffer.itemsize;
		
		this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(data), this.context.STATIC_DRAW);

		return buffer;

	};



	this.setMatrixUniforms = function(modelview, projection) {
		// Specific to our current shaders
		// TOOD: Make generic
		var light = [1.0, 1.0, 1.0];
		
		var modelviewInv = new Float32Array(16);
		var normalmatrix = new Float32Array(16);
		mat4.inverse(modelview, modelviewInv);
		mat4.transpose(modelviewInv, normalmatrix);

		this.context.uniformMatrix4fv(this.program.uniforms['modelview'],  false, modelview);    //
		this.context.uniformMatrix4fv(this.program.uniforms['projection'], false, projection);   // 
		this.context.uniformMatrix4fv(this.program.uniforms['normalMat'],  false, normalmatrix); // 
		this.context.uniform1i(this.program.uniforms['mode'],              false, 2);            //
		this.context.uniform3f(this.program.uniforms['light'], light[0], light[1], light[2]);    //
	}


	
	this.clear = function (modelview, projection) {
		
		//
		// TODO: Rename (eg. prepare, newframe, etc.)
		// console.log('Rendering...');
		// console.log(modelview, projection)

		/* Clear the screen */
		this.context.viewport(0, 0, this.context.viewportWidth, this.context.viewportHeight); // Set the extent of the viewport
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);    // Clear the depth and colour buffers

		/* Update perspective matrix */
		mat4.perspective(45, this.context.viewportWidth/this.context.viewportHeight, 0.1, 100.0, projection);
		mat4.identity(modelview);

	}



	this.renderVertices = function(buffers, camera, translation, rotation, modelview, projection) {
		
		//
		// TODO: Allow other primitives, textures, etc. (accept primitive 'mesh' object as argument?)
		// TODO: Create Scene class which deals with cameras, meshes and lights (?)

		//
		mat4.identity(modelview);
		mat4.translate(modelview, translation);
		mat4.rotate(modelview, rotation[0], [1, 0, 0]);
		mat4.rotate(modelview, rotation[1], [0, 1, 0]);
		mat4.rotate(modelview, rotation[2], [0, 0, 1]);

		//
		// console.log(buffers['vertex'], buffers['vertex'].itemsize);
		// console.log(this.program.attributes['inputPosition']);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers['vertex']);
		this.context.vertexAttribPointer(this.program.attributes['inputPosition'], buffers['vertex'].itemsize, this.context.FLOAT, false, 0, 0);

		// console.log(buffers['colour'], buffers['colour'].itemsize);
		// console.log(this.program.attributes['inputColour']);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers['colour']);
		this.context.vertexAttribPointer(this.program.attributes['inputColour'], buffers['colour'].itemsize, this.context.FLOAT, false, 0, 0);

		if (buffers['normal'] !== undefined) {
			// console.log(buffers['normal'], buffers['normal'].itemsize);
			// console.log(this.program.attributes['inputNormal']);
			this.context.bindBuffer(this.context.ARRAY_BUFFER, buffers['normal']);
			this.context.vertexAttribPointer(this.program.attributes['inputNormal'], buffers['normal'].itemsize, this.context.FLOAT, false, 0, 0);
		} else {
			console.log('Where the hell are my normals!?');
		}

		// console.log(this.context, vertexbuffer, colourbuffer, vertexbuffer.size);
		this.setMatrixUniforms(modelview, projection); // TODO: How to deal with shaders generically (when the uniforms aren't known in advance)
		this.context.drawArrays(this.context.TRIANGLES, 0, buffers['vertex'].size);

	};



	this.createTexture = function(image) {

		//
		var GL      = this.context;                 //
		var texture = this.context.createTexture(); //

		GL.bindTexture(GL.TEXTURE_2D, texture);                                           //
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);       //
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);                //
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST); //
		GL.generateMipmap(GL.TEXTURE_2D);                                                 //

		GL.bindTexture(GL.TEXTURE_2D, null); //

		return texture;

	}


	this.loadTexture = function(path) {

		//
		var self    = this;            // 
		var image   = new Image();     // 
		image.onload = function() { self.createTexture(image); }; // TODO: Use promises (?)

	};



	//
	this.context = this.create(canvas); //
	// this.program = _;                // The shader program is initialised asynchronously via this.loadShaders

}