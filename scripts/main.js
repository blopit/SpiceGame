////////////////////////////////////////////////////////////////////////////////
// Ajax sync script require
// sync aditional JS scripts, makes things modular
////////////////////////////////////////////////////////////////////////////////

//add required scripts in post (Not actually required can just add in html...)
function require(jsFilePath) {
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;

    document.body.appendChild(js);
}

require("scripts/base_objects.js");
require("scripts/player.js");
require("scripts/svg.js");
require("scripts/computation.js");
require("scripts/sprite.js");

////////////////////////////////////////////////////////////////////////////////
// Globals
////////////////////////////////////////////////////////////////////////////////

//screen globals
screenWidth = 800;
screenHeight = 600;

//camera globals
camx = 0;
camy = 0;
cam_spring = 0.15; //speed factor camera snaps to player view
screen_rect = {x: camx-screenWidth/2, y: camy-screenHeight/2, width: screenWidth, height: screenHeight};

//Global initializations
time = 0;               //time increment
list = [];
xmlhttp = null;
hero = null;  //player

var fps = {
    startTime : 0,
    frameNumber : 0,
    getFPS : function(){
        this.frameNumber++;
        var d = new Date().getTime(),
        currentTime = ( d - this.startTime ) / 1000,
        result = Math.floor( ( this.frameNumber / currentTime ) );
        if( currentTime > 1 ){
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        return result;
    }
};
var f = document.querySelector("#fps");

grav = 0.5;             //gravity
timefctr = 1.0;         //time factor

//KEYBOARD GLOBALS
//up,down,left,right,jump,att,item
//how long since last key press of same key
//how long key has been held down
keys = [false,false,false,false,false,false,false,
0,0,0,0,0,0,0,
0,0,0,0,0,0,0];

//up_key, down_key, left_key, right_key, space_key, space_key, space_key
key_codes = [38, 40, 37, 39, 32 ,32 ,32] // key codes


////////////////////////////////////////////////////////////////////////////////
// SVG FILE READER
////////////////////////////////////////////////////////////////////////////////

//click 'Open SVG' button
$('#id').on('click', function() {
    $('#svg').trigger('click');
});

//read a file
function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;

        list = [];
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(contents,"text/xml");
        onLoadLevel(xmlDoc);
    };
    reader.readAsText(file);
}

document.getElementById('svg').addEventListener('change', readSingleFile, false);

//check to see if svg element (elem) matches a color (col)
function checkColour(elem, col) {
  if (elem === null)
      return false;
  else if (elem.style.fill != null){
      if (elem.style.fill.toUpperCase() === col)
            return true;
  }
  else if (elem.getAttribute("fill") != null){
      if (elem.getAttribute("fill").toUpperCase() === col)
            return true;
  }
  else
      return false;
}

//Load an XML document (xmlDoc)
function onLoadLevel(xmlDoc) {
    var x = xmlDoc.getElementsByTagName("rect");
    var obj_missing_path = null;
    for (i = 0; i < x.length; i++) {
        if (x[i].style.fill === "rgb(0, 0, 0)" || checkColour(x[i],"#000000")){
            list.push(new objt(
            Math.floor(x[i].getAttribute("x")),
            Math.floor(x[i].getAttribute("y")),
            Math.floor(x[i].getAttribute("width")),
            Math.floor(x[i].getAttribute("height"))
            ));
        }else if (x[i].style.fill === "rgb(0, 255, 0)" || checkColour(x[i],"#00FF00")){
            hero = new player(
            Math.floor(x[i].getAttribute("x")),
            Math.floor(x[i].getAttribute("y")),
            Math.floor(x[i].getAttribute("width")),
            Math.floor(x[i].getAttribute("height"))
            );
            list.push(hero);
        }else if (x[i].style.fill === "rgb(255, 0, 255)" || checkColour(x[i],"#FF00FF")){
            list.push(new jtBlock(
            Math.floor(x[i].getAttribute("x")),
            Math.floor(x[i].getAttribute("y")),
            Math.floor(x[i].getAttribute("width")),
            Math.floor(x[i].getAttribute("height"))
            ));
        }else if (x[i].style.fill === "rgb(0, 0, 255)" || checkColour(x[i],"#0000FF")){
            obj_missing_path = new moveBlock(
            Math.floor(x[i].getAttribute("x")),
            Math.floor(x[i].getAttribute("y")),
            Math.floor(x[i].getAttribute("width")),
            Math.floor(x[i].getAttribute("height"))
            )
            list.push(obj_missing_path);
        }

    }

    x = xmlDoc.getElementsByTagName("path");
    for (i = 0; i < x.length; i++) {
        if (x[i].style.fill === "rgb(0, 0, 0)" || checkColour(x[i],"#000000")){
            var path = x[i].getAttribute("d");
            if (path != "" && path != null){
                var p = extractPoints(parse(path));
                list.push(new polyBlock(p[0],p[1]));
            }
        }else if (x[i].style.fill === "none"){
            var path = x[i].getAttribute("d");
            if (path != "" && path != null){
                var p = extractPoints(parse(path));
                console.log(Number(x[i].style.strokeWidth));
                var mp = new movePath(p[0],p[1],parseInt(x[i].style.strokeWidth,10));
                list.push(mp);
                if (obj_missing_path){
                    obj_missing_path.path = mp;
                }
            }
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
// Event loop
////////////////////////////////////////////////////////////////////////////////

window.onload = function() {

    //get & set canvas
    var c = document.getElementById('screen').getContext('2d');
    c.canvas.width = screenWidth;
    c.canvas.height = screenHeight;

    //load first level svg
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "levels/lvl0.svg", true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState== 4 && xmlhttp.status == 200) {
            onLoadLevel(xmlhttp.responseXML);
        }
    };
    xmlhttp.send(null);

    //MAIN GAME LOOP
    setInterval(function() {
        time++;
        f.innerHTML = "FPS: " + fps.getFPS();

        //save canvas settings
        c.save();
        //clear screen & draw background
        c.clearRect(0,0,screenWidth,screenHeight);
        c.fillStyle = "DarkBlue";
        c.fillRect(0,0,screenWidth,screenHeight);

        //draw objects relative to centered camera
        c.translate(screenWidth/2-camx,screenHeight/2-camy);

        //draw objects TODO: draw objects by depth property
        screen_rect = {x: camx-screenWidth/2, y: camy-screenHeight/2, width: screenWidth, height: screenHeight};
        for (var i = 0; i < list.length; i++) {
            var o = list[i];
            var draw = checkOnScreen(o);
            o.update(list, keys);
            if (checkOnScreen(o)){
                o.draw(c);
            }
        }

        //restore saved canvas
        c.restore();

    }, 1000 / 60); //60fps TODO: find better/faster way to do this
};


function actionForEvent(e) {
    var key = e.which;
    for (var i = 0; i < key_codes.length; i++) {
        if (key == key_codes[i])
            return i;
    }
    return null;
}

window.onkeydown = function(e) {
    var action = actionForEvent(e);
    keys[action] = true;
};

window.onkeyup = function(e) {
    var action = actionForEvent(e);
    keys[action] = false;
};
