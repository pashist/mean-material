'use strict';

var Module = require('meanio').Module;
var Material = new Module('material');

Material.register(function (system, app) {
    app.set('views', __dirname + '/server/views');
    Material.routes(app);
    Material.angularDependencies(['ngMaterial', 'md.data.table', 'ui.router']);
    Material.menus.add({
        title: 'Dashboard',
        link: 'dashboard',
        roles: ['admin', 'authenticated'],
        menu: 'admin'
    });
    return Material;
});
