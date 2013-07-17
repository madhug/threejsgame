var gameLoopVar; 
var keyboard;
var microphysics;
var world;
var player;
var initiated = false;

var scene, camera, material, renderer; 

var stage, stageGeometry;
var sphere; //hitcount = 0, misscount = 0;

var gameStates, gameTransitions, curState; 
var initAcceleration;
var ambientLight, directionalLight; 

var hitCounter = 0;	

function gameInit()
{
	gameStates = {
		init:initThree,
		play:playGame,
		win:winState,
		lost:lostState
	};
	
	gameTransitions = {
		initComplete:has_initComplete,
		checkWin:has_won,
		checkLost:has_lost
	};
}
gameInit();

function playGame()
{
	var timer = Date.now() * 0.0001;	
	renderer.render( scene, camera );
	console.log("Playing game");
	if(gameTransitions.checkWin())
	{
		curState = gameStates.win;
	}
	else if(gameTransitions.checkLost())
	{
		curState = gameStates.lost;
	}
	else
	{
		curState = gameStates.play;
	}
}

function winState()
{
	console.log("you won!");
	stopGameLoop();
}
function lostState()
{
	console.log("you lost!");
	stopGameLoop();
}
function has_initComplete()
{	
	return initiated;
}

var wincnt = 0;
function has_won()
{
	var rand = Math.floor(Math.random() * 100);
	//console.log("rand: " + rand);
	if(rand%2 == 0) wincnt++; 
	//if(wincnt == 100) return true;
	return false;
	
}

var lostcnt = 0;
function has_lost()
{
	if(Math.floor(3 - hitCounter/2) <= 0)
	{
		return true;
	}
	return false;
}

function startGameLoop()
{
	console.log("starting game loop");
		
	if(initiated == false)
		gameStates.init();
	gameLoopVar = setInterval(gameLoop,1000/30);
}

function stopGameLoop()
{
	console.log("stopping game loop");
	clearInterval(gameLoopVar);
	document.body.removeChild( renderer.domElement );
	var lifeCtr = $("#lifeCtr");
	lifeCtr.text("You lost!");
	initiated = false;
    hitCounter = 0;	
}

//in the game loop
function gameLoop()
{
	var timeStep   = 1/180;
	world.step(timeStep, Date.now()/1000);
	microphysics.update();
	curState();
	//world.remove(initAcceleration);
}

function drawGrid(sce)
{
	var size = 500, step = 50;
	var geometry = new THREE.Geometry();

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
		geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
		geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

		geometry.vertices.push( new THREE.Vector3( - size, i, 0 ) );
		geometry.vertices.push( new THREE.Vector3(   size, i, 0 ) );
		geometry.vertices.push( new THREE.Vector3( i, - size, 0  ) );
		geometry.vertices.push( new THREE.Vector3( i, size, 0) );

		geometry.vertices.push( new THREE.Vector3( 0, - size, i ) );
		geometry.vertices.push( new THREE.Vector3( 0 , size, i ) );
		geometry.vertices.push( new THREE.Vector3( 0, i, - size ) );
		geometry.vertices.push( new THREE.Vector3( 0, i,   size ) );

		
	}

	var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

	var line = new THREE.Line( geometry, material );
	line.type = THREE.LinePieces;
	sce.add( line );
}


function setCamera(sce)
{
	camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );
	//camera = new THREE.OrthographicCamera( left,right,top.bottom, - 500, 1000 );
	camera.position.x = 200;
	camera.position.y = 150;
	camera.position.z = 200;
	camera.lookAt( scene.position );
	sce.add( camera );
}

function setRenderer()
{
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	document.body.appendChild( renderer.domElement );
}

function setLight(sce)
{
	ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
	//cene.add( ambientLight );


	directionalLight = new THREE.DirectionalLight( 0x33ffff );
	directionalLight.position.x = 500
	directionalLight.position.y = 500;
	directionalLight.position.z = 0;
	//directionalLight.position.normalize();
	directionalLight.target = sphere; //TODO make sure that sphere has been initialized
	scene.add( directionalLight );
	
	directionalLight.castShadow = true;
	directionalLight.shadowDarkness = 0.5;

	/*directionalLight.shadowCameraRight     =  5;
	directionalLight.shadowCameraLeft     = -5;
	directionalLight.shadowCameraTop      =  5;
	directionalLight.shadowCameraBottom   = -5;*/
	
}

