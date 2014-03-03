app = require('express.io')()
app.http().io()

app.io.route('sheet', {
   get: function(req) {
      console.log("asd");
   }
});

module.exports = app;
