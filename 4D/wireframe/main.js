"use strict"

////// Imports //////
import * as THREE from '../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { project23d, Rotor4D } from '../4dfuncs.js'

////// Objects and Global Variables //////
var scene, camera, renderer;

class Arrow{
  constructor(direction, thickness, color){
    this.thickness = thickness;
    this.material = new THREE.MeshToonMaterial({ color: color, gradientMap: THREE.fourTone, opacity: 0.6, transparent: true });

    const cylinderGeometry = new THREE.CylinderBufferGeometry(thickness,thickness,1,20);
    cylinderGeometry.rotateX(math.PI/2);
    this.cylinderMesh = new THREE.Mesh( cylinderGeometry, this.material );
    
    const coneGeometry = new THREE.ConeBufferGeometry( this.thickness*2, 2*this.thickness*1.5, 4, 1 );
    coneGeometry.rotateX(math.PI/2);
    this.coneMesh = new THREE.Mesh( coneGeometry, this.material );

    this.setDirection( direction );
  }

  setDirection(vec){

    let length = math.distance( [0,0,0], vec );
    
    if ( length < this.thickness ){
      this.setVisible(false);
    } else {
      this.cylinderMesh.scale.z = length;
      
      this.cylinderMesh.position.set(0,0,0);
      this.coneMesh.position.set(0,0,0);
      this.cylinderMesh.lookAt( ...vec );
      this.coneMesh.lookAt( ...vec );
      
      this.cylinderMesh.position.set( ...math.divide( vec, 2 ) );
      this.coneMesh.position.set( ...math.add( vec, math.multiply( this.thickness, math.divide( vec, length ) ) ) );
      this.setVisible(true);
    }
  }

  setVisible(visible){
    this.coneMesh.visible = visible;
    this.cylinderMesh.visible = visible;
  }
}

var hyperObject = {
  rotation: [0,0,0,0,0,0],
  points4D:    [[1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1],
	  	[1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1],
		[1,1,1,1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1],
		[1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1]],
  connections: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],[8,9],[9,10],[10,11],[11,8],[12,13],[13,14],[14,15],[15,12],[8,12],[9,13],[10,14],[11,15],[0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15]],
  // material: new THREE.MeshPhongMaterial( { color: 0x2194ce, shininess: 100 } ),
  material: new THREE.MeshToonMaterial( { color: 0x2194ce, gradientMap: THREE.threeTone } ),
  thickness: 0.05,
  
  xUp: [1,0,0,0],
  yUp: [0,1,0,0],
  zUp: [0,0,1,0],
  wUp: [0,0,0,1],

  xArr: new Arrow([1,0,0], 0.05, 0xff0000),
  yArr: new Arrow([0,1,0], 0.05, 0x00ff00),
  zArr: new Arrow([0,0,1], 0.05, 0x0000ff),
  wArr: new Arrow([0,0,0], 0.05, 0xffffff),

  proj23d: function(){
    this.points3D = project23d(this.rotPoints4D);
  },
  createMeshes: function(){
    const conectionGeometry = new THREE.CylinderBufferGeometry(this.thickness,this.thickness,1,20);
    conectionGeometry.rotateX(math.PI/2);
    const pointGeometry = new THREE.SphereBufferGeometry(this.thickness,20,20);

    this.meshes = [];
    for (let connection of this.connections){
      let mesh = new THREE.Mesh( conectionGeometry, this.material );
      this.meshes.push( mesh );
    }

    for ( var x in this.points3D[0] ){
      let mesh = new THREE.Mesh( pointGeometry, this.material );
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
      if (math.round(rotation[eh], 3) == 0) { continue };
      
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
    
    let i = 0;
    for ( var connection of this.connections ){
      this.meshes[i].position.set(0,0,0);

      let pt1 = [this.points3D[0][connection[0]],this.points3D[1][connection[0]],this.points3D[2][connection[0]]];
      let pt2 = [this.points3D[0][connection[1]],this.points3D[1][connection[1]],this.points3D[2][connection[1]]];
      
      let length = math.distance(pt1,pt2);
      this.meshes[i].scale.z = length;
      
      this.meshes[i].lookAt(new THREE.Vector3(pt2[0]-pt1[0],pt2[1]-pt1[1],pt2[2]-pt1[2]).normalize());

      let translation = math.divide(math.add(pt1,pt2),2);
      this.meshes[i].position.set(translation[0], translation[1], translation[2]);
      
      i += 1;
    }

    for ( i in this.rotPoints4D[0] ){
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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  const controls = new OrbitControls( camera, renderer.domElement );
  
  scene.background = new THREE.Color( 0xffdf06 );

  ////////// Scene Setup //////////
  // Camera
  camera.position.set(0,2,-5);
  camera.lookAt( new THREE.Vector3(0,0,0) );
  controls.update(); // OrbitControls must be updated after changes to camera position/rotation

  
  // Objects
  const floorGeometry = new THREE.PlaneGeometry(22, 22);
  const floorMaterial = new THREE.ShadowMaterial({ opacity: .3 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.name = 'floor';
  floor.position.y = -4;
  floor.rotateX(- Math.PI / 2);
  floor.receiveShadow = true;

  scene.add(floor);

  for (var mesh of hyperObject.meshes){
    mesh.castShadow = true;
    scene.add(mesh);
  }

  scene.add(hyperObject.xArr.coneMesh);
  scene.add(hyperObject.yArr.coneMesh);
  scene.add(hyperObject.zArr.coneMesh);
  scene.add(hyperObject.wArr.coneMesh);
  scene.add(hyperObject.xArr.cylinderMesh);
  scene.add(hyperObject.yArr.cylinderMesh);
  scene.add(hyperObject.zArr.cylinderMesh);
  scene.add(hyperObject.wArr.cylinderMesh);
  

  // Lighting
  const ambientLight = new THREE.AmbientLight( 0xc4c4c4, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight( 0xffffff, 1, 19 );
  pointLight.position.set(-3,10,-3);
  pointLight.castShadow = true;
  pointLight.shadow.camera.near = 0.1;
  pointLight.shadow.camera.far = 25;
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  scene.add(pointLight);

}

// var totalrot = [0,0,0,0,0,0]

// xy, xz, yz, xw, yw, zw
// var animrot = [0,0.8,0,0,0.8,0];

const clock = new THREE.Clock();

function animate(){

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
  
  let xyrot = (document.getElementById("xy_slider").value) * (math.PI / 180)
  let xzrot = (document.getElementById("xz_slider").value) * (math.PI / 180)
  let yzrot = (document.getElementById("yz_slider").value) * (math.PI / 180)
  let xwrot = (document.getElementById("xw_slider").value) * (math.PI / 180)
  let ywrot = (document.getElementById("yw_slider").value) * (math.PI / 180)
  let zwrot = (document.getElementById("zw_slider").value) * (math.PI / 180)
  
  // totalrot = math.add(totalrot, math.multiply(animrot, dTime));
  // hyperObject.setRotation(totalrot);
  // console.log(totalrot);
  hyperObject.setRotation([xyrot,xzrot,yzrot,xwrot,ywrot,zwrot]);
  hyperObject.proj23d();
  hyperObject.updateMeshes();

  hyperObject.xArr.setDirection(hyperObject.xUp.slice(0,3));
  hyperObject.yArr.setDirection(hyperObject.yUp.slice(0,3));
  hyperObject.zArr.setDirection(hyperObject.zUp.slice(0,3));
  hyperObject.wArr.setDirection(hyperObject.wUp.slice(0,3));

  renderer.render( scene, camera );
}

// Resize canvas on window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


init();
animate();
