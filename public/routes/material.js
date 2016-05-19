'use strict';

angular.module('mean.material').config(function ($stateProvider) {
    $stateProvider
        .state('front', {
            url: '/',
            templateUrl: 'material/views/index.html'
        })
        .state('admin', {
            url: '/admin',
            templateUrl: 'material/views/admin/index.html'
        })
        .state('admin.dashboard', {
            data: {
                title: 'Dashboard'
            },
            url: '/dashboard',
            templateUrl: 'material/views/admin/dashboard.html'
        })
        .state('admin.users', {
            data: {
                title: 'Users'
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
            url: '/modules',
            templateUrl: 'material/views/admin/settings.html'
        });

}).run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        if (toState.name == 'home') {
            $state.go('front');
        }
    })
});

