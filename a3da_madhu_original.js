//
// file: cex_morph_madhu.js
// three.js visualization for Auto 3D Avatars


// an after-the-DOM is loaded wrapper:
// $(function() {  <- this is the jquery after-the-DOM style, while below is the Drupal method:
Drupal.behaviors.initCexFrontThree = function( context ) {

  // 'use strict';  	/*global Drupal:true, gCex3:true */

  // wrap everything in logic that waits for all loaded assets or whatever necessary conditions:
  var gDoEverything = function( context ) 
  {
	
      // ---------------------------------------------------------------
      function init() {
		var gs = gCex3.settings;
		gs.fbWidth  = 500;
		gs.fbHeight = 400;
				
        gCex3.scene = new THREE.Scene(); // create the 3d scene
        
        // params: fov, aspect_ratio, near_clip_plane, far_clip_plane
        gCex3.camera = new THREE.PerspectiveCamera( 35, gs.fbWidth / gs.fbHeight, 1, 1000 );
        gCex3.camera.position.set( 0, 11, 50 );
        gCex3.scene.add( gCex3.camera );

        // LET THERE BE LIGHT!!! (not global because I'm not manipulating them)
        var ambient = new THREE.AmbientLight( 0x404040 );
        gCex3.scene.add( ambient );

        // first parameter is light color, second is intensity:
        gCex3.dirLight1 = new THREE.DirectionalLight( 0xffffff, 0.7 );
        // the light will point at the origin, so setting the light position sets the light direction
        gCex3.dirLight1.position.set( 2, 1, 2 ).normalize();
        gCex3.scene.add( gCex3.dirLight1 );

        gCex3.dirLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
        gCex3.dirLight2.position.set( -2, 1, 2 ).normalize();
        gCex3.scene.add( gCex3.dirLight2 );
		
		// create a collection of avatars, but only make one:
		gCex3.avatars = [];
		gCex3.avatars.push(new gCex3Avatar());
		var av = gCex3.avatars[0];
		av.initAttachingGeoms();
		
        // create our renderer:
        if (gs.hasWebGL) {
           gCex3.renderer = new THREE.WebGLRenderer({antialias:true});
           $("#A3DH_Three_msg").html('Created WebGL Renderer');
        }
        else {
           gCex3.renderer = new THREE.CanvasRenderer();
           $("#A3DH_Three_msg").append(document.createTextNode('Created Canvas Renderer'));
        }
        gCex3.renderer.setSize( gs.fbWidth, gs.fbHeight );
        
        // get our DOM element and attach the renderer to it:
        gCex3.rendererDOM = $("#A3DH_Three_wrapper");
        gCex3.rendererDOM.append( gCex3.renderer.domElement );

         // initialize the UI controls as a trackball: 
         gCex3.controls = new THREE.TrackballControls( gCex3.camera, gCex3.renderer.domElement );
         gCex3.controls.rotateSpeed = 1.5;
         gCex3.controls.zoomSpeed = 1.2;
         gCex3.controls.panSpeed = 0.8;
         gCex3.controls.noZoom = false;
         gCex3.controls.noPan = false;
         gCex3.controls.staticMoving = true;
         gCex3.controls.dynamicDampingFactor = 0.3;
         gCex3.controls.target.y = 13;

         // create our stats display
         if (gs.statsEnabled) {
            gCex3.stats = new Stats();
            gCex3.stats.domElement.style.position = 'absolute';
            // gCex3.stats.domElement.style.bottom = '0px';
			gCex3.stats.domElement.style.top  = '0px';
            gCex3.stats.domElement.style.left = '867px';
            gCex3.stats.domElement.style.zIndex = 100;
         }
         gCex3.rendererDOM.prepend( gCex3.stats.domElement );
         
         
         // create our gui
         gCex3.gui = new dat.GUI({ height:    13 * 24 - 1,   // the number of lines for UI widgets
								   width:     310,
                                   autoPlace: false         // I'll place the gui myself, thank you. 
                                 });
         gCex3.simParams = {
            wireframe: 		false,  
			light0X:   		0.666666,
			light0Y:   		0.333333,
			light0Z:   		0.666666,
			light1X:  	   -0.666666,
			light1Y:   		0.333333,
			light1Z:   		0.666666,
         }
		 
         gCex3.gui.add( gCex3.simParams, 'wireframe' ).name('Wireframe');
         
		 var folder;
		 
		 folder = gCex3.gui.addFolder( "Standard Morph Targets" );
		 
		 // adding animChannels that are morph targets (the first 6 are not morph targets)
		 var subFolder, currSubPurpose;
         for (var i = 0; i < av.animChannels.length; i++) {
           gCex3.simParams[ av.animChannels[i].purpose ] = 0.0;
		   if (i > 5) {
				if ((i == 6) || (currSubPurpose != av.animChannels[i].subp)) {
					currSubPurpose = av.animChannels[i].subp;
					subFolder = folder.addFolder( currSubPurpose );
				}
			    subFolder.add( gCex3.simParams, av.animChannels[i].purpose, av.animChannels[i].min, av.animChannels[i].max )
					     .min(av.animChannels[i].min)
					     .max(av.animChannels[i].max)
					     .step(0.01);
		   }
         }
		 
		 // light controls (directional)
		 folder = gCex3.gui.addFolder( "Directional lights orientation" );
		 folder.add( gCex3.simParams, "light0X", -1.0, 1.0, 0.025 ).name("Light 0 left/right");
		 folder.add( gCex3.simParams, "light0Y", -1.0, 1.0, 0.025 ).name("Light 0 low/high");
		 folder.add( gCex3.simParams, "light0Z", -1.0, 1.0, 0.025 ).name("Light 0 behind/front");
		 folder.add( gCex3.simParams, "light1X", -1.0, 1.0, 0.025 ).name("Light 1 left/right");
		 folder.add( gCex3.simParams, "light1Y", -1.0, 1.0, 0.025 ).name("Light 1 low/high");
		 folder.add( gCex3.simParams, "light1Z", -1.0, 1.0, 0.025 ).name("Light 1 behind/front");
			
         gCex3.gui.domElement.style.position = 'absolute';
		 gCex3.gui.domElement.style.top      = '60px'; 
         gCex3.gui.domElement.style.left     = '634px';

         gCex3.rendererDOM.prepend( gCex3.gui.domElement ); // add gui to the page
      }

      // ---------------------------------------------------------------
      function animate() {
      	requestAnimationFrame( animate );
		render();
        if (gCex3.settings.statsEnabled) gCex3.stats.update();
      }

      // ---------------------------------------------------------------
      function render() {

		// we're only rendering one avatar here:
		var av = gCex3.avatars[0];
		// and it's rendered:
		av.render();
		
         if (av.baseGeom) {
            // if we have the baseGeom, we can render, so the trackball control of the camera should work
            gCex3.controls.update();
         }
         
		// possible user update of light positions:
		gCex3.dirLight1.position.set( gCex3.simParams.light0X, gCex3.simParams.light0Y, gCex3.simParams.light0Z );
		gCex3.dirLight1.position.normalize();
		//
		gCex3.dirLight2.position.set( gCex3.simParams.light1X, gCex3.simParams.light1Y, gCex3.simParams.light1Z );
		gCex3.dirLight2.position.normalize();
		
		
	    gCex3.renderer.render( gCex3.scene, gCex3.camera );
      }
      
      // ---------------------------------------------------------------------------------
      // now that our routines are defined, here's our actual work calling those routines:
      init();
      animate();
     
  }; // this is the end of the gDoEverything() function, which holds all our work logic



  gDoEverything( context );
  
// this is the ending of the Drupal.behaviors wrapper insuring the DOM is loaded:
};
