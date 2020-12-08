"use strict"

////// Imports //////
import * as THREE from '../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { project23d, Rotor4D } from '../4dfuncs.js'

// //////// START OF TEST ////////
// var v = [1,0,0];
// var n = [1,1,1];
// var angle = math.PI / 4;

// // Calculate the unit vector of n
// var unit_n = math.divide(n, math.norm(n));

// // Create the quaternion used for the rotation
// var quaternion_im = unit_n.map(function (value){ return value * math.sin(angle/2); });
// var quaternion = [math.cos(angle/2), ...(quaternion_im)];

// // Perform the rotaton
// var step1 = math.multiply(v, (math.pow(quaternion[0],2) - math.pow(math.norm(quaternion_im),2)));
// var step2 = math.multiply(2, quaternion_im, math.dot(quaternion_im, v));
// var step3 = math.multiply(2, quaternion[0], math.cross(quaternion_im, v));

// var result = math.add(step1, step2, step3);

// // Log results
// console.log(result);
// console.log(math.dot(quaternion_im, v));
// console.log({step1, step2, step3});

// console.log(math.norm(v));
// console.log(math.norm(result));
// ////// END OF TEST ////////

var scene, camera, renderer;
var cube;

var hyperObject = {
  rotation: [0,0,0,0,0,0],
  wCamDist: -3,
  points4D:    [[1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1],
	  	[1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1],
		[1,1,1,1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1],
		[1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1]],
  connections: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],[8,9],[9,10],[10,11],[11,8],[12,13],[13,14],[14,15],[15,12],[8,12],[9,13],[10,14],[11,15],[0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15]],
  // material: new THREE.MeshPhongMaterial( { color: 0x00ff00, shininess: 100 } ),
  // material: new THREE.MeshPhongMaterial( { color: 0x2194ce, shininess: 100 } ),
  material: new THREE.MeshToonMaterial( { color: 0x2194ce, gradientMap: THREE.threeTone } ),
  // material: new THREE.MeshLambertMaterial( { color: 0x00ff00, metalness: .41, emissive: '#000000', roughness: 0 } ),
  // material: new THREE.MeshLambertMaterial( { color: 0x2194ce, metalness: .41, emissive: '#000000', roughness: 0 } ),
  // material: new THREE.MeshPhysicalMaterial( { color: 0x00ff00, metalness: 1, roughness: 1, emissive: '#000000', clearcoat: 1 } ),
  thickness: 0.05,
  
  xUp: [1,0,0,0],
  yUp: [0,1,0,0],
  zUp: [0,0,1,0],
  wUp: [0,0,0,1],

  proj23d: function(){
    this.points3D = project23d(this.rotPoints4D);
  },
  createMeshes: function(){
    this.meshes = [];
    for (let connection of this.connections){
      let geometry = new THREE.CylinderBufferGeometry(this.thickness,this.thickness,1,20);
      geometry.rotateX(math.PI/2);

      let mesh = new THREE.Mesh( geometry, this.material );
      this.meshes.push( mesh );
    }

    for ( var x in this.points3D[0] ){
      let pointSphere = new THREE.SphereBufferGeometry(this.thickness,20,20);
      let mesh = new THREE.Mesh( pointSphere, this.material );
      this.meshes.push( mesh );
    }
  },
  setRotation: function(rotation) {
    this.rotation = rotation;
    
    let xUp = [1,0,0,0];
    let yUp = [0,1,0,0];
    let zUp = [0,0,1,0];
    let wUp = [0,0,0,1];

    // This is the only way to clone the array without making the program cursed
    this.rotPoints4D = [Array.from(this.points4D[0]),Array.from(this.points4D[1]),Array.from(this.points4D[2]),Array.from(this.points4D[3])];

    for ( var eh in rotation ){
      if (math.round(rotation[eh], 10) == 0) { continue };
      
      switch(Number(eh)){
        case 0:
          Rotor4D.plane = [yUp,xUp]; 
          break;
        case 1:
          Rotor4D.plane = [zUp,xUp]; 
          break;
        case 2:
          Rotor4D.plane = [zUp,yUp]; 
          break;
        case 3:
          Rotor4D.plane = [xUp,wUp]; 
          break;
        case 4:
          Rotor4D.plane = [yUp,wUp]; 
          break
        case 5:
          Rotor4D.plane = [zUp,wUp]; 
          break;
      }

      Rotor4D.angle = rotation[eh];

      Rotor4D.recalcRotor();

      this.rotPoints4D = Rotor4D.rotate(this.rotPoints4D);

      xUp = Rotor4D.rotate(xUp);
      yUp = Rotor4D.rotate(yUp);
      zUp = Rotor4D.rotate(zUp);
      wUp = Rotor4D.rotate(wUp);
    }

    this.xUp = xUp;
    this.yUp = yUp;
    this.zUp = zUp;
    this.wUp = wUp;

  },

  updateMeshes: function(){
    let concount = Number(this.connections.length);
    
    let i2 = 0;
    for ( var connection of this.connections ){
      this.meshes[i2].position.set(0,0,0);

      let pt1 = [this.points3D[0][connection[0]],this.points3D[1][connection[0]],this.points3D[2][connection[0]]];
      let pt2 = [this.points3D[0][connection[1]],this.points3D[1][connection[1]],this.points3D[2][connection[1]]];
      
      let length = math.distance(pt1,pt2);
      this.meshes[i2].scale.z = length;
      
      this.meshes[i2].lookAt(new THREE.Vector3(pt2[0]-pt1[0],pt2[1]-pt1[1],pt2[2]-pt1[2]).normalize());

      let translation = math.divide(math.add(pt1,pt2),2);
      this.meshes[i2].position.set(translation[0], translation[1], translation[2]);
      
      i2 += 1;
    }

    for ( var i in this.rotPoints4D[0] ){
      let j = Number(i) + concount;
      this.meshes[j].position.set(this.points3D[0][i], this.points3D[1][i], this.points3D[2][i]);
    }
  }
};

