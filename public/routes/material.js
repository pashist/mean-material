'use strict';

angular.module('mean.material').config(function ($stateProvider, $urlRouterProvider, $locationProvider, role) {

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'material/views/index.html'
        })
        .state('restricted', {
            url: '/restricted',
            templateUrl: 'material/views/restricted.html'
        })
        .state('admin', {
            abstract: true,
            controller: 'MaterialAdminController',
            resolve: {
                menu: $http => $http.get('/api/admin/menu/admin').then(response => response.data),
                access: role.resolver('authenticated')
            },
            url: '/admin',
            templateUrl: 'material/views/admin/index.html'
        })
        .state('admin.dashboard', {
            data: {
                title: 'Dashboard'
            },
            url: '',
            resolve: {
                access: role.resolver('authenticated')
            },
            templateUrl: 'material/views/admin/dashboard.html'
        })
        .state('admin.users', {
            data: {
                title: 'Users'
            },
            resolve: {
                access: role.resolver('admin')
            },
            url: '/users',
            templateUrl: 'material/views/admin/users.html'
        })
        .state('admin.themes', {
            data: {
                title: 'Themes'
            },
            url: '/themes',
            templateUrl: 'material/views/admin/themes.html'
        })
        .state('admin.modules', {
            data: {
                title: 'Modules'
            },
            resolve: {
                access: role.resolver('admin')
            },
            url: '/modules',
            templateUrl: 'material/views/admin/modules.html'
        })
        .state('admin.profile', {
            data: {
                title: 'User Profile'
            },
            url: '/profile',
            templateUrl: 'material/views/admin/profile.html'
        })
        .state('admin.settings', {
            data: {
                title: 'Settings'
            },
            resolve: {
                access: role.resolver('admin')
            },
            url: '/modules',
            templateUrl: 'material/views/admin/settings.html'
        });

});

