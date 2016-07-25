'use strict';
angular.module('mean.material').controller('MaterialProfileController',
    function ($scope, $rootScope, $http, Material, MeanUser, $mdDialog, $mdMedia, $mdToast) {

        $scope.user = MeanUser.user;
        $scope.updateProfile = updateProfile;
        $scope.loading = false;

        function updateProfile(ev, user) {
            $scope.loading = true;
            Material.updateProfile(user)
                .then(function (response) {
                    $scope.user = response.data;
                    $rootScope.$broadcast('UserUpdated');
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Profile updated')
                            .hideDelay(2000)
                    );
                })
                .catch(function (response) {
                    var errors = Material.parseValidationErrors(response);
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(response.data.message + "\n" + errors)
                            .hideDelay(2000)
                    );
                })
                .then(function () {
                    $scope.loading = false;
                })
        }
    });