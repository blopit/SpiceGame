
// BASE OBJECTS DOCUMENT
////////////////////////////////////////////////////////////////////////////////
// displayable PARENT / regular block
////////////////////////////////////////////////////////////////////////////////

function display(x, y, width, height) {
    this.sprite = null;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.depth = 0; //TODO: implement
    this.on_screen = true;
}

display.prototype.draw = function (c) {
    c.fillStyle = "white";
    c.fillRect(this.x,this.y,this.width,this.height);
}

display.prototype.update = function (b, keys) {
}

function checkOnScreen(o) {
    o.on_screen = colRxR(o,screen_rect);
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
    this.hp = 0;
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
    this.path = null;
    this.pos = 0;
}

moveBlock.prototype.draw = function (c) {
    c.fillStyle = "lime";
    c.fillRect(this.x,this.y,this.width,this.height);
}

moveBlock.prototype.update = function (c) {
    if (this.path != null){

        var loc = this.path.getPos(this.pos);
        var dx = loc[0];
        var dy = loc[1];
        this.hsp = dx-this.x;
        this.vsp = dy-this.y;
        var rectx = {x:dx, y:dy-4, width: this.width, height: this.height};
        var recty = {x:dx+2, y:dy-2, width: this.width-4, height: this.height};

        if (this.vsp > 0)
            this.y = dy;

        if (colRxR(rectx,hero)){
            slopeMicroMove(hero,list,hero.climb,this.hsp,this.vsp);
        }
        this.x = dx;

        if (this.vsp < 0)
            this.y = dy;

        this.pos+=this.path.speed;
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

    this.pathlen = 0;
    this.pathpnts = [0];

    var cx = this.xx[0];
    var cy = this.yy[0];
    this.xx.push(cx);
    this.yy.push(cy);

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

movePath.prototype.getPos = function (val) {
    var cur = 0;
    var moduloval = val % this.pathlen;

    while (moduloval > this.pathpnts[cur]){
        cur++;
    }

    if (cur === 0)
        return [this.xx[0],this.yy[0]];

    var dir = anglePoints(this.xx[cur],this.yy[cur],this.xx[cur-1],this.yy[cur-1]);
    var dist = this.pathpnts[cur] - moduloval;

    return [this.xx[cur]+Math.cos(dir)*dist,this.yy[cur]+Math.sin(dir)*dist];

}