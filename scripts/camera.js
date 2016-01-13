//camera
function camera(spring) {
    this.cx = 0;
    this.cy = 0;
    this.spring = spring;

    this.x = 0;
    this.y = 0;
    this.width = screen_width;
    this.height = screen_height;

    this.bound = null;
    this.intensity = 0;
    this.boundaries = [];

}
camera.prototype.update = function () {
    this.x = this.cx-this.width/2;
    this.y = this.cy-this.height/2;

    if (this.bound!=null){
        if (colRxR(hero,this.bound))
            return;
    }
    for (var i = 0; i < this.boundaries.length; i++){
        if (colRxR(hero,this.boundaries[i])){
            this.bound = this.boundaries[i];
            return;
        }
    }
    this.bound = null;

}
camera.prototype.snapToRect = function (rect1,dest_x,dest_y) {
    var dx = dest_x;
    var dy = dest_y;

    if (rect1.width > this.width){
        if (dx-this.width/2 < rect1.x)
            dx = rect1.x+this.width/2;
        else if (dx+this.width/2 > rect1.x+rect1.width)
            dx = rect1.x+rect1.width-this.width/2;
    }

    if (rect1.height > this.height){
        if (dy-this.height/2 < rect1.y)
            dy = rect1.y+this.height/2;
        else if (dy+this.height/2 > rect1.y+rect1.height)
            dy = rect1.y+rect1.height-this.height/2;
    }

    return [dx,dy];

}
camera.prototype.springTo = function (dest_x,dest_y,bnd) {
    var bnd = bnd || true;

    var dest = [dest_x,dest_y];
    if (this.bound!=null && bnd){
        if (this.bound.intensity === 2){
            dest = this.snapToRect(this.bound,dest_x,dest_y);
        }else if (this.bound.intensity === 1){
            var d = 128;
            var rectx = {x:this.bound.x+d, y:this.bound.y+d, width:this.bound.width-d*2, height:this.bound.height-d*2};
            if (colRxR(hero,rectx))
                dest = this.snapToRect(this.bound,dest_x,dest_y);
        }
    }
    dest_x = dest[0];
    dest_y = dest[1];

    var dist = distPoints(this.cx,this.cy,dest_x,dest_y);
    var dir = anglePoints(this.cx,this.cy,dest_x,dest_y);
    this.cx += dist*Math.cos(dir)*this.spring;
    this.cy += dist*Math.sin(dir)*this.spring;

    this.update();
}