'use strict';

var Module = require('meanio').Module;
var Material = new Module('material');

Material.register(function (system, app) {
    app.set('views', __dirname + '/server/views');
    Material.routes(app);
    Material.angularDependencies(['ngMaterial', 'md.data.table', 'ui.router']);
    Material.menus.add({
        title: 'Dashboard',
        link: 'admin.dashboard',
        roles: ['admin', 'authenticated'],
        menu: 'admin'
    });
    Material.menus.add({
        title: 'Themes',
        link: 'admin.themes',
        roles: ['admin', 'authenticated'],
        menu: 'admin'
    });
    Material.menus.add({
        title: 'Users',
        link: 'admin.users',
        roles: ['admin'],
        menu: 'admin'
    });
    Material.menus.add({
        title: 'Modules',
        link: 'admin.modules',
        roles: ['admin'],
        menu: 'admin'
    });
    return Material;
});
