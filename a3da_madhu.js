//
// file: cex_morph_madhu.js
// three.js visualization for Auto 3D Avatars


// an after-the-DOM is loaded wrapper:
// $(function() {  <- this is the jquery after-the-DOM style, while below is the Drupal method:
Drupal.behaviors.initCexFrontThree = function( context ) {

  // 'use strict';  	/*global Drupal:true, gCex3:true */

  // wrap everything in logic that waits for all loaded assets or whatever necessary conditions:
  
  var cube;
  var startTime	= Date.now();
  
  var gDoEverything = function( context ) 
  {
	
      // ---------------------------------------------------------------
      function init() {
		
		//adding the physics.js file
		
		
		var gs = gCex3.settings;
		gs.fbWidth  = window.innerWidth;
		gs.fbHeight = window.innerHeight;
				
        gCex3.scene = new THREE.Scene(); // create the 3d scene
        
        // params: fov, aspect_ratio, near_clip_plane, far_clip_plane
        gCex3.camera = new THREE.PerspectiveCamera( 70, gs.fbWidth / gs.fbHeight, 1, 1000 );
        gCex3.camera.position.x = 150;
		gCex3.camera.position.y = 150;
		gCex3.camera.position.z = 350;
		//gCex3.camera.target.position.y = 150;
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

		cube = new THREE.Mesh( new THREE.CubeGeometry( 200, 200, 200 ), new THREE.MeshNormalMaterial() );
	    cube.position.y = 150;
		
		gCex3.scene.add(cube);
		
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
        
      }

      // ---------------------------------------------------------------
      function animate() 
	  {
      	requestAnimationFrame( animate );
		render();
        if (gCex3.settings.statsEnabled) gCex3.stats.update();
      }

      // ---------------------------------------------------------------
      function render() 
	  {		
		cube.rotation.x += 0.02;
	    gCex3.renderer.render( gCex3.scene, gCex3.camera );
      }
      
	  
	  function loadScript(url, callback)
		{
		// adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		// then bind the event to the callback function 
		// there are several events for cross browser compatibility
		script.onreadystatechange = callback;
		script.onload = callback;

		// fire the loading
		head.appendChild(script);
		}
	  $.getScript("physics_ext_madhu.js",main_method);
	  
      // ---------------------------------------------------------------------------------
      // now that our routines are defined, here's our actual work calling those routines:
	  
//	  loadScript("physics_ext_madhu.js",main_method);
	  
	  var main_method = function(){
		
		console.log("script load complete");
	  
		init();
		animate();
	  };
     
  }; // this is the end of the gDoEverything() function, which holds all our work logic



  gDoEverything( context );
  
// this is the ending of the Drupal.behaviors wrapper insuring the DOM is loaded:
};
