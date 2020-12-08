var rotation = [0,0,0,0,0,0]; //XY,YZ,XZ,XW,YW,ZW
var myvar = setInterval(autoSlider, 25);
var axisList = ["XY","YZ","XZ","XW","YW","ZW"];

var drawcube = (function (){
  var cam = [0,0,-5,-3];
  var canvas = document.getElementById("hyperCube");
  var ctx = canvas.getContext("2d");
  var connections = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],[8,9],[9,10],[10,11],[11,8],[12,13],[13,14],[14,15],[15,12],[8,12],[9,13],[10,14],[11,15],[0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15]];
  
  return function (){ 
    var cube = [[1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1],
                          [1,1,-1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,-1],
                          [1,1,1,1,-1,-1,-1,-1,1,1,1,1,-1,-1,-1,-1],
                          [1,1,1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1]];
    
    for (i = 0; i < 6; i++){
      rotation[i] = document.getElementById(axisList[i] + "_slider").value
    }
     
    var proj4 = document.getElementsByName('4Dproj');
    var proj3 = document.getElementsByName('3Dproj');
    
    var a = (Math.cos(rotation[0] * Math.PI / 180)), //cxy > cz
        b = (Math.sin(rotation[0] * Math.PI / 180)), //sxy > sz
        c = (Math.cos(rotation[1] * Math.PI / 180)), //cyz > cx
        d = (Math.sin(rotation[1] * Math.PI / 180)), //syz > sx
        e = (Math.cos(rotation[2] * Math.PI / 180)), //cxz > cy
        f = (Math.sin(rotation[2] * Math.PI / 180)), //sxz > sy
        g = (Math.cos(rotation[3] * Math.PI / 180)), //cxw
        h = (Math.sin(rotation[3] * Math.PI / 180)), //sxw
        i = (Math.cos(rotation[4] * Math.PI / 180)), //cyw
        j = (Math.sin(rotation[4] * Math.PI / 180)), //syw

        k = (Math.cos(rotation[5] * Math.PI / 180)), //czw
        l = (Math.sin(rotation[5] * Math.PI / 180)); //szw
    
    
    for (x in cube[0]){
      var cube_x = cube[0][x],
          cube_y = cube[1][x],
          cube_z = cube[2][x],
          cube_w = cube[3][x];
      
      cube[0][x] = g*(b*d*f+e*a)*cube_x + (j*h*(b*d*f+e*a)+b*c*i)*cube_y + (l*(i*h*(b*d*f+e*a)-b*c*j)+k*(-a*f+e*b*d))*cube_z + (k*(i*h*(b*d*f+e*a)-b*c*j)-l*(-a*f+e*b*d))*cube_w;
      cube[1][x] =g*(a*d*f-e*b)*cube_x + (j*h*(a*d*f-e*b)+a*c*i)*cube_y + (l*(i*h*(a*d*f-e*b)-a*c*j)+k*(b*f+e*a*d))*cube_z + (k*(i*h*(a*d*f-e*b)-a*c*j)-l*(b*f+e*a*d))*cube_w;
      cube[2][x] = c*f*g*cube_x + (c*j*f*h-d*i)*cube_y + (e*c*k+l*(c*i*f*h+d*j))*cube_z + (k*(c*i*f*h+d*j)-e*c*l)*cube_w;
      cube[3][x] = -h*cube_x + j*g*cube_y + l*i*g*cube_z + i*k*g*cube_w;
      
      /*
      cube[0][x] = a*e*cube_x + (f*a*d-c*b)*cube_y + (f*b*c-a*d)*cube_z;
      cube[1][x] = b*e*cube_x + (f*a*b+c*a)*cube_y + (f*b*c-a*d)*cube_z;
      cube[2][x] = -f*cube_x + (e*d)*cube_y + (e*c)*cube_z;
      cube[3][x] = cube_w;
      */
      // cube[0][x] = (e*((b*cube_y)+(a*cube_x))-f*cube_z);
      // cube[1][x] = (d*(e*cube_z+f*(b*cube_y+a*cube_x))+c*(a*cube_y-b*cube_x));
      // cube[2][x] = (c*(e*cube_z+f*(b*cube_y+a*cube_x))-d*(a*cube_y-b*cube_x));

    }
    
    for (x in cube[0]){
      cube[3][x] -= cam[3]; 
    }
    
    if (proj4[0].checked) {
      for (x in cube[0]){
        cube[0][x] = ((1/cube[3][x])*cube[0][x]*10);
        cube[1][x] = ((1/cube[3][x])*cube[1][x]*10);
        cube[2][x] = ((1/cube[3][x])*cube[2][x]*10);
      }
    }
    if (proj4[1].checked) {
      for (x in cube[0]){
        cube[0][x] *= 5;
        cube[1][x] *= 5;
        cube[2][x] *= 5;
      }
    }
  
    for (x in cube[0]){
      cube[2][x] -= (cam[2] - 12); 
    }
  
    if (proj3[0].checked) {
      for (x in cube[0]){
        cube[0][x] = ((1/cube[2][x])*cube[0][x]*500) + 300;
        cube[1][x] = ((1/cube[2][x])*cube[1][x]*500) + 300;
      }
    }
    if (proj3[1].checked) {
      for (x in cube[0]){
        cube[0][x] = (cube[0][x]*40) + 300;
        cube[1][x] = (cube[1][x]*40) + 300;
      }
    }
  
    //Clear the previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    //Draw new hypercube
    ctx.beginPath();
    ctx.strokeStyle = "black";
    for (connection of connections){
      ctx.moveTo(cube[0][connection[0]],cube[1][connection[0]]);
      ctx.lineTo(cube[0][connection[1]],cube[1][connection[1]]);
    }
    ctx.stroke();
    
  }
})();

function tfunc(){
  //rotation[0] += 0.5;
  //rotation[1] += 0.5;
  rotation[2] += 0.5;
  //rotation[3] += 0.5;
  rotation[4] += 0.5;
  //rotation[5] += 0.5;
  drawcube();
}


function autoSlider(){
  
  
  for (i = 0; i < 6; i++){
    if (document.getElementById(axisList[i]+"_checkbox").checked == true) {
      document.getElementById(axisList[i]+"_slider").stepUp(document.getElementById(axisList[i]+"_multiplier").value * 10);
      if (document.getElementById(axisList[i]+"_slider").value == "360") {
        document.getElementById(axisList[i]+"_slider").value = "0";
      }
    }
    document.getElementById(axisList[i]+"_rotext").innerHTML = document.getElementById(axisList[i]+"_slider").value;
  }
  
  
  drawcube()
}
