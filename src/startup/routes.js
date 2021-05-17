const express = require('express'),
      userRoutes = require('../routes/users.js'),
      authRoutes = require('../routes/auth.js'),
      charterRoutes = require('../routes/charters.js'),
      tagRoutes = require('../routes/tags.js'),
      error = require('../middleware/error.js');

module.exports = function(app) {

      app.use(express.json());
      app.use(express.urlencoded({extended: true}));
      app.use(express.static('public'));

      let allowedOrigin = process.env.ORIGIN_PROD;
      if (process.env.NODE_ENV == 'development') { allowedOrigin = process.env.ORIGIN_DEV;}
      if (process.env.NODE_ENV == 'test') {allowedOrigin = process.env.ORIGIN_TEST;}

      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS') ;
        res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Content-Length, Accept, X-Auth-Token, ETag, Date, Connection");
        res.header('Access-Control-Expose-Headers', "Origin, X-Requested-With, Content-Type, Content-Length, Accept, X-Auth-Token, ETag, Date, Connection");
        next();
      });
    app.options('*', function (req,res) { res.sendStatus(200); });

      app.use('/user', userRoutes);
      app.use('/auth', authRoutes);
      app.use('/charter', charterRoutes);
      app.use('/tag', tagRoutes);

      app.use(error);

}
