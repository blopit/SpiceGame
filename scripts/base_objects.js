
// BASE OBJECTS DOCUMENT
////////////////////////////////////////////////////////////////////////////////
// displayable PARENT / regular block
////////////////////////////////////////////////////////////////////////////////

function display(x, y, width, height) {
    this.sprite = null; //related image
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.depth = 0; //TODO: implement
    this.on_screen = true;
}

//draw called for all visible objects on screen
display.prototype.draw = function (c) {
    c.fillStyle = "white";
    c.fillRect(this.x,this.y,this.width,this.height);
}

//update called for all objects
display.prototype.update = function (b, keys) {
}

function checkOnScreen(o,s) {
    var rect1 = {x:s.x-screen_bound,y:s.y-screen_bound,width:s.width+screen_bound*2,height:s.height+screen_bound*2};
    o.on_screen = colRxR(o,rect1);
    return o.on_screen;
}

////////////////////////////////////////////////////////////////////////////////
// object PARENT
////////////////////////////////////////////////////////////////////////////////

function objt(x, y, width, height) {
    display.call(this, x, y, width, height);

    //horizonal SPEED
    this.hsp = 0;

    //vertical SPEED
    this.vsp = 0;

    //COLLISION BOUNDARY TYPE
    this.bound = "rect";

    //friction on top of surface TODO: implement
    this.surf_fric = 0.25;
}

objt.prototype.draw = function (c) {
    c.fillStyle = "blue";
    c.fillRect(this.x,this.y,this.width,this.height);
}

objt.prototype.update = function (b, keys) {
}

////////////////////////////////////////////////////////////////////////////////
// instance PARENT
////////////////////////////////////////////////////////////////////////////////

function instance(x, y, width, height) {
    objt.call(this, x, y, width, height);
    this.hp = 0; //HIT points

    //horizontal bounce factor TODO: explain this a bit more
    this.bnc = 0.25;
}

instance.prototype.draw = function (c) {
    c.fillStyle = "green";
    c.fillRect(this.x,this.y,this.width,this.height);
}


////////////////////////////////////////////////////////////////////////////////
// blocks
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// polygon BLOCK
////////////////////////////////////////////////////////////////////////////////

function polyBlock(xx, yy) {

    var _x = Math.min.apply(Math,xx);
    var _width = Math.max.apply(Math,xx)-_x;

    var _y = Math.min.apply(Math,yy);
    var _height = Math.max.apply(Math,yy)-_y;

    objt.call(this, _x, _y, _width, _height);

    this.bound = "poly";
    this.xx = xx; //x coordinates
    this.yy = yy; //y coordinates
}

polyBlock.prototype.draw = function (c) {

    c.fillStyle = "purple";
    c.beginPath();
    c.moveTo(this.xx[0], this.yy[0]);

    for (var i = 1; i < this.xx.length; i++){
        c.lineTo(this.xx[i], this.yy[i]);
    }
    c.closePath();
    c.fill();

    c.beginPath();
    c.strokeStyle = "pink";
    c.rect(this.x,this.y,this.width,this.height);
    c.stroke();

}

polyBlock.prototype.update = function (c) {
}

////////////////////////////////////////////////////////////////////////////////
// jumpthrough BLOCK
////////////////////////////////////////////////////////////////////////////////

function jtBlock(x, y, width, height) {
    objt.call(this, x, y, width, height);
    this.bound = "jt";
}

jtBlock.prototype.draw = function (c) {
    c.fillStyle = "pink";
    c.fillRect(this.x,this.y,this.width,this.height);
}

jtBlock.prototype.update = function (c) {
}

////////////////////////////////////////////////////////////////////////////////
// moveblock BLOCK
////////////////////////////////////////////////////////////////////////////////

function moveBlock(x, y, width, height) {
    objt.call(this, x, y, width, height);
    this.path = null;   //path object
    this.pos = 0;       //position in path
}

moveBlock.prototype.draw = function (c) {
    c.fillStyle = "lime";
    c.fillRect(this.x,this.y,this.width,this.height);
}

