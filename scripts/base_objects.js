
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
    this.hp = 100; //HIT points
    this.maxHp = 100;
    this.dhp = 100;
    this.faction = 1; //neutral
    this.target = null;
    this.name = "Wormo";

    this.attspd = 1;
    this.hitStun = 0;
    this.attStun = 0;
    this.ammo = false;
    this.Tattsp = 0;
    this.hKB = 4;
    this.vKB = 4;

    this.rtick = 0;
    this.neutE = 0;
    this.neutToggle = false;
    this.tick = 0;
    this.jump = 0;

    this.movement = 0;
    this.msp = 0.5;
    this.etickMin = 60;
    this.etickMax = 60*3;

    this.mx = 4.0;
    this.gravity = 0.25;

    this.flip = 1;
    this.xscale = 1;
    this.moving = false;

    this.li = 0.0;
}

instance.prototype.draw = function (c) {
    c.fillStyle = "green";
    c.fillRect(this.x,this.y,this.width,this.height);
}

function req(that){
    that.dhp += (that.hp-that.dhp)*0.03;

    if (that.li > 0.0){
        that.li -= 0.1;
        if (that.li < 0)
            that.li = 0.0;
    }

    if (that.hp <= 0){
        var index = objtList.indexOf(that);
        if (index > -1) {
            objtList.splice(index, 1);
        }
    }

    if (that.hitStun > 0)
        return;

    if (!that.ammo){
        if (that.Tattsp >= 60.0/that.attspd){
            that.ammo = true;
        }else{
            that.Tattsp++;
        }
    }
}

function ticker(that,mx){
    if (that.rtick <= 0){
        that.movement = parseInt(Math.round(Math.abs(that.mx*gauRnd())));
        that.flip = Math.sign(tree.x-that.x);
        if (that.flip == 0){that.flip = 1;}

        that.rtick = that.etickMin+(that.etickMax-that.etickMin)*Math.random();
    }
    that.rtick--;
}

function basicMove(that){
    if (that.hitStun > 0) {
        that.hitStun--;
        that.x += that.hsp;
        that.hsp = fric(that.hsp,0.05);
        return;
    }

    if (that.attStun > 0) {
        that.attStun--;
        that.x += that.hsp;
        that.hsp = fric(that.hsp,0.05);
        return;
    }

    if (that.x < 100){
        if (that.flip == 1){
            that.movement = 1;
        }else{
            that.movement = 2;
        }
    }else if (that.x+that.width > 1500){
        if (that.flip == 1){
            that.movement = 2;
        }else{
            that.movement = 1;
        }
    }

    that.moving = true;
    var xs = Math.sign(that.msp * that.flip);
    if (xs != 0 && that.movement >= 1){that.xscale = xs;}

    if (that.movement == 1){
        that.hsp = that.msp * that.flip;
    }else if (that.movement >= 2){
        that.hsp = -that.msp * that.flip;
        that.xscale *= -1;
    }else{
        that.moving = false;
        that.hsp = 0;
    }
    that.x += that.hsp;
}

function basicGrav(that){
    if (that.y < ground_level-that.height){
        that.vsp += that.gravity;
    }else{
        if (that.vsp > 0){
            that.vsp = 0;
        }

        that.y = ground_level-that.height;
    }

    that.y += that.vsp;
}

instance.prototype.update = function (c) {

    ticker(this,4.0);
    basicMove(this);
    basicGrav(this);
}

////////////

function crawler(x, y, width, height) {
    instance.call(this, x, y, width, height);
}

crawler.prototype.draw = function (c) {
    //s_worm[0].render(c,this.x+this.width/2,this.y+this.height/2,0,-this.xscale);
}

crawler.prototype.update = function (c) {
    ticker(this,5.0);
    basicMove(this);
    basicGrav(this);

}

function drawName(that,ctx,offset){
    var wid = 64

    var text = that.name;
    if (that.faction == 0) {
        ctx.fillStyle = 'lime';
    } else if (that.faction == 2){
        ctx.fillStyle = 'red';
    } else {
        ctx.fillStyle = 'yellow';
    }

    ctx.shadowBlur = 6;
    ctx.shadowColor = "black";

    ctx.font = '100 10pt Verdana';
    var v = ctx.measureText(text).width/2;
    ctx.fillText(text, that.x+that.width/2 - v, that.y - offset - 4);

    ctx.fillStyle = 'black';
    ctx.fillRect(that.x+that.width/2-wid/2, that.y - offset, wid, 6);
    ctx.fillStyle = 'red';
    ctx.fillRect(that.x+that.width/2-wid/2, that.y - offset, wid*(that.dhp/that.maxHp), 6);
    ctx.fillStyle = 'lime';
    ctx.fillRect(that.x+that.width/2-wid/2, that.y - offset, wid*(that.hp/that.maxHp), 6);

    ctx.shadowBlur = 0;
}

///////////
///////////
///////////

