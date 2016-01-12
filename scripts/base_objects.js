
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
}

display.prototype.draw = function (c) {
    c.fillStyle = "white";
    c.fillRect(this.x,this.y,this.width,this.height);
}

display.prototype.update = function (b, keys) {
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