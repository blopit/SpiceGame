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
require("scripts/camera.js");

////////////////////////////////////////////////////////////////////////////////
// Globals
////////////////////////////////////////////////////////////////////////////////

var tintCanvas = document.createElement('canvas');
tintCanvas.width = 512;
tintCanvas.height = 512;
var tintCtx = tintCanvas.getContext('2d');

//screen globals
screen_width = 800;
screen_height = 600;
screen_bound = 128;

ground_level = 900;

mouse = {x:0,y:0};
emouse = mouse;
tree = null;  //player
//TR = {x:800,y:ground_level};

maxHP = 1000;
HP = 50;
drwHP = 50;
maxNT = 1000;
NT = 50;
drwNT = 50;

time = 0;
objtList = [];
length = 0;

selected = null;
hover = null;

cam = null;
cvs = document.getElementById('screen');

s_worm = [];
s_back = [];
s_snail = [];
s_tree = [];

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

timefctr = 1.0;         //time factor

var w = null;
////////////////////////////////////////////////////////////////////////////////
// Event loop
////////////////////////////////////////////////////////////////////////////////
window.onload = function() {
    function addImage(list,url,w,h, xf, yf){
        var image = new Image();
        image.src = url;
        list.push(new sprite({ width: w, height: h, image: image, xoff: xf, yoff: yf}));
    }

    addImage(s_tree,"images/backgrounds/seed.png",76,40,0,0);
    addImage(s_back,"images/backgrounds/back.png",1600,1000,0,0);

    var image = new Image();
    image.src = "images/sprites/ss_ws.png";
    s_worm.push(new sprite({ width: 164, height: 121,
        numberframes: 5,
        image: image, yyf: 121, xoff: 70, yoff: 75}));

    image.src = "images/sprites/ss_ws.png";
    s_snail.push(new sprite({ width: 164, height: 121,
        numberframes: 5,
        image: image, xoff: 70, yoff: 75}));

    //get & set canvas
    cam = new camera(0.05);
    rectx = {x: 0, y: 0, width: 1600, height: 1000};
    cam.bound = rectx;
    cam.cx = 800;
    cam.cy = 600;


    var c = cvs.getContext('2d');
    c.canvas.width = screen_width;
    c.canvas.height = screen_height;

    tree = new tree(775,880,51,33);
    objtList.push(tree);

    var idx = 0;
    function addSection(list,type){
        objtList.push(new section(idx++,list,type));
    }

    addSection([285,552,287,592,331,574,327,541],"dirt");
    addSection([282,552,285,592,224,590,236,552],"dirt");
    addSection([188,544,178,584,223,590,236,552],"dirt");

    addSection([320,161,324,105,322,1,345,0,347,105,347,164,344,168],"branch");
    addSection([218,179,213,83,195,52,178,24,171,11,168,0,143,0,147,29,170,75,183,91,196,118,208,148],"branch");
    addSection([294,245,311,206,321,161,345,168,338,202,324,236,306,270,295,304,294,273],"branch");

    addSection([206,2,213,82,218,176,253,171,292,173,289,87,287,24,286,1],"trunk");
    addSection([218,177,221,330,296,329,292,173,253,171],"trunk");
    addSection([215,456,221,330,297,328,299,454],"trunk");
    addSection([184,541,210,494,214,454,299,455,312,504,333,539,289,551,257,553,208,547],"trunk");

    addSection([191,525,180,576,0,586,1,525],"shade");
    addSection([326,529,332,573,523,586,521,521,409,525],"shade");


    var x = new snail(900,800,48,32);
    x.faction = 2;
    w = x;
    objtList.push(x);
    x = new worm(300,800,48,32);
    x.faction = 0;
    x.hitStun = 100;
    objtList.push(x);


    objtList.push(new hopper(600,400,48,32));

    setInterval(function() {
        time++;
        f.innerHTML = "FPS: " + fps.getFPS();
        HP++;
        //save canvas settings
        c.save();
        //clear screen & draw background
        //c.clearRect(0,0,screen_width,screen_height);
        //c.fillStyle = "DarkBlue";
        //c.fillRect(0,0,screen_width,screen_height);


        canvas = c;


        //if (distPoints(cam.x,cam.y,mouse.x,mouse.y) > 32){
        mouse = {x:emouse.x+cam.x,y:emouse.y+cam.y};
        if (!isPointInRect(mouse, cam.x+64, cam.y+64, cam.width-128, cam.height-128)){
            cam.springTo(mouse.x,mouse.y);
        }


        //}

        //draw objects relative to centered camera
        c.translate(cam.width/2-cam.cx,cam.height/2-cam.cy);
        cam.update();

        s_back[0].render(c,0,0,0,1);

        //draw objects TODO: draw objects by depth property
        for (var i = 0; i < objtList.length; i++) {
            var o = objtList[i];
            o.update(c);
            o.draw(c);
        }

        c.fillStyle = "black";
        c.beginPath();
        c.arc(mouse.x,mouse.y,15,0,2*Math.PI);
        c.closePath();
        c.fill();

        c.lineWidth=10;
        c.strokeRect(rectx.x,rectx.y,rectx.width,rectx.height);
        //restore saved canvas
        c.restore();


        //HUD

        c.fillStyle = "black";
        c.fillRect(16,16,128,12);
        c.fillRect(16,32,128,12);

        c.fillStyle = "darkgreen";
        c.fillRect(16,16,128*(HP/maxHP),12);
        c.fillStyle = "lime";
        c.fillRect(16,32,128*(NT/maxNT),12);

    }, 1000 / 60); //60fps TODO: find better/faster way to do this
};

document.onclick = function(e){
    w.attStun = 60;
    //w.hsp = 4;
    //w.vsp = -4;
    //w.hp -= 20;
    w.li = 1.10;

    for (var i = 0; i < objtList.length; i++) {
        var o = objtList[i];
        if (o.bound != "poly_sect")
            continue;

        var pt = mouse;
        if (isPointInRect(pt, o.x, o.y, o.width, o.height)){
            if (isPointInPoly(o.points, pt)){
                console.log("OI!");
                selected = o;
            }
        }
    }
}

 document.onmousemove = function (e) {
    var rect = cvs.getBoundingClientRect();
    emouse = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    //emouse = {x: e.offsetX, y: e.offsetY};
 }

