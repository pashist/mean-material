'use strict';

var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var requireRole = require('../middlewares/require-role');
var RestMean = require('../middlewares/restmean');
    
module.exports = function (Material, app) {

    app.post('/api/material/user/:id', requireRole('admin'), function (req, res, next) {
        UserModel.findById(req.params.id)
            .then(function (user) {
                var userData = Object.assign({}, req.body);
                delete userData.password;
                delete userData._id;
                Object.assign(user, userData);
                if (req.body.password) {
                    user.password = req.body.password;
                }
                return user.save();
            })
            .then(function (user) {
                res.send(user)
            })
            .catch(function(err){
                res.status(400);
                res.send(err);
            });
    });

    app.post('/api/material/profile', requireRole('authenticated'), function (req, res, next) {
        UserModel.findById(req.user.id)
            .then(function (user) {

                var userData = Object.assign({}, req.body);
                delete userData.password;
                delete userData._id;
                delete userData.roles;

                Object.assign(user, userData);
                if (req.body.password) {
                    user.password = req.body.password;
                }
                return user.save();
            })
            .then(function (user) {
                res.send(user)
            })
            .catch(function(err){
                res.status(400);
                res.send(err);
            });
    });

    app.post('/api/material/user', requireRole('admin'), function (req, res, next) {
        UserModel.create(req.body)
            .then(function (user) {
                res.send(user)
            })
            .catch(function(err){
                res.status(400);
                res.send(err);
            });
    });

    app.delete('/api/material/user/:id', requireRole('admin'), function (req, res, next) {
        UserModel.findById(req.params.id).remove()
            .then(function (user) {
                res.send(user)
            })
            .catch(function(err){
                res.status(400);
                res.send(err);
            });
    });

    app.get('/api/material/settings', requireRole('authenticated'), function (req, res, next) {
        Material.settings(function (err, settings) {
            if (err) {
                res.status(400);
                res.send(new Error("Unable to retrieve settings"))
            } else {
                var data = settings ? settings.settings : {};
                if (req.query.name) {
                    res.send({value: data ? data.name : req.query.default})
                } else {
                    res.status(400);
                    res.send(new Error("Not specified setting name"))
                }
            }
        });
    });

    app.post('/api/material/settings', requireRole('admin'), function (req, res, next) {

                if (typeof req.body === 'object') {
                    var data = Object.assign({}, req.body);
                    Material.settings(data, function (err, settings) {
                        if (err) {
                            res.status(400);
                            res.send({message: "Unable to save settings"})
                        } else {
                            res.send(data)
                        }
                    });
                } else {
                    res.status(400);
                    res.send({message: "Required settings object"});
                }

    });

    app.get('/api/material/example/render', function (req, res, next) {
        Material.render('index', {
            package: 'material'
        }, function (err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });

    RestMean.addModel('User').middleware(['create','update', 'delete', 'find'], requireRole('admin'));
    app.use('/api', RestMean.router());
};
