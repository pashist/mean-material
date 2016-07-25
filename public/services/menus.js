'use strict';

angular
    .module('mean.material')
    .factory('Menus', function ($http) {
        return $http.get('/api/admin/menu').then(response => response.data)
    });

