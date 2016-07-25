'use strict';

angular
    .module('mean.material')
    .factory('Material', function ($http, $mdToast) {

        return {
            name: 'material',
            updateProfile: function (user) {
                return $http.post(
                    '/api/material/profile', user
                )
            },
            updateUser: function (user) {
                return $http.post(
                    '/api/material/users/' + user._id, user
                )
            },
            createUser: function (user) {
                return $http.post(
                    '/api/material/users', user
                )
            },
            registerUser: function (user) {
                return $http.post(
                    '/api/register', user
                )
            },
            deleteUser: function (user) {
                return $http.delete(
                    '/api/material/users/' + user._id
                )
            },
            parseValidationErrors: function (response) {
                var errors = [];
                if (response.data && response.data.errors && angular.isObject(response.data.errors)) {
                    angular.forEach(response.data.errors, function(value) {
                        errors.push(value.message);
                    });
                }
                return errors.join(', ');
            },
            loadSetting: function(name, defaultValue) {
                return $http.get(
                    '/api/material/settings',
                    {params: {name: name, default: defaultValue}}
                )
            },
            saveSetting: function(setting) {
                return $http.post(
                    '/api/material/settings',
                    setting
                )
            },
            toast: function(text, delay) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(text)
                        .hideDelay(delay || 2000)
                );
            },
        };
    });

