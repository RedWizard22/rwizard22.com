"use strict"

import * as THREE from '../../node_modules/three/build/three.module.js';
import { BufferGeometryUtils } from '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { project23d } from '../4dfuncs.js'

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
  // rotation: 0,
  wCamDist: -3,
  points4D:    [[1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1],
	  	[1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1],
		[1,1,1,1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1],
		[1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1]],
  connections: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],[8,9],[9,10],[10,11],[11,8],[12,13],[13,14],[14,15],[15,12],[8,12],[9,13],[10,14],[11,15],[0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15]],
  material: new THREE.MeshPhongMaterial( { color: 0x00ff00, shininess: 100 } ),
  thickness: 0.05,
  
  xyPlane: [[1,0,0,0],[0,1,0,0]],
  xzPlane: [[1,0,0,0],[0,0,1,0]],
  yzPlane: [[0,1,0,0],[0,0,1,0]],
  xwPlane: [[1,0,0,0],[0,0,0,1]],
  ywPlane: [[0,1,0,0],[0,0,0,1]],
  zwPlane: [[0,0,1,0],[0,0,0,1]],

  proj23d: function(){
    this.points3D = project23d(this.points4D);
  },
  createMeshes: function(){
    this.meshes = [];
    // let fullGeo = new THREE.BufferGeometry();
    // let geometries = [];
    for (let connection of this.connections){
      // let pt1 = [this.points3D[0][connection[0]],this.points3D[1][connection[0]],this.points3D[2][connection[0]]];
      // let pt2 = [this.points3D[0][connection[1]],this.points3D[1][connection[1]],this.points3D[2][connection[1]]];
      
      // let length = math.distance(pt1,pt2);
      // let geometry = new THREE.CylinderBufferGeometry(this.thickness,this.thickness,length,10);
      let geometry = new THREE.CylinderBufferGeometry(this.thickness,this.thickness,1,10);
      geometry.rotateX(math.PI/2);
      // geometry.lookAt(new THREE.Vector3(pt2[0]-pt1[0],pt2[1]-pt1[1],pt2[2]-pt1[2]).normalize());
      // let translation = math.divide(math.add(pt1,pt2),2);
      // geometry.translate(translation[0],translation[1],translation[2]);
      

      let mesh = new THREE.Mesh( geometry, this.material );
      this.meshes.push( mesh );
      // console.log(mesh);
      // fullGeo.merge(geometry);
      // geometries.push(geometry);
    }

    for ( var x in this.points3D[0] ){
      let pointSphere = new THREE.SphereBufferGeometry(this.thickness,10,10);
      // pointSphere.translate(this.points3D[0][x], this.points3D[1][x], this.points3D[2][x]);
      let mesh = new THREE.Mesh( pointSphere, this.material );
      this.meshes.push( mesh );

      // fullGeo.merge(pointSphere);
      // geometries.push(pointSphere);
    }
    // let fullGeo = BufferGeometryUtils.mergeBufferGeometries( geometries, false );
    // let mesh = new THREE.Mesh( fullGeo, this.material );
    // this.meshes.push(mesh);
  },
  rotate: function(rotation) {
    this.rotation = math.add(this.rotation, rotation);

    for ( var eh in rotation ){
      if (math.round(rotation[eh], 10) == 0) { continue };
      
      let a = 0;
      let b = 0;
      
      switch(Number(eh)){
        case 0:
          a = Array.from(this.xyPlane[0]);
          b = Array.from(this.xyPlane[1]);
          break;
        case 1:
          a = Array.from(this.xzPlane[0]);
          b = Array.from(this.xzPlane[1]);
          break;
        case 2:
          a = Array.from(this.yzPlane[0]);
          b = Array.from(this.yzPlane[1]);
          break;
        case 3:
          a = Array.from(this.xwPlane[0]);
          b = Array.from(this.xwPlane[1]);
          break;
        case 4:
          a = Array.from(this.ywPlane[0]);
          b = Array.from(this.ywPlane[1]);
          break
        case 5:
          a = Array.from(this.zwPlane[0]);
          b = Array.from(this.zwPlane[1]);
          break;
      }
        
      // let a = this.ywPlane[0];
      // let b = this.ywPlane[1];
      
      let plane = [a[0]*b[1]-a[1]*b[0], a[0]*b[2]-a[2]*b[0], a[0]*b[3]-a[3]*b[0], a[1]*b[2]-a[2]*b[1], a[1]*b[3]-a[3]*b[1], a[2]*b[3]-a[3]*b[2]];
      
      let ctheta = math.cos(rotation[eh]/2);
      let stheta = math.sin(rotation[eh]/2);
      let c = [ctheta, ...(math.multiply(stheta, plane))]

      // console.log(c)

      let c11 = c[0]*c[0];
      let c22 = c[1]*c[1];
      let c33 = c[2]*c[2];
      let c44 = c[3]*c[3];
      let c55 = c[4]*c[4];
      let c66 = c[5]*c[5];
      let c77 = c[6]*c[6];

      let c12 = c[0]*c[1];
      let c13 = c[0]*c[2];
      let c14 = c[0]*c[3];
      let c15 = c[0]*c[4];
      let c16 = c[0]*c[5];
      let c17 = c[0]*c[6];

      let c23 = c[1]*c[2];
      let c24 = c[1]*c[3];
      let c25 = c[1]*c[4];
      let c26 = c[1]*c[5];
      let c27 = c[1]*c[6];

      let c34 = c[2]*c[3];
      let c35 = c[2]*c[4];
      let c36 = c[2]*c[5];
      let c37 = c[2]*c[6];

      let c45 = c[3]*c[4];
      let c46 = c[3]*c[5];
      let c47 = c[3]*c[6];

      let c56 = c[4]*c[5];
      let c57 = c[4]*c[6];

      let c67 = c[5]*c[6];
      
      var rotPoint = function(point) {
        let rotatedPoint = [0,0,0,0];
        rotatedPoint[0] = ((c11-c22-c33-c44+c55+c66+c77)*point[0] -2*(c12+c46+c35)*point[1] +2*(-c13-c47+c25)*point[2] +2*(-c14+c26+c37)*point[3]);
        rotatedPoint[1] = ((-c22+c11+c33+c44-c55-c66+c77)*point[1] +2*(c12-c35-c46)*point[0] -2*(c23+c15+c67)*point[2] -2*(c24+c16-c57)*point[3]);
        rotatedPoint[2] = ((-c33+c11+c22+c44-c55+c66-c77)*point[2] +2*(c13+c25-c47)*point[0] -2*(c23-c15+c67)*point[1] -2*(c34+c56+c17)*point[3]);
        rotatedPoint[3] = ((-c44+c11+c22+c33-c66+c55-c77)*point[3] +2*(c14+c26+c37)*point[0] -2*(c24-c16-c57)*point[1] -2*(c34+c56-c17)*point[2]);
        return rotatedPoint;
      }

      for ( var x in this.points4D[0] ){
        let rotatedPoint = rotPoint([this.points4D[0][x], this.points4D[1][x], this.points4D[2][x], this.points4D[3][x]]);
        this.points4D[0][x] = rotatedPoint[0];
        this.points4D[1][x] = rotatedPoint[1];
        this.points4D[2][x] = rotatedPoint[2];
        this.points4D[3][x] = rotatedPoint[3];
      }
      
      // console.log(rotPoint(Array.from(this.xyPlane[1])));
      // console.log(math.norm(this.xyPlane[1])*math.norm(this.xyPlane[0]));
      
      console.log(this.xyPlane[0]);
      console.log(this.xzPlane[0]);

      console.log(this.rotation);

      this.xyPlane[0] = rotPoint(this.xyPlane[0]);
      this.xzPlane[0] = rotPoint(this.xzPlane[0]);
      // this.yzPlane[0] = rotPoint(this.yzPlane[0]);
      // this.xwPlane[0] = rotPoint(this.xwPlane[0]);
      // this.ywPlane[0] = rotPoint(this.ywPlane[0]);
      // this.zwPlane[0] = rotPoint(this.zwPlane[0]);
      this.xyPlane[1] = rotPoint(this.xyPlane[1]);
      this.xzPlane[1] = rotPoint(this.xzPlane[1]);
      // this.yzPlane[1] = rotPoint(this.yzPlane[1]);
      // this.xwPlane[1] = rotPoint(this.xwPlane[1]);
      // this.ywPlane[1] = rotPoint(this.ywPlane[1]);
      // this.zwPlane[1] = rotPoint(this.zwPlane[1]);
    }

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
      // i = Number(i);
      // console.log(i);
    }

    for ( var i in this.points4D[0] ){
      let j = Number(i) + concount;
      // console.log(j);
      this.meshes[j].position.set(this.points3D[0][i], this.points3D[1][i], this.points3D[2][i]);
    }
  }
};

