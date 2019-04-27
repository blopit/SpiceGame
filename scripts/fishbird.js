

function solve(a, b, c) {
    var result = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    var result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    return [result, result2];
}

var maxammo = 30.0;
function fishbird(x, y) {
    instance.call(this, x, y);
    this.width = 32;
    this.height = 32;
    this.rotation = 0;

    this.vsp = 0;
    this.hsp = 8;

    this.ammo = -1;
    this.released = true;
    this.pressing = false;

    this.releasedBefore = 0;
    this.releasedAfter = 0;

    this.lowest = 0;
    this.highest = 0;

    this.w = 0;
    this.sp = 0;

    this.boost = 0;
    this.maxboost = 150;
    this.boostmult = 2.0;

    this.justdove = false;

    this.trail = new Array()
    this.trail.push = function (){
        if (this.length >= 120) {
            this.shift();
        }
        return Array.prototype.push.apply(this,arguments);
    }
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
};

fishbird.prototype.boostLaunch = function () {
    this.boost = 0.01 * Math.pow(this.vsp, 3);//this.maxboost;
    this.vsp *= 1.2;
    this.hsp *= 1.2;
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
    var threshold = 8;
    this.ammo -= 1;
    if (this.ammo < 0) this.ammo = 0;

    this.boost -= 1;
    if (this.boost < 0) this.boost = 0;

    this.releasedBefore -= 1;
    if (this.releasedBefore < 0) this.releasedBefore = 0;

    this.releasedAfter -= 1;
    if (this.releasedAfter < 0) this.releasedAfter = 0;

    var mult = 1.0;
    if (this.boost > 0) mult = this.boostmult;

    var gravvar = 0.5;
    if (this.y < 0) {
        gravity = gravvar;
    } else {
        gravity = -gravvar;
    }

    this.vsp += gravity;

    var targspeed = 8 * mult;
    var tacc = 1;
    if (this.hsp < targspeed - tacc) {
        this.hsp += tacc;
    } else if (this.hsp < targspeed) {
        this.hsp = targspeed
    }

    var friction = 0;
    var afric = 0.05;
    var wfric = 0.15;


    if (keys[4]) {
        this.pressing = true;
    } else if (this.pressing == true) {
        //released
        this.pressing = false;

        var goAhead = false;
        if (this.vsp > 10) {
            if (this.y < 0){
                this.releasedBefore = threshold;
            }
            if (this.releasedAfter > 0) {
                this.releasedAfter = 0;
                this.boostLaunch();
            }
        }
    }

    if (this.y < 0) {

        if (this.ammo > 20) {
            this.frame = 1;
        } else {
            this.frame = 0;
        }

        this.justdove = false;
        //AIR
        this.rotation = this.rotateTo(0,10, 0.5);
        friction = afric;
        airmeter = maxairmeter;
        if (this.y < -64) {
            watermeter -= 1;
        }

        if (!keys[4]) {
            this.released = true;
        } else if (this.released == true) {
            this.released = false;

            this.vsp = -10 * (1 - (this.ammo / maxammo)) * mult;
            this.ammo = maxammo;
        }

        var a = (0.5) * (gravvar-friction);
        var b = this.vsp;
        var c = this.y;
        stepstowater = solve(a, b, c)[0];

    } else {
        this.frame = 0;
        this.rotation = this.rotateTo(Math.atan2(-this.vsp, this.hsp) * 180.0/3.14159, 10, 0.5);

        if (!keys[4]) {
            this.released = true;
        } else if (this.released == true) {
            this.released = false;
        }

        if (this.justdove == false) {
            this.justdove = true;
            this.releasedAfter = threshold;
            if (this.releasedBefore > 0) {
                this.releasedBefore = 0;
                this.boostLaunch();
            }
        }
        //WATER
        friction = wfric;
        watermeter = maxwatermeter;
        if (this.y > 64) {
            airmeter -= 1;
        }



        var max = 4 * this.boostmult;
        var acc = 1;
        if (keys[4]) {
            this.frame = 2;
            if (this.vsp < max - acc) {
                this.vsp += acc;
            } else if (this.vsp < max){
                this.vsp = max;
            }

        }

        var a = (0.5) * (-gravvar+friction);
        var b = this.vsp;
        var c = this.y;
        stepstoair = solve(a, b, c)[1];
    }

    this.vsp = fric(this.vsp, friction);
    this.hsp = fric(this.hsp, friction);

    this.x += this.hsp;
    this.y += this.vsp;

    if (this.vsp < 0) {
        this.w -= 5;
    } else {
        this.w += 5
    }
    if (this.w > 200) {
        this.w = 200;
    }
    if (this.w < -200) {
        this.w = -200;
    }

    cam.spring = 0.15 + 0.35 * Math.abs(this.w)/200;

    cam.springTo(this.x + 500, this.y);


    if (this.y < this.highest) {
        this.highest = this.y;
    } else if (this.y > this.lowest) {
        this.lowest = this.y;
    }


};