hyperObject.setRotation([0,0,0,0,0,0]);
hyperObject.proj23d();
hyperObject.createMeshes();
hyperObject.updateMeshes();


function init(){
  ////////// Inital Setup //////////
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

  scene.background = new THREE.Color( 0x000000 );
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  var controls = new OrbitControls( camera, renderer.domElement );
  
  scene.background = new THREE.Color( 0xffdf06 );
  // scene.background = new THREE.Color( 0xffd700 );
  // scene.background = new THREE.Color( 0xffffff );

  ////////// Scene Setup //////////
  // Camera
  camera.position.set(0,2,-5);
  camera.lookAt( new THREE.Vector3(0,0,0) );
  controls.update();

  // Objects
  // var cubeGeometry = new THREE.BoxGeometry();
  // var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
  // cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  // cube.castShadow = true;
  // scene.add( cube );

  // var planeGeometry = new THREE.PlaneGeometry( 32, 32 );
  // var planeMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  // var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  // plane.position.y = -5
  // plane.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
  // plane.receiveShadow = true;
  // scene.add(plane);

  const geometry = new THREE.PlaneGeometry(22, 22);
  const material = new THREE.ShadowMaterial({ opacity: .3 });

  var floor = new THREE.Mesh(geometry, material);
  floor.name = 'floor';
  floor.position.y = -4;
  floor.rotateX(- Math.PI / 2);
  floor.receiveShadow = true;

  scene.add(floor);

  for (var mesh of hyperObject.meshes){
    mesh.castShadow = true;
    // mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // Lighting
  // var ambientLight = new THREE.AmbientLight( 0xffffff, 0.4 );
  // scene.add(ambientLight);
  
  const light = new THREE.AmbientLight( 0xc4c4c4, 0.6);
  scene.add(light);

  // var pointLight = new THREE.PointLight( 0xffffff, 0.8, 19 );
  var pointLight = new THREE.PointLight( 0xffffff, 1, 19 );
  pointLight.position.set(-3,10,-3);
  pointLight.castShadow = true;
  pointLight.shadow.camera.near = 0.1;
  pointLight.shadow.camera.far = 25;
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  scene.add(pointLight);

};

var totalrot = [0,0,0,0,0,0]

// hyperObject.rotate([9.444,9.44,3.14,3.14,3.1344,3.1384]);

// xy, xz, yz, xw, yw, zw
// var animrot = [0,0.8,0,0,0.8,0];

var clock = new THREE.Clock();

var animate = function(){
  requestAnimationFrame( animate );

  // let dTime = clock.getDelta();
  
  // if (clock.elapsedTime < (math.PI/0.8)){
  //   animrot = [0,0.8,0,0,0.8,0];
  // }
  // else if (clock.elapsedTime < 2*(math.PI/0.8)){
  //   animrot = [0.8,0,0,0,0,0.8];
  // }
  // else if (clock.elapsedTime < 3*(math.PI/0.8)){
  //   animrot = [0,0,0.8,0.8,0,0];
  // }
  // else if (clock.elapsedTime < 4*(math.PI/0.8)){
  //   animrot = [0,0,0,0.8,0,0.8]; 
  // }
  // else if (clock.elapsedTime < 5*(math.PI/0.8)){
  //   animrot = [0,0,0,0,0.8,0.8];
  // }
  // else if (clock.elapsedTime < 6*(math.PI/0.8)){
  //   animrot = [0,0,0,0.8,0.8,0];
  // }
  // else if (clock.elapsedTime < 7*(math.PI/0.8)){
  //   animrot = [0,0,0,0.8,0.8,0.8];
  // }
  // else if (clock.elapsedTime < 8*(math.PI/0.8)){
  //   animrot = [0,0,0,0,0,0];
  // }
  // else {
  //   clock.start();
  // }
  
  let xyrot = (document.getElementById("xy_slider").value)*(math.PI/180)
  let xzrot = (document.getElementById("xz_slider").value)*(math.PI/180)
  let yzrot = (document.getElementById("yz_slider").value)*(math.PI/180)
  let xwrot = (document.getElementById("xw_slider").value)*(math.PI/180)
  let ywrot = (document.getElementById("yw_slider").value)*(math.PI/180)
  let zwrot = (document.getElementById("zw_slider").value)*(math.PI/180)
  
  // totalrot = math.add(totalrot, math.multiply(animrot, dTime));
  // hyperObject.setRotation(totalrot);
  // console.log(totalrot);
  hyperObject.setRotation([xyrot,xzrot,yzrot,xwrot,ywrot,zwrot]);
  hyperObject.proj23d();
  hyperObject.updateMeshes();

  // cube.rotation.z = xyrot;
  // cube.rotation.y = xzrot;
  // cube.rotation.x = yzrot;
  // cube.rotateZ(animrot[0]*dTime);
  // cube.rotateY(-animrot[1]*dTime);

  renderer.render( scene, camera );
};


init();
animate();
