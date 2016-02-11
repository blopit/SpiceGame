
// BASE OBJECTS DOCUMENT
////////////////////////////////////////////////////////////////////////////////
// displayable PARENT (objects that do not collide with anything, eg foreground)
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
    this.bound = "rect";
}

//draw called for all visible objects on screen
display.prototype.draw = function (c) {
    c.fillStyle = "white";
    c.fillRect(this.x,this.y,this.width,this.height);
}

//update called for all objects
display.prototype.update = function (b, keys) {
}

////////////////////////////////////////////////////////////////////////////////
// object PARENT / all objects that are not entities (powerups, projectiles, blocks)
////////////////////////////////////////////////////////////////////////////////

function objt(x, y, width, height) {
    display.call(this, x, y, width, height);

    //horizonal SPEED
    this.hsp = 0;

    //vertical SPEED
    this.vsp = 0;
}

objt.prototype.draw = function (c) {
    c.fillStyle = "blue";
    c.fillRect(this.x,this.y,this.width,this.height);
}

objt.prototype.update = function (b, keys) {
}

////////////////////////////////////////////////////////////////////////////////
// instance PARENT // objects that are entities (player, enemies)
////////////////////////////////////////////////////////////////////////////////

function instance(x, y, width, height) {
    objt.call(this, x, y, width, height);
    this.hp = 0; //HIT points
    this.faction = 1; //neutral
    this.target = null;

    etickMin = 60;
    etickMax = 60*5;
    neutE = 0;
    hitStun = 0;
    neutToggle = false;
}

instance.prototype.draw = function (c) {
    c.fillStyle = "green";
    c.fillRect(this.x,this.y,this.width,this.height);
}

instance.prototype.update = function (c) {
}

////////////////////////////////////////////////////////////////////////////////
// blocks
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// polygon BLOCK
////////////////////////////////////////////////////////////////////////////////

function section(idx,list,type) {
    p = [];
    for (var i = 0; i < list.length; i+=2){
        p.push({x:list[i],y:list[i+1]})
    }
    this.drawPoints = p;
    var clockwise = (polygonArea(p) > 0)?-1:1;

    this.skele = straight_skeleton(p, 8*clockwise);
    this.points = straight_skeleton(p, -4*clockwise);

    var minX = this.points[0].x;
    var maxX = minX;
    var minY = this.points[0].y;
    var maxY = minY;


    for (var i = 0; i < p.length; i++){
        var pnt = p[i];
        if (pnt.x > maxX){
            maxX = pnt.x
        } else if (pnt.x < minX){
            minX = pnt.x;
        }
        if (pnt.y > maxY){
            maxY = pnt.y
        } else if (pnt.y < minY){
            minY = pnt.y;
        }
    }

    display.call(this, minX, minY, maxX-minX, maxY-minY);
    this.bound = "poly_sect";
    this.type = type;
    this.idx = idx;
    this.owner = null;

    this.selected = false;

}



section.prototype.draw = function (c) {

    c.fillStyle = "purple";
    if (this.type == "dirt"){
        c.fillStyle = "brown";
    }else if (this.type == "shade"){
        c.fillStyle = "orange";
    }else if (this.type == "trunk"){
        c.fillStyle = "green";
    }else if (this.type == "branch"){
        c.fillStyle = "blue";
    }

    var poly = this.drawPoints;
    c.beginPath();
    c.moveTo(poly[0].x, poly[0].y);
    for( var i=1 ; i < poly.length ; i++){c.lineTo( poly[i].x , poly[i].y )}
    c.closePath();
    c.fill();

    c.globalAlpha = 0.5;
    //c.globalCompositeOperation = "multiply";

    c.fillStyle = "gray";
    if (selected == this){
        if (hover === this){
            c.fillStyle = "pink";
        }else{
            c.fillStyle = "red";
        }
        c.globalAlpha = 0.75;
    }else if (hover === this){
        c.fillStyle = "white";
        c.globalAlpha = 0.65;
    }

    /*roundedPath(this.skele , c, 0.3);
    c.fill();
    */
    c.globalAlpha = 1.0;

}

section.prototype.update = function (c) {
    if (hover == null){
        if (isPointInRect(mouse, this.x, this.y, this.width, this.height)){
            if (isPointInPoly(this.points, mouse)){
                hover = this;
                return;
            }
        }
    }else if (hover == this){
        if (!isPointInPoly(this.points, mouse)){
            hover = null;
        }
    }
}