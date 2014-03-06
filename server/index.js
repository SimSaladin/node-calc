
var Converter = require('csvtojson').core.Converter;

var fs = require('fs');
var express = require('express.io');
var app = express().http().io();

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.use(allowCrossDomain);
app.use(express.bodyParser());

   // XXX: hard-coded localhost..
app.io.set('origins', '*127.0.0.1*:*');

/* Internal vars
 */

function dd(argument) {
  app.io.sockets.emit('debug', argument);
}

var testSheet = 
  [ ["row1", "row2", "row3"]
  , ["wow1", "wow2", "wow3"]
  ];

var sheets = {};


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

/*
 * Sheet
 */

function emitSheetListing() {
 app.io.sockets.emit("sheet:sheet_listing", sheets);
}

function openCSV(sheetName) {
  fs.readFile('sheets/' + sheetName, {encoding: 'utf-8'}, function(err, data) {
    sheets[sheetName].csv = data;
  });
}

// read sheets
fs.readdir('sheets', function(err, files) {
  for (index in files) {
    var fileName = files[index];
    sheets[fileName] = { content: undefined };
    openCSV(fileName);
  }
  emitSheetListing();
});


// Routes //

app.post('/upload', function(req, res) {
  var fileName = req.file.name;
  var newPath  = __dirname + "/sheets/" + fileName; // XXX: escape!
  fs.readFile(req.files.file.path, function (err, data) {
    fs.writeFile(newPath, data, function (err) {
      sheets.push(name);
      emitSheetListing();
    });
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

  get_csv: function(req) {
    req.io.emit('notification', 'NYI');
  },

  fetch: function(req) {
    req.io.emit('sheet:rewrite_sheet', testSheet);
  }
});

app.io.route('changevalue', function(req) {
  req.io.emit('notification', 'change noted');
  req.io.broadcast('changevalue', req.data);
});

module.exports = app;
app.listen(3000);