function drawColFrame(that, ctx, list, frame, col, amm) {
    ctx.save();
    tintCtx.fillStyle = col;
    tintCtx.fillRect(0,0,512,512);
    tintCtx.globalCompositeOperation = "destination-atop";
    list[0].render(ctx,that.x+that.width/2,that.y+that.height/2,frame,-that.xscale);
    tintCtx.globalAlpha = amm;
    list[0].render(tintCtx,256,256,frame,-that.xscale);
    ctx.drawImage(tintCanvas, that.x+that.width/2-256,that.y+that.height/2-256);
    ctx.restore();
    tintCtx.globalAlpha = 1.0;
}

function worm(x, y, width, height) {
    crawler.call(this, x, y, width, height);
    var names = ["Shane", "Mason", "Tyler", "Tyrone", "Logan", "Geoffry"];
    this.name = names[Math.floor(Math.random() * names.length)];
}

worm.prototype.draw = function (c) {

    if (this.hitStun > 0){
        drawColFrame(this,c,s_worm,3,"red",this.li);
    }else if (this.attStun > 0){
        drawColFrame(this,c,s_worm,4,"white",this.li);
    } else {
        if (this.moving){
            s_worm[0].render(c,this.x+this.width/2,this.y+this.height/2,(~~(this.frame)%3),-this.xscale);
            this.frame += 0.15;
        }else{
            this.frame = 0;
            s_worm[0].render(c,this.x+this.width/2,this.y+this.height/2,0,-this.xscale);
        }
    }

    drawName(this,c,28);
}

worm.prototype.update = function (c) {
    req(this);
    ticker(this,5.0);
    basicMove(this);
    basicGrav(this);
}

///////////

function snail(x, y, width, height) {
    crawler.call(this, x, y, width, height);
    var names = ["Gary", "Dennis", "Zac", "Leon", "Devin", "Tony"];
    this.name = names[Math.floor(Math.random() * names.length)];

    this.msp = 0.2;
    this.etickMin = 60*3;
    this.etickMax = 60*6;
}

snail.prototype.draw = function (c) {
    if (this.hitStun > 0){
        drawColFrame(this,c,s_snail,3,"red",this.li);
    }else if (this.attStun > 0){
        drawColFrame(this,c,s_snail,4,"white",this.li);
    } else {
        if (this.moving){
            s_snail[0].render(c,this.x+this.width/2,this.y+this.height/2,(~~(this.frame)%3),-this.xscale);
            this.frame += 0.06;
        }else{
            this.frame = 0;
            s_snail[0].render(c,this.x+this.width/2,this.y+this.height/2,0,-this.xscale);
        }
    }
    drawName(this,c,56);
}

snail.prototype.update = function (c) {
    req(this);
    ticker(this,5.0);
    basicMove(this);
    basicGrav(this);
}

///////////

function basicHop(that){

    if (that.y < ground_level-that.height){
        that.vsp += that.gravity;

        if (that.x < 100){
            if (that.flip == 1){
                that.movement = 1;
            }else{
                that.movement = 2;
            }
        }else if (that.x > 1500){
            if (that.flip == 1){
                that.movement = 2;
            }else{
                that.movement = 1;
            }
        }

        that.moving = true;
        var xs = Math.sign(that.msp * that.flip);
        if (xs != 0){that.xscale = xs;}

        if (that.movement >= 1 && that.movement < 2){
            that.x+= that.msp * that.flip;
        }else if (that.movement >= 2){
            that.x-= that.msp * that.flip;
            that.scale *= -1;
        }else{
            that.moving = false;
        }

    }else{
        if (that.rtick <= 0){
            that.movement = parseInt(Math.round(Math.abs(that.mx*gauRnd())));
            that.flip = Math.sign(tree.x-that.x);
            if (that.flip == 0){that.flip = 1;}
            that.rtick = that.etickMin+(that.etickMax-that.etickMin)*Math.random();
        }
        that.rtick--;

        if (that.vsp > 0) {
            that.vsp = 0;
        }

        if (that.rtick <= 1 && that.movement >= 1){
            that.vsp = that.jump;
        }
        that.y = ground_level-that.height;
    }

    that.y += that.vsp;


}

function hopper(x, y, width, height) {
    instance.call(this, x, y, width, height);
    this.gravity = 0.25;
    this.msp = 1.5;
    this.jump = -6
    this.mx = 6;
}

hopper.prototype.draw = function (c) {
    c.fillStyle = "pink";
    c.fillRect(this.x,this.y,this.width,this.height);
}

hopper.prototype.update = function (c) {

    //ticker(this,4.0);
    ticker(this,4.0);
    basicHop(this);

}

////////////////////////////////////////////////////////////////////////////////
// blocks
////////////////////////////////////////////////////////////////////////////////

function tree(x, y, width, height) {
    display.call(this, x, y, width, height);
}

tree.prototype.draw = function (c) {
    s_tree[0].render(c,this.x,this.y);
}

tree.prototype.update = function (c) {
}

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

    roundedPath(this.skele , c, 0.3);
    c.closePath();
    c.fill();

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
