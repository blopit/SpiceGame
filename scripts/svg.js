//SVG PARSING DO NOT CHANGE

var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}

var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig

function extractPoints(data) {
    var listx = [];
    var listy = [];

    var lx = Math.floor(data[0][1]);
    var ly = Math.floor(data[0][2]);

    listx.push(Math.floor(data[0][1]));
    listy.push(Math.floor(data[0][2]));

    for (var i = 1; i < data.length-1; i++){

        if (data[i][0] === "l"){
            listx.push(lx + Math.floor(data[i][1]));
            listy.push(ly + Math.floor(data[i][2]));
            lx += Math.floor(data[i][1]);
            ly += Math.floor(data[i][2]);
        }else if (data[i][0] === "L"){
            listx.push(Math.floor(data[i][1]));
            listy.push(Math.floor(data[i][2]));
        }

    }

    return [listx, listy];
}

function parse(path) {
    var data = []
    path.replace(segment, function(_, command, args){
        var type = command.toLowerCase()
        args = parseValues(args)

        // overloaded moveTo
        if (type == 'm' && args.length > 2) {
            data.push([command].concat(args.splice(0, 2)))
            type = 'l'
            command = command == 'm' ? 'l' : 'L'
        }

        while (true) {
            if (args.length == length[type]) {
                args.unshift(command)
                return data.push(args)
            }
            if (args.length < length[type]) throw new Error('malformed path data')
            data.push([command].concat(args.splice(0, length[type])))
        }
    })
    return data
}

function parseValues(args){
    args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig)
    return args ? args.map(Number) : []
}