'use strict';
angular.module('mean.material').controller('MaterialAdminController',
    function ($http, $scope, $rootScope, $state, $mdDialog, $mdMedia, $mdToast, $mdSidenav, Material, menu) {
        $scope.menu = menu;
        $rootScope.getIconName = function (title) {
            var matches = {
                users: 'people',
                settings: 'settings',
                modules: 'widgets',
                themes: 'settings_system_daydream',
                dashboard: 'dashboard'
            };
            var def = 'lens';
            return matches[title.toLowerCase()] || def;
        };
        $scope.toggleList = function () {
            $mdSidenav('left').toggle();
        };

    });