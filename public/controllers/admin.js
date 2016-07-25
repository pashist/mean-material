'use strict';
angular.module('mean.material').controller('MaterialAdminController',
    function ($http, $scope, $rootScope, $state, $mdDialog, $mdMedia, $mdToast, $mdSidenav, Material, menu) {
        let exclude = ['users', 'modules'];
        $scope.menu = menu.filter(item => exclude.indexOf(item.link) === -1);
    });