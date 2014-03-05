
var express = require('express.io');
var app = express().http().io();

   // XXX: hard-coded localhost..
app.io.set('origins', '*127.0.0.1*:*');

/* Internal vars
 */

var testSheet = 
  [ ["row1", "row2", "row3"]
  , ["wow1", "wow2", "wow3"]
  ]

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

app.io.route('sheet', {
   open: function(req) {
      req.session.name = req.data
      req.session.save(function(){
         req.io.emit('notification', "asd");
      });
   },

  get_csv: function(req) {
    req.io.emit('notification', 'NYI');
  },

  fetch: function(req) {
    req.io.emit('sheet:rewrite_sheet', testSheet);
  }
});

module.exports = app;
