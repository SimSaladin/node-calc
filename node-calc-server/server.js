var Converter = require('csvtojson').core.Converter;
var spawn     = require('child_process').spawn;
var fs        = require('fs');
var express   = require('express.io');

var app = express().http().io();

fs.mkdir('sheets');

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://node-calc.herokuapp.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  if (! req.method) {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Range, Content-Disposition, Content-Description');
  }
  next();
});
app.use(express.bodyParser());

app.io.set('origins', '*:*');

function dd(argument) {
  app.io.sockets.emit('notification', "DEBUG: " + argument);
}

/*
 * Sheet
 */

var sheets = {};

function emitSheetListing() {
 app.io.sockets.emit("sheet:sheet_listing", sheets);
}

function openCSV(sheetName, callback) {
  sheets[sheetName] = {};

  fs.readFile('sheets/' + sheetName, { encoding: 'utf-8' }, function(err, data) {
    sheets[sheetName].csv = data;
    callback ? callback() : true;
  });
}

// read sheets
fs.readdir('sheets', function(err, files) {
  for (index in files) {
    var fileName = files[index];
    openCSV(fileName, emitSheetListing);
  }
});

/*
 * Users, sheets and rooms
 */

function queryGetUsers(ignore) {
  var users = [];
  for (var socketId in app.io.sockets.sockets) {
    if (socketId === ignore) continue;
    app.io.sockets.sockets[socketId].get('props', function(err, props) {
      users.push(props);
    })
  };
  return users;
}

function broadcastUsers(users){
  app.io.sockets.emit('users:all_users', users)
}

function checkExists(sheetName) {
  if (!sheets[sheetName]) return false;
  else return true;
}

app.post('/upload', function(req, res) {

  var file = req.files.file;
  var newPath = "sheets/" + file.name; // XXX: escape!

  fs.readFile(file.path, function (err, data) {

    if (err) {
      res.send("upload failed");
      return;
    }
    fs.writeFile(newPath, data, function (err) {
      openCSV(file.name, emitSheetListing);
      res.send("upload complete");
    });
  });
});

app.post('/save/:fileName', function(req, res) {
  var fileName = req.param('fileName');
  var csv = req.body.csv;
  if (! checkExists(fileName)) {
    return;
  }
  fs.writeFile('sheets/' + fileName, csv, function(){
    openCSV(fileName);
    res.send('success');
  });
})

app.get('/calculate/:fileName', function(req, res) {

  var fileName = req.param('fileName');

  if ( ! checkExists(fileName) ) {
    app.io.sockets.emit('notification', 'sheet does not exist');
    return;
  }

  var prc = spawn('./hcalc', ['sheets/' + fileName]);
  var content = "";
  var err = "";

  prc.stdout.setEncoding('utf8');

  prc.stdout.on('data', function(data) {
    content += data.toString();
  });
  prc.stderr.on('data', function(err) {
    err = err;
  });
  prc.on('close', function(code) {
    res.attachment(fileName + '.txt');
    res.send(content);
    app.io.sockets.emit('notification', 'hcalc exited with `' + code + '`. errors: ' + err);
  });
});

app.io.route('sheet', {
   open: function(req) {
      var sheetName = req.data;
      var sheet = sheets[sheetName];
      if (! sheet) {
        req.io.emit('notification', 'Could not open (no such sheet: ' + sheetName + ')');
      } else {
        req.io.join(sheetName);
        req.io.emit('joined', sheets[sheetName]);
      }
   },
});

app.io.route('changevalue', function(req) {
  req.io.broadcast('changevalue', req.data);
});

app.io.route('position', function(req) {
  req.io.socket.get('props', function(err, props) {
    if (err || ! props) {
      return;
    }
    props.pos = req.data;
    req.io.socket.set('props', props);
    req.io.broadcast('changeuser', props);
  });
});

/*
 * Connection
 */

app.io.route('joined', function(req) {
  var id = Math.random().toString(36).substr(2, 5);
  var props = { name : id };
  req.io.socket.set('props', props);
  req.io.emit('me', props);
  req.io.emit('sheet:sheet_listing', sheets);
  broadcastUsers( queryGetUsers(id) );
});

app.io.sockets.on('connection', function(socket) {
  socket.on('disconnect', function() {
    queryGetUsers(socket.id);
  });
});

var port = Number(process.env.PORT || 3000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
