


var maxammo = 30.0;
function fishbird(x, y) {
    instance.call(this, x, y);
    this.width = 32;
    this.height = 32;
    this.rotation = 0;

    this.vsp = 0;
    this.hsp = 0;
    this.speed = 0;

    this.ammo = -1;
    this.maxammo = 60;
    this.released = true;
    this.pressing = false;

    this.trail = new Array();
    this.trail.push = function (){
        if (this.length >= 120) {
            this.shift();
        }
        return Array.prototype.push.apply(this,arguments);
    };
    this.frame = 0;
    this.xscale = 1;


    var image = new Image();
    image.src = "images/sprites/fishbird.png";

    this.sprite = sprite({
        width: 128,
        height: 128,
        awidth: 128,
        aheight: 128,
        image: image,
        numberframes: 3,
        xoff: 64,
        yoff: 64,
        vert: false
    });

    this.hearts = 4;
}


fishbird.prototype.draw = function (c) {


    c.fillStyle = "red";
    c.fillRect(this.x,this.y,this.width,this.height);

    var am = maxammo - this.ammo;
    if (am > maxammo) am = maxammo;
    c.fillStyle = "rgba(255, 255, 255, 0.5)";
    c.fillRect(this.x,this.y,this.width,this.height * am/maxammo);

    c.fillStyle = "rgba(0, 0, 255, 0.5)";
    c.fillRect(this.x,this.y,this.width,this.height * this.boost/this.maxboost);

    c.fillStyle = "red";
    c.font = "30px Arial";
    c.fillText(Math.floor(this.boost), this.x, this.y);


    c.beginPath();
    c.lineWidth = 5;
    c.strokeStyle = "rgba(255, 255, 255, 0.25)";
    c.moveTo(-3000000, this.lowest);
    c.lineTo(3000000, this.lowest);
    c.stroke();

    c.beginPath();
    c.lineWidth = 5;
    c.strokeStyle = "rgba(255, 255, 255, 0.25)";
    c.moveTo(-3000000, this.highest);
    c.lineTo(3000000, this.highest);
    c.stroke();

    this.trail.push([this.x, this.y]);

    c.beginPath();
    c.lineWidth = 2;
    c.strokeStyle = "rgba(0, 0, 0, 0.25)";

    c.moveTo(this.x, this.y);
    for (var i = this.trail.length - 1; i >= 0; --i) {
        c.lineTo(this.trail[i][0], this.trail[i][1]);
    }
    c.stroke();

    this.sprite.render(c,this.x+this.width/2,this.y+this.height/2,this.frame,
        this.xscale * 0.5,0.5,
        this.rotation);

    c.fillText("0",mousepos.x, mousepos.y);
};


function median(values){
    if(values.length ===0) return 0;

    values.sort(function(a,b){
        return a-b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];

    return (values[half - 1] + values[half]) / 2.0;
}

function angle_difference(d1, d2) {
    var x = d1 * 3.14159/180.0;
    var y = d2 * 3.14159/180.0;
    return Math.atan2(Math.sin(x-y), Math.cos(x-y)) * 180.0/3.14159;
};

fishbird.prototype.rotateTo = function(direction, rate, easing) {
    this.rotation += median([-rate, rate, (1-easing) * angle_difference(direction, this.rotation)]);
    return this.rotation;
};

fishbird.prototype.update = function (b, keys) {

    if (this.ammo <= 0 && keys[4]) {
        bullet = new heartbullet(this.x, this.y, 100, 100);
        list.push(bullet);
        this.ammo = this.maxammo;
    } else {
        this.ammo -= 1;
    }

    var friction = 0.5;
    var acc = 1.0;
    var maxspd = 8.0;

    var dx = 0;
    var dy = 0;
    if (keys[0] && !keys[1]) {
        dy -= 1;
    } else if (keys[1] && !keys[0]) {
        dy += 1;
    }
    if (keys[2] && !keys[3]) {
        dx -= 1;
    } else if (keys[3] && !keys[2]) {
        dx += 1;
    }

    var angle = Math.atan2(dy, dx);
    if (dy != 0 || dx != 0) {
        cspeed = Math.sqrt(Math.pow(this.vsp,2) + Math.pow(this.hsp,2));
        aced = 0;
        if (cspeed + acc < maxspd) {
            aced = acc;
        } else if (cspeed < maxspd) {
            aced = maxspd - cspeed;
        }
        this.vsp += aced * Math.sin(angle);
        this.hsp += aced * Math.cos(angle);

    }
    speed = Math.sqrt(Math.pow(this.vsp,2) + Math.pow(this.hsp,2));
    if (speed > 0) {
        friced = (speed - friction);
        if (friced < 0) friced = 0;
        factor = friced / speed;
        this.vsp *= factor;
        this.hsp *= factor;
    }


    this.x += this.hsp;
    this.y += this.vsp;

    cam.springTo(this.x, this.y);

};