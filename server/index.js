
var app = require('express.io')()

app.http().io()

   // XXX: hard-coded localhost..
app.io.set('origins', '*127.0.0.1*:*');

app.io.route('ready', function(req) {
   req.io.emit('ping', 'ready received');
});

var testSheet = 
  [ ["row1", "row2", "row3"]
  , ["wow1", "wow2", "wow3"]
  ]

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
    req.io.emit('rewrite_sheet', testSheet);
  }
});

module.exports = app;
