'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const requireRole = require('../middlewares/require-role');
const Restaman = require('restaman');

module.exports = function (Material, app) {

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

    app.post('/api/material/profile', requireRole('authenticated'), function (req, res, next) {
        User.findById(req.user.id)
            .then(user => {
                let userData = Object.assign({}, req.body);
                delete userData.password;
                delete userData._id;
                delete userData.roles;

                Object.assign(user, userData);
                if (req.body.password) {
                    userData.password = req.body.password;
                }
                return user.save();
            })
            .then(doc => res.send(doc))
            .catch(next);
    });


    const restaman = new Restaman();
    restaman.addModel('User')
        .middleware(['create','update', 'delete', 'find', 'findOne'], requireRole('admin'))
        .hide(['hashed_password', 'salt']);

    app.use('/api/material', restaman.router());
};
