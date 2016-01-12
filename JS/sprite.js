function sprite (options) {

    var that = {},
        numberOfFrames = options.numberOfFrames || 1,
        xoff = options.xoff || 0,
        yoff = options.yoff || 0;

        that.width = options.width;
        that.height = options.height;
        that.awidth = options.awidth || options.width;
        that.aheight = options.aheight || options.height;
        that.image = options.image;
        that.vert = options.vert || false;

        that.render = function (c,x,y,frame,xscale,yscale) {
            while (frame < 0){
                frame += numberOfFrames;
            }

            var f  = Math.floor(frame)%numberOfFrames;
            xscale = xscale || 1;
            yscale = yscale || 1;

            c.save();
            c.translate(x,y);
            c.scale(xscale,yscale);

            c.drawImage(
                that.image,
                f * that.awidth * (!that.vert),
                f * that.aheight * (that.vert),
                that.awidth,
                that.aheight,
                -xoff,
                -yoff,
                that.width,
                that.height);
            c.restore();
        };

    return that;
}