function initPhysics()
{
	microphysics = new THREEx.Microphysics();
    world = microphysics.world();
	
	/*var gravity = new vphy.LinearAccelerator({
		  x   :  0,
		  y   : -9.8,
		  z   :  0
		});
	
	world.add(gravity);	*/
	microphysics.start();
}

function initThree() {
		
	initiated = true; 
	scene = new THREE.Scene();
	drawGrid(scene);
	setCamera(scene);
	setRenderer();
	initPhysics();
	keyboard = new THREEx.KeyboardState();
	setStage();
	addSphere();
	addPaddle();
	setLight(scene);

    curState = gameStates.play;	
  }
  
  function setStage()
  { 
	
	var baseGeo = new THREE.CubeGeometry( 1000, 2, 1000 );
	//baseGeo.dynamic = true;
	//baseGeo.verticesNeedUpdate = true;
	//baseGeo.normalsNeedUpdate = true;
	
	var wallGeoLR = new THREE.CubeGeometry( 1000, 500, 2 );
	//wallGeoLR.dynamic = true;
	//wallGeoLR.verticesNeedUpdate = true;
	//wallGeoLR.normalsNeedUpdate = true;
	
	var wallGeoFB = new THREE.CubeGeometry( 2,500, 1000 );
	//wallGeoFB.dynamic = true;
	//wallGeoFB.verticesNeedUpdate = true;
	//wallGeoFB.normalsNeedUpdate = true;
	
	
	  
	material = new THREE.MeshBasicMaterial( { color: 0xff0000, shading: THREE.FlatShading, wireframe: true } );
	var baseMat = new THREE.MeshBasicMaterial( { color: 0xff0000, shading: THREE.FlatShading, wireframe: false } );
      //material  = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.None, overdraw: true } );
	
	stage = {
		"bottom" : new THREE.Mesh( baseGeo, baseMat ),
		"top" : new THREE.Mesh( baseGeo, material ),
		"left" : new THREE.Mesh( wallGeoLR, material ),
		"right" : new THREE.Mesh( wallGeoLR, material ),
		"front" : new THREE.Mesh( wallGeoFB, material ),
		"back" : new THREE.Mesh( wallGeoFB, material )
	};
	  
	stage.bottom.position = new THREE.Vector3(0,0,0);
	stage.top.position = new THREE.Vector3(0,500,0);
	stage.left.position = new THREE.Vector3(0,250,-500);
	stage.right.position = new THREE.Vector3(0,250,500);
	stage.front.position = new THREE.Vector3(500,250,00);
	stage.back.position = new THREE.Vector3(-500,250,00);
	
	stage.bottom.useQuaternion = true;
	stage.top.useQuaternion = true;
	stage.right.useQuaternion = true;
	stage.left.useQuaternion = true;
	stage.front.useQuaternion = true;
	stage.back.useQuaternion = true;
	
	scene.add(stage.bottom);  
	scene.add(stage.top);
	scene.add(stage.left);
	scene.add(stage.right);
	scene.add(stage.front);
	scene.add(stage.back);
	
	stage.bottom.receiveShadow = true;
	stage.top.receiveShadow = true;
	stage.left.receiveShadow = true;
	stage.right.receiveShadow = true;
	stage.front.receiveShadow = true;
	stage.back.receiveShadow = true;
	
	microphysics.bindMesh(stage.bottom);  
	microphysics.bindMesh(stage.top);
	microphysics.bindMesh(stage.left);
	microphysics.bindMesh(stage.right);
	microphysics.bindMesh(stage.front);
	microphysics.bindMesh(stage.back);
	
	stage.bottom._vphyBody.objectName = "base";
	/*stage.bottom._vphyBody.events.on("contact",function(event) {
		misscount++;
		console.log("miss: " + misscount);
	});*/
	
  }

  function addSphere()
  {
	sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 100, 100), new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    }));
    sphere.overdraw = true;
	sphere.position = new THREE.Vector3(0,150,0);
	sphere.geometry.dynamic = true;
	sphere.geometry.normalsNeedUpdate = true;
	sphere.geometry.verticesNeedUpdate = true;
	scene.add(sphere);
	sphere.castShadow = true; 
	sphere.receiveShadow = false;
	microphysics.bindMesh(sphere);
	//sphere._vphyBody.dynamic = true;
	  
	  //gravity
	  
	world.add({type: vphy.types.ACCELERATOR, perform: function(bodies) {sphere._vphyBody.accelerate(0,-9.8 * 10,0);} });
	//TODO: how to randomize this acceleration to make it more fun?
	initAcceleration = {type: vphy.types.ACCELERATOR, perform: function(bodies) {sphere._vphyBody.accelerate(2,0,2);} };
	//world.add(initAcceleration);
	
	sphere._vphyBody.events.on("contact",function(event)
	{
		var hitObject = arguments[1];
		if(hitObject.objectName == "base")
		{
			var lifeCtr = $("#lifeCtr");
			hitCounter++;
			lifeCtr.text("Lives: " + Math.floor(3 - hitCounter/2));
		}
	});
	  		
  }
  
  var paddle;
  function addPaddle()
  {
	var paddleGeo = new THREE.CubeGeometry( 100, 10, 100 );
	paddleGeo.dynamic = true;
	paddleGeo.verticesNeedUpdate = true;
	paddleGeo.normalsNeedUpdate = true;
	
	var paddleMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, shading: THREE.FlatShading, wireframe: false } );
	
	paddle = new THREE.Mesh(paddleGeo, paddleMaterial);
	paddle.position = new THREE.Vector3(0,10,0);
	
	paddle.receiveShadow = true; 
	paddle.castShadow = true; 
	
	scene.add(paddle);
	microphysics.bindMesh(paddle);

	
	var player = paddle._vphyBody;
	player.objectName = "paddle";
	player.dynamic = true;
	var move  = 1;
	world.add({
		type: vphy.types.ACCELERATOR,   // let the lib know it is an accelerator
		perform: function(bodies){      // bodies is the array of all vphy.Body
		
		  if( keyboard.pressed('right') ) {
			var position = player.getPosition();
			player.setPosition(position[0],position[1],position[2]-move); 
			//console.log(player.getPosition());
		  }
		  if( keyboard.pressed('left') ) {
		    var position = player.getPosition();
			player.setPosition(position[0],position[1],position[2]+move); 
			//console.log(player.getPosition());
		  }
		  if( keyboard.pressed('up') )  {
		    var position = player.getPosition();
			player.setPosition(position[0]-move,position[1],position[2]); 
			//console.log(player.getPosition());
		  }
		  if( keyboard.pressed('down') ) {
		    var position = player.getPosition();
			player.setPosition(position[0]+move,position[1],position[2]); 
			//console.log(player.getPosition());
		  }
		
		  //if( keyboard.pressed('right') ) {player.accelerate(100,0,0); /*console.log(player.getPosition());*/}
		  //if( keyboard.pressed('left') ) {player.accelerate(-100,0,0);/*console.log(player.getPosition());*/}
		  //if( keyboard.pressed('up') )  {player.accelerate(0,0,100);/*console.log(player.getPosition());*/}
		  //if( keyboard.pressed('down') ) {player.accelerate(0,0,-100);/*console.log(player.getPosition());}*/}
		}
	});	
	player.mass = 30;
	player.name = "paddle";
	player.friction = 10;
	console.log("Paddle mass: " + player.mass);
  }
 
  // ---------------------------------------------------------------
  
