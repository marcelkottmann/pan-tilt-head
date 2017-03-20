var http = require('http');
var url = require('url');
var director = require('director');
var server = require('http-server');
var wpi = require('wiring-pi');
var fs = require('fs')

var left_pin = 17;
var right_pin = 27;
var up_pin = 23;
var down_pin = 24;

var pan_timeout_id = 0;
var tilt_timeout_id = 0;

function setup() {
    wpi.wiringPiSetupGpio();

    wpi.pinMode(left_pin, wpi.OUTPUT);
    wpi.pinMode(right_pin, wpi.OUTPUT);
    wpi.pinMode(up_pin, wpi.OUTPUT);
    wpi.pinMode(down_pin, wpi.OUTPUT);

    wpi.digitalWrite(left_pin, 0);
    wpi.digitalWrite(right_pin, 0);
    wpi.digitalWrite(up_pin, 0);
    wpi.digitalWrite(down_pin, 0);
    console.log("setup completed.");
}


function drive(pan, tilt) {
    if (pan > 0) {
        wpi.digitalWrite(right_pin, 0);
        wpi.digitalWrite(left_pin, 1);
    } else if (pan < 0) {
        wpi.digitalWrite(left_pin, 0);
        wpi.digitalWrite(right_pin, 1);
    }

    if (tilt > 0) {
        wpi.digitalWrite(down_pin, 0);
        wpi.digitalWrite(up_pin, 1);
    } else if (tilt < 0) {
        wpi.digitalWrite(up_pin, 0);
        wpi.digitalWrite(down_pin, 1);
    }

    if (tilt != 0) {
        clearTimeout(tilt_timeout_id);
        tilt_timeout_id = setTimeout(function () {
            wpi.digitalWrite(up_pin, 0);
            wpi.digitalWrite(down_pin, 0);
            console.log("tilt timeout triggered to stop motion.");
        }, 1000);
    }

    if (pan != 0) {
        clearTimeout(pan_timeout_id);
        pan_timeout_id = setTimeout(function () {
            wpi.digitalWrite(left_pin, 0);
            wpi.digitalWrite(right_pin, 0);
            console.log("pan timeout triggered to stop motion.");
        }, 1000);
    }

    console.log("setting pan to " + pan + " and tilt to " + tilt);
}

var port = 8081;
var router = new director.http.Router();
router.get(/drive/, function () {
    this.res.writeHead(200, { 'Content-Type': 'text/javascript' })
    var parsedUrl = url.parse(this.req.url, true);
    var control = {
        path: null,
        pan: 0,
        tilt: 0
    };
    control.path = parsedUrl.pathname;
    if (typeof parsedUrl.query.pan !== 'undefined') {
        control.pan = parseFloat(parsedUrl.query.pan);
    }

    if (typeof parsedUrl.query.tilt !== 'undefined') {
        control.tilt = parseFloat(parsedUrl.query.tilt);
    }
    this.res.end(JSON.stringify(control));

    drive(control.pan, control.tilt);
});


router.get(/keyboard.js/, function () {

    var filePath = 'keyboard.js';
    var stat = fs.statSync(filePath);

    this.res.writeHead(200, {
        'Content-Type': 'text/javascript',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(this.res);
});

var options = {
    showDir: 'false'
};
options.root = ".";
options.before = [
    function (req, res) {
        var found = router.dispatch(req, res);
        if (!found) {
            res.emit('next');
        }
    }
];


setup();
server.createServer(options).listen(port);
console.log("Camera server created at http://localhost:%s", port);
