

////////////////////////////////////////////////////////////////////////////////
// Player
////////////////////////////////////////////////////////////////////////////////

function heartbullet(x, y, width, height) {
    instance.call(this, x, y, width, height);
    this.hsp = 0;
    this.vsp = 0;
    /*this.sprite = sprite({
        width: 90,
        height: 108,
        awidth: 900,
        aheight: 1080,
        image: image,
        numberframes: 8,
        xoff: 48,
        yoff: 60,
        vert: true
    });*/
};

heartbullet.prototype.draw = function (c) {
    /*c.beginPath();
    c.strokeStyle = "yellow";
    c.rect(this.x,this.y,this.width,this.height);
    c.stroke();

    this.sprite.render(c,this.x+this.width/2,this.y+this.height/2,this.frame,this.xscale);*/
    c.beginPath();
    c.arc(this.x, this.y, this.width/2, 0, 2 * Math.PI);
    c.fill();
};

heartbullet.prototype.update = function (b, keys) {
    this.y += this.vsp;
    this.x += this.hsp;
};