hyperObject.proj23d();
hyperObject.createMeshes();
hyperObject.updateMeshes();

// hyperObject.rotate(math.PI/4);
// hyperObject.proj23d();
// hyperObject.updateMeshes();


function init(){
  ////////// Inital Setup //////////
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();

  scene.background = new THREE.Color( 0x000000 );
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.enabled = true;
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  ////////// Scene Setup //////////
  // Camera
  camera.position.set(0,2,-5);
  camera.lookAt( new THREE.Vector3(0,0,0) );

  // Objects
  // var cubeGeometry = new THREE.BoxGeometry();
  // var cubeMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
  // cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  // cube.castShadow = true;
  // scene.add( cube );

  var planeGeometry = new THREE.PlaneGeometry( 32, 32 );
  var planeMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.position.y = -5
  plane.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
  plane.receiveShadow = true;
  scene.add(plane);

  for (var mesh of hyperObject.meshes){
    mesh.castShadow = true;
    // mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // Lighting
  var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
  scene.add(ambientLight);

  var pointLight = new THREE.PointLight( 0xffffff, 0.8, 19 );
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
var animrot = [0,0,0,0.8,0,0.8];

var clock = new THREE.Clock();

var animate = function(){
  requestAnimationFrame( animate );

  let dTime = clock.getDelta();
  
  // if (clock.elapsedTime < (math.PI/0.8)){
  //   animrot = [0,0.8,0,0,0.8,0];
  // }
  // else if (clock.elapsedTime < 2*(math.PI/0.8)){
  //   animrot = [0.8,0,0,0,0,0.8];
  // }
  // else if (clock.elapsedTime < 3*(math.PI/0.8)){
  //   animrot = [0,0,0.8,0.8,0,0];
  // }
  if (clock.elapsedTime < 1*(math.PI/0.8)){
    animrot = [0.8,0.8,0,0,0,0]; 
    // totalrot = math.add(totalrot, math.multiply(animrot, dTime));
  }
  // else if (clock.elapsedTime < 5*(math.PI/0.8)){
    // animrot = [0,0,0,0,0.8,0.8];
  // }
  // else if (clock.elapsedTime < 6*(math.PI/0.8)){
    // animrot = [0,0,0,0.8,0.8,0];
  // }
  // else if (clock.elapsedTime < 7*(math.PI/0.8)){
    // animrot = [0,0,0,0.8,0.8,0.8];
  // }
  else {
    animrot = [0,0,0,0,0,0];
    // console.log(hyperObject.rotation);
  }
  
  
  
  hyperObject.rotate(math.multiply(animrot, dTime));
  hyperObject.proj23d();
  hyperObject.updateMeshes();

  // animrot += rotrate;

  // console.log(animrot);

  // for (var mesh of hyperObject.meshes){
    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.01;
  // }

  renderer.render( scene, camera );
};

init();
animate();
