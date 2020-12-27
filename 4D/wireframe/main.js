"use strict"

////// Imports //////
import * as THREE from '../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { project23d, Rotor4D } from '../4dfuncs.js';


////// JQuery stuff //////
$(document).ready(function(){
  $('#resetButto').click(resetSliders);
  $('#cellSel').change(changeCell);
}); 


////// Objects and Global Variables //////
var scene, camera, renderer;
const planes = ["xy","xz","yz","xw","yw","zw"];

var hyperObject = {
  rotation: [0,0,0,0,0,0],
  material: new THREE.MeshPhongMaterial( { color: 0x2194ce, shininess: 100 } ),
  // material: new THREE.MeshToonMaterial( { color: 0x2194ce, gradientMap: THREE.threeTone } ),
  thickness: 0.05,
  
  xUp: [1,0,0,0],
  yUp: [0,1,0,0],
  zUp: [0,0,1,0],
  wUp: [0,0,0,1],

  loadData: function(cellName){
    let url = "./" + cellName + ".json";

    // console.log("loading " + url);

    let json = (function () {
      var json = null;
      $.ajax({
        'async': false,
        'global': false,
        'url': url,
        'dataType': "json",
        'success': function (data) {
          json = data;
        }
      });
      return json;
    })();
    
    this.points4D = json.points;
    this.connections = json.connections;
    this.thickness = json.optimalThickness;
    this.camWDist = json.optimalCamW;
    
    if ('meshes' in this) {
      for (let mesh of this.meshes){
        scene.remove(mesh);
      }
      this.createMeshes();
      for (let mesh of this.meshes){
        mesh.castShadow = true;
        scene.add(mesh);
      }
    } else {
      this.createMeshes();
    }
  },

  proj23d: function(){
    this.points3D = project23d(this.rotPoints4D, this.camWDist);
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

    for ( var x in this.points4D[0] ){
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


hyperObject.loadData("cell8");
hyperObject.setRotation([0,0,0,0,0,0]);
hyperObject.proj23d();
hyperObject.updateMeshes();


function init(){
  ////////// AAAAAAAAAAAA //////////
  const sceneWidth = document.getElementById("rendercanvas").clientWidth;
  const sceneHeight = document.getElementById("rendercanvas").clientHeight;
  const canv = document.getElementById("rendercanvas");

  ////////// Inital Setup //////////
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, sceneWidth / sceneHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer({canvas: canv, antialias: true, alpha: true});

  scene.background = new THREE.Color( 0x000000 );
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  renderer.setSize( sceneWidth, sceneHeight );
  // document.getElementById("scene").appendChild( renderer.domElement );
  
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



const clock = new THREE.Clock();
var reeee = 0.0;
var interval = 0.02;

function animate(){

  requestAnimationFrame( animate );
  
  reeee += clock.getDelta();
  if (reeee > 5){
    reeee = 5;
  }
  while (reeee > interval){
    sliderTest();
    reeee -= interval;
  }
  
  let xyrot = $('#xy_slider').val() * (math.PI / 180)
  let xzrot = $('#xz_slider').val() * (math.PI / 180)
  let yzrot = $('#yz_slider').val() * (math.PI / 180)
  let xwrot = $('#xw_slider').val() * (math.PI / 180)
  let ywrot = $('#yw_slider').val() * (math.PI / 180)
  let zwrot = $('#zw_slider').val() * (math.PI / 180)
  
  hyperObject.setRotation([xyrot,xzrot,yzrot,xwrot,ywrot,zwrot]);
  hyperObject.proj23d();
  hyperObject.updateMeshes();

  renderer.render( scene, camera );
}

function sliderTest(){
  for (let plane of planes){
    let sleeder = $('#' + plane + '_slider');
    if (document.getElementById(plane + "_checkbox").checked) {
      if (sleeder.val() == 360){
        sleeder.val(0)
      } else {
        sleeder.val(Number(sleeder.val()) + 1);
      }
    }
  }
}

function resetSliders(){
  for (let plane of planes){
    let sleeder = $('#' + plane + '_slider');
    sleeder.val(180);
  }
}

// Resize canvas on window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
  let sceneWidth = $('#scene').width();
  let sceneHeight = $('#scene').height();

  if (sceneWidth/sceneHeight < 1){
    sceneHeight = sceneHeight - 420;
  }
  
  $('#rendercanvas').width(sceneWidth);
  $('#rendercanvas').height(sceneHeight);

  camera.aspect = sceneWidth / sceneHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize( sceneWidth, sceneHeight );

}

function changeCell(){
  let cellType = $('#cellSel').val();
  hyperObject.loadData(cellType);
}


init();
animate();
