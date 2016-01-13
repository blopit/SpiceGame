

////////////////////////////////////////////////////////////////////////////////
// Player
////////////////////////////////////////////////////////////////////////////////

function player(x, y, width, height) {
    instance.call(this, x, y, width, height);
    this.jump = 13;             //jump velocity
    this.climb = 2;             //max pixel slope climb
    this.fric = 0.65;           //ground fric
    this.afric = 0.3;           //airfric
    this.acc = 0.8;             //acceleration
    this.stopjumpspeed = 2.5;   //speed at which to accelerate to stop jumping
    this.maxhsp = 8;            //max horizontal speed
    this.maxspeed = 40;         //max any speed

    this.xscale = 1;            //horizontal scale

    var image = new Image();
    image.src = "http://i.imgur.com/26loGzM.png";

    this.sprite = sprite({
        width: 90*1.25,
        height: 108*1.25,
        awidth: 900,
        aheight: 1080,
        image: image,
        numberframes: 8,
        xoff: 48*1.25,
        yoff: 60*1.25,
        vert: true
    });
    this.ahsp = 0;
    this.avsp = 0;
}

player.prototype.draw = function (c) {
    c.beginPath();
    c.strokeStyle = "yellow";
    c.rect(this.x,this.y,this.width,this.height);
    c.stroke();

    this.sprite.render(c,this.x+this.width/2,this.y+this.height/2,this.frame,this.xscale);
}

player.prototype.update = function (b, keys) {

    var fr = 0;
    this.ahsp = 0;
    this.avsp = 0;

    //apply gravity
    this.vsp += grav;

    var grounded = colPlace(this,b,1,2,-2,0);
    if (!grounded){
        fr = this.afric;
    }else{
        fr = this.fric;


        if (keys[0] && this.vsp>=0){
            this.vsp -= this.jump;
        }
    }

    if (!keys[0] && this.vsp<0){
        this.vsp -= this.stopjumpspeed*this.vsp/this.jump;
    }

    if (keys[2] && !keys[3]){
        if (this.hsp>-this.maxhsp) {
            this.hsp-=this.acc;
            this.xscale = -1;
        }
    }else if (keys[3] && !keys[2]){
        if (this.hsp<this.maxhsp) {
            this.hsp+=this.acc;
            this.xscale = 1;
        }
    }else{
        this.hsp = fric(this.hsp,fr);
    }

    if (this.hsp === 0){
        this.frame = 5;
    }else{
        this.frame += 0.25 * this.hsp/this.maxhsp * this.xscale;
    }
    if (!colPlace(this,b,1,4,-2,0) && !grounded){
        if (this.vsp < 0)
            this.frame = 6;
        else
            this.frame = 0;
    }

    if (Math.abs(this.hsp) > this.maxspeed) {
        this.hsp = this.maxspeed * Math.sign(this.hsp)
    }
    if (Math.abs(this.vsp) > this.maxspeed) {
        this.vsp = this.maxspeed * Math.sign(this.vsp)
    }
    slopeMove(this,b,this.climb);

    var camdx = this.x + 64*this.xscale;
    var camdy = this.y;
    var dist = distPoints(camdx,camdy,camx,camy);
    var dir = anglePoints(camx,camy,camdx,camdy);
    camx += dist*Math.cos(dir)*cam_spring;
    camy += dist*Math.sin(dir)*cam_spring;



}