moveBlock.prototype.update = function (c) {
    //update if path exists
    if (this.path != null){

        //get xy coords based on position in path
        var loc = this.path.getPos(this.pos);
        var dx = loc[0];
        var dy = loc[1];
        this.hsp = dx-this.x;
        this.vsp = dy-this.y;

        //check rectangle to see if player is near
        var rectx = {x:dx+Math.sign(this.hsp)*4, y:dy-4, width: this.width, height: this.height};
        var recty = {x:dx+Math.sign(this.hsp)*4, y:dy+1, width: this.width, height: this.height};
        //if moving downwards we want to move this first
        if (this.vsp > 0)
            this.y = dy;

        if (colRxR(rectx,hero)){
            //move player if player is near this
            if (colRxR(recty,hero)){
                if (this.hsp>0 && hero.hsp+this.hsp<this.hsp){
                    this.hsp-=hero.hsp;
                }
                if (this.hsp<0 && hero.hsp+this.hsp>this.hsp){
                    this.hsp-=hero.hsp;
                }
            }

            slopeMicroMove(hero,list,hero.climb,this.hsp,this.vsp);
        }
        this.x = dx;

        //not moving downwards so move as usual
        if (this.vsp < 0)
            this.y = dy;

        this.pos+=this.path.speed; // increase by path speed
    }
}



////////////////////////////////////////////////////////////////////////////////
// movePath
////////////////////////////////////////////////////////////////////////////////

function movePath(xx, yy, speed) {

    var _x = Math.min.apply(Math,xx);
    var _width = Math.max.apply(Math,xx)-_x;

    var _y = Math.min.apply(Math,yy);
    var _height = Math.max.apply(Math,yy)-_y;

    objt.call(this, _x, _y, _width, _height);

    this.bound = "none";
    this.xx = xx; //x coordinates
    this.yy = yy; //y coordinates
    this.speed = speed;

    this.pathlen = 0;       //total length of path
    this.pathpnts = [0];    //total path length at point index FYI: this.pathpnts[0] = 0

    var cx = this.xx[0];
    var cy = this.yy[0];
    this.xx.push(cx);
    this.yy.push(cy);

    //set values for pathlen and pathpnts
    for (var i = 1; i < this.xx.length; i++){
        var d = distPoints(cx,cy,this.xx[i],this.yy[i]);
        this.pathlen += d;
        this.pathpnts.push(this.pathlen);
        cx = this.xx[i];
        cy = this.yy[i];
    }
}

movePath.prototype.draw = function (c) {

    c.strokeStyle = "lime";
    c.beginPath();
    c.moveTo(this.xx[0], this.yy[0]);

    for (var i = 1; i < this.xx.length; i++){
        c.lineTo(this.xx[i], this.yy[i]);
    }
    c.stroke();

}

movePath.prototype.update = function (c) {
}

//get xy coords based on val (distance to travel from first point), loops at max length
movePath.prototype.getPos = function (val) {
    var cur = 0;

    //return if val = 0;
    if (val === 0){
        return [this.xx[0],this.yy[0]];
    }

    //setup val to be non negative
    while(val < 0){
        val += this.pathlen
    }

    //find the looped path value
    var moduloval = val % this.pathlen;

    //find the two points on path that the object would between
    while (moduloval > this.pathpnts[cur]){
        cur++;
    }

    //calculate the exact xy coord the object would be at
    var dir = anglePoints(this.xx[cur],this.yy[cur],this.xx[cur-1],this.yy[cur-1]);
    var dist = this.pathpnts[cur] - moduloval;
    return [this.xx[cur]+Math.cos(dir)*dist,this.yy[cur]+Math.sin(dir)*dist];

}


////////////////////////////////////////////////////////////////////////////////
// camera boundary
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// hard boundary
////////////////////////////////////////////////////////////////////////////////
function camBoundary(x, y, width, height, intensity) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.intensity = intensity;
}

camBoundary.prototype.draw = function (c) {

    c.beginPath();
    c.strokeStyle = "red";
    c.lineWidth = 8;
    c.rect(this.x,this.y,this.width,this.height);
    c.stroke();

}