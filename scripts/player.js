

////////////////////////////////////////////////////////////////////////////////
// Player
////////////////////////////////////////////////////////////////////////////////

function player(x, y, width, height) {
    instance.call(this, x, y, width, height);
    this.jump = 12;             //jump velocity
    this.climb = 2;             //max pixel slope climb
    this.fric = 0.4;           //ground fric
    this.afric = 0.3;           //airfric
    this.acc = 0.5;             //acceleration
    this.stopjumpspeed = 2.5;   //speed at which to accelerate to stop jumping
    this.maxhsp = 6;            //max horizontal speed
    this.maxspeed = 20;         //max any speed

    this.xscale = 1;            //horizontal scale

    var image = new Image();
    image.src = "http://i.imgur.com/26loGzM.png";

    this.sprite = sprite({
        width: 90,
        height: 108,
        awidth: 900,
        aheight: 1080,
        image: image,
        numberframes: 8,
        xoff: 48,
        yoff: 60,
        vert: true
    });
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

    //apply gravity
    this.vsp += grav;

    //see if on ground;
    var grounded = colPlace(this,b,1,2,-2,0);

    if (!grounded){
        //in the air so use air friction
        fr = this.afric;
    }else{
        ///on ground so use ground friction
        fr = this.fric;

        //on ground and up key is pressed
        if (keys[0] && this.vsp>=0){
            //set vertical speed to jump speed
            this.vsp -= this.jump;
        }
    }

    //in the air and up key no longer pressed
    if (!keys[0] && this.vsp<0){
        //accelerate downwards
        this.vsp -= this.stopjumpspeed*this.vsp/this.jump;
    }

    //left key
    if (keys[2] && !keys[3]){
        if (this.hsp>-this.maxhsp) { //dont want to over accelerate
            this.hsp-=this.acc;
            this.xscale = -1; //flip sprite so facing left
        }
    }else if (keys[3] && !keys[2]){ //right key
        if (this.hsp<this.maxhsp) {
            this.hsp+=this.acc;
            this.xscale = 1;
        }
    }else{
        //no keys are pressed apply friction
        this.hsp = fric(this.hsp,fr);
    }

    //not moving
    if (this.hsp === 0){
        this.frame = 5;
    }else{
        //moving
        this.frame += 0.25 * this.hsp/this.maxhsp * this.xscale;
    }

    //check if actually 'in air'
    if (!colPlace(this,b,1,4,-2,0) && !grounded){
        if (this.vsp < 0)
            this.frame = 6;
        else
            this.frame = 0;
    }

    //limit speeds
    if (Math.abs(this.hsp) > this.maxspeed) {
        this.hsp = this.maxspeed * Math.sign(this.hsp)
    }
    if (Math.abs(this.vsp) > this.maxspeed) {
        this.vsp = this.maxspeed * Math.sign(this.vsp)
    }

    //apply speeds
    slopeMove(this,b,this.climb);



    //set Camera
    var camdx = this.x + 64*this.xscale;
    var camdy = this.y;
    cam.springTo(camdx,camdy);



}