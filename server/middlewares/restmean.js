'use strict';

/**
 * Created by Pavel on 12.03.2016.
 *
 * Create and handle REST routes for given mongoose model;
 *
 * List of routes:
 *
 *  GET     /api/Model          get all models optional filter by query params
 *  POST    /api/Model          create model
 *  PUT     /api/Model          create model
 *
 *  GET     /api/Model/:id      get model by id
 *  POST    /api/Model/:id      update an existing model by id
 *  DELETE  /api/Model/:id      delete an existing model by id
 *
 *  GET     /api/Model/count    get number of instances of the model optionally matched by filter
 *
 */

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

mongoose.Promise = global.Promise;


var ModelWrapper = function (model) {

    this._model = model.modelName ? model : mongoose.model(model);
    this.hooks = {
        pre: {},
        post: {}
    };

    this.middlewares = {};
    this.methods = [];

    this.applyHooks = function (type, action, req, res, doc) {
        var hooksToApply = [];

        if (this.hooks[type][action]) {
            hooksToApply = hooksToApply.concat(this.hooks[type][action]);
        }
        if (this.hooks[type].all) {
            hooksToApply = hooksToApply.concat(this.hooks[type].all);
        }
        hooksToApply.forEach(function (hook) {
            hook(req, res, doc);
        })
    };

    this.addHook = function (type, action, callback) {
        if (!this.hooks[type][action]) {
            this.hooks[type][action] = [];
        }
        if (action instanceof Array) {
            action.forEach(val => this.addHook(type, val, callback))
        } else {
            this.hooks[type][action].push(callback);
        }
    };

    this.setMiddleware = function (action, callback) {
        if (action instanceof Array) {
            action.forEach(val => this.setMiddleware(val, callback))
        } else {
            this.middlewares[action] = callback
        }
    };

    this.getMiddleware = function (action) {
        return this.middlewares[action] || this.middlewares['all'] || function (req, res, next) {
                next()
            };
    };

    this.addRemoteMethod = function (method) {
        method = method instanceof Object ? method : {name: method};
        Object.assign({exposeName: method.name}, method);
        if (this.model()[method.name] instanceof Function) {
            this.methods.push(method);
        } else {
            throw new Error(`Method ${method.name} is not defined in model ${this.model().modelName}`)
        }
    };

    this.getRemoteMethods = function () {
        return this.methods;
    };

    /**
     * Just model.foundById() method wrapper,
     * which throw ModelNotFound error in case of any search error,
     * even model not found by given id
     * @param id
     * @returns {Promise<T>}
     */
    this.findById = function (id) {
        return this.model().findById(id).then(function (found) {
            if (!found) {
                throw new Error();
            }
            return found;
        }).catch(function () {
            var error = new Error();
            error.message = 'Not Found';
            error.name = 'ModelNotFound';
            error.status = 404;
            throw error;
        })
    };

    function parseQueryOptions(query) {
        var options = {};
        var formatters = {
            sort: function (value) {
                return String(value)
            },
            skip: function (value, q) {
                return Number(value || q.start)
            },
            limit: function (value) {
                return Number(value)
            }
        };
        _.forEach(formatters, function (val, key) {
            if (!_.isUndefined(query[key])) {
                options[key] = val(query[key], query);
            }
        });
        return options;
    }

    function parseQueryFilter(query) { //todo checks
        let filter = query.filter ? JSON.parse(query.filter) : {};
        return filter;
    }

    function parseQueryPopulate(query) { //todo checks
        let populate;
        if (query.populate) {
            try {
                populate = JSON.parse(query.populate);
            } catch (e) {
                populate = query.populate;
            }
        }
        return populate;
    }

    function parseQueryProjection(query) { //todo checks
        let projection = query.projection || null;
        if (projection) {
            try {
                projection = JSON.parse(projection);
            } catch (e) {

            }
        }
        return projection;
    }

    this.parseQuery = function (query) {
        return {
            filter: parseQueryFilter(query),
            populate: parseQueryPopulate(query),
            options: parseQueryOptions(query),
            projection: parseQueryProjection(query)
        }
    }
};

ModelWrapper.prototype.pre = function (action, callback) {
    this.addHook('pre', action, callback);
    return this;
};

ModelWrapper.prototype.post = function (action, callback) {
    this.addHook('post', action, callback);
    return this;
};
ModelWrapper.prototype.middleware = function (action, callback) {
    if (arguments.length == 2) {
        this.setMiddleware(action, callback);
        return this;
    } else {
        return this.getMiddleware(action);
    }
};
ModelWrapper.prototype.method = function (method) {
    this.addRemoteMethod(method);
    return this;
};