/*var stopper, stopped = false;
  function render() 
  {		
	//mesh.rotation.x += 0.02;
	var timer = Date.now() * 0.0001;
	//camera.position.x = Math.cos( timer ) * 200;
	//camera.position.z = Math.sin( timer ) * 200;
	//camera.lookAt( scene.position );
	
	stopper = {
			type: vphy.types.ACCELERATOR,   // let the lib know it is an accelerator
			perform: function(bodies){
//				player.accelerate(-player.ax,-player.ay,-player.az);
				player.setVelocity(0,0,0);
				paddle.position.x = 
					paddle.position.x >= 500 - 50 ? paddle.position.x - 2:
					paddle.position.x <= -500 + 50 ? paddle.position.x + 2:
					paddle.position.x;
				
				paddle.position.z = 
					paddle.position.z >= 500 - 50 ? paddle.position.z - 2:
					paddle.position.z <= -500 + 50 ? paddle.position.z + 2:
					paddle.position.z;

				
			}
		}
	
	if(paddle.position.x >= 500 - 50 || paddle.position.z <= -500 + 50 || paddle.position.z >= 500 - 50 || paddle.position.z <= -500 + 50)
	{
		//console.log("hit edge");
		var player = paddle._vphyBody;
		world.add(stopper);
		stopped = true;
		//paddle._vphyBody.ax = paddle._vphyBody.ay = paddle._vphyBody.az = 0;
		//paddle._vphyBody.ax = paddle._vphyBody.ay = paddle._vphyBody.az = 0;
	}
	else
	{
		if(stopped == true)
		{
			//world.remove(stopper);
			stopped = false;
		}
	}*/
	//rend*/