ModelWrapper.prototype.create = function (req, res, next) {
    var self = this;
    self.applyHooks('pre', 'create', req, res);
    self.model().create(req.body)
        .then(function (created) {
            self.applyHooks('post', 'create', req, res);
            res.send(created)
        })
        .catch(function (err) {
            next(err)
        });
};

ModelWrapper.prototype.get = function (req, res, next) {
    var self = this;
    self.applyHooks('pre', 'get', req, res);
    self.findById(req.params.id)
        .then(function (item) {
            self.applyHooks('post', 'get', req, res, item);
            res.send(item)
        })
        .catch(function (err) {
            next(err)
        })
};

ModelWrapper.prototype.find = function (req, res, next) {

    let query = this.parseQuery(req.query);
    this.applyHooks('pre', 'find', req, res, query);

    let promise = this.model().find(query.filter, query.projection, query.options);
    if (query.populate) {
        promise.populate(query.populate);
    }

    promise
        .then(items => {
            this.applyHooks('post', 'find', req, res, items);
            res.send(items)
        })
        .catch(err => next(err));
};

ModelWrapper.prototype.update = function (req, res, next) {
    var self = this;
    self.findById(req.params.id)
        .then(function (found) {
            self.applyHooks('pre', 'update', req, res, found);
            return _.extend(found, req.body).save()
        })
        .then(function (item) {
            self.applyHooks('post', 'update', req, res, item);
            res.send(item)
        })
        .catch(function (err) {
            next(err)
        })
};

ModelWrapper.prototype.delete = function (req, res, next) {
    var self = this;
    self.findById(req.params.id)
        .then(function (found) {
            self.applyHooks('pre', 'delete', req, res, found);
            return found.remove()
        })
        .then(function (result) {
            self.applyHooks('post', 'delete', req, res, result);
            res.send(result)
        })
        .catch(function (err) {
            next(err)
        })
};

ModelWrapper.prototype.count = function (req, res, next) {
    let query = this.parseQuery(req.query);
    this.applyHooks('pre', 'count', req, res, query);
    this.model().count(query.filter)
        .then((count) => {
            this.applyHooks('post', 'count', req, res, count);
            res.send({count: count})
        })
        .catch((err) => {
            next(err)
        })
};

ModelWrapper.prototype.callMethod = function (method, req, res, next) {
    this.applyHooks('pre', 'method', req, res, method);
    try {
        let result = this.model()[method].apply(null, req.body);
        this.applyHooks('post', 'method', req, res, method, result);
        res.send(result);
    } catch (err) {
        next(err)
    }
};

ModelWrapper.prototype.model = function () {
    return this._model;
};

var RestMean = function () {

    var models = {};

    /**
     * create ModelWrapper instance
     * for given model name or mongoose Model instance
     * @param model
     * @returns {ModelWrapper}
     */
    this.addModel = function (model) {
        var modelWrapper = new ModelWrapper(model);
        models[modelWrapper.model().modelName] = modelWrapper;
        return modelWrapper;
    };

    /**
     * return ModelWrapper instance for given model name
     * @param model Name of Mongoose model
     * @returns {ModelWrapper}
     */
    this.getModelWrapper = function (model) {
        return models[model];
    };

    /**
     * @param model ModelWrapper
     */
    var setupModelRoutes = function (model) {
        let path = '/' + model.model().collection.collectionName;

        model.getRemoteMethods().forEach((method) => router.post(path + '/' + method.exposeName, (req, res, next) =>
                model.callMethod(method.name, req, res, next)
            ));
        router
            .get(path + '/count', model.middleware('count'), function (req, res, next) {
                model.count(req, res, next);
            })
            .get(path + '/:id', model.middleware('get'), function (req, res, next) {
                model.get(req, res, next);
            })
            .get(path, model.middleware('find'), function (req, res, next) {
                model.find(req, res, next);
            })
            .post(path, model.middleware('create'), function (req, res, next) {
                model.create(req, res, next);
            })
            .post(path + '/:id', model.middleware('update'), function (req, res, next) {
                model.update(req, res, next);
            })
            .put(path, model.middleware('create'), function (req, res, next) {
                model.create(req, res, next);
            })
            .delete(path + '/:id', model.middleware('delete'), function (req, res, next) {
                model.delete(req, res, next);
            });


    };

    var initRouter = function () {
        _.each(models, function (model) {
            setupModelRoutes(model)
        })
    };

    this.router = function () {
        initRouter();
        return router;
    };

};

module.exports = new RestMean();


