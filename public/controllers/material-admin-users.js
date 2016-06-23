'use strict';
angular.module('mean.material').controller('MaterialUsersController',
    function ($scope, $rootScope, $http, Material, MeanUser, $mdDialog, $mdMedia, $mdToast) {

        var roles = ['anonymous', 'authenticated', 'admin'];

        $scope.package = {
            name: 'material'
        };

        $scope.openUserDialog = function (ev, selectedUser) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
            $mdDialog.show({
                templateUrl: 'material/views/admin/user-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen,
                escapeToClose: true,
                controller: function ($scope, $mdDialog, $http) {
                    $scope.user = Object.assign({}, selectedUser);
                    $scope.roles = roles;
                    $scope.dialogTitle = selectedUser ? 'Edit User' : 'Create New User';
                    $scope.loading = false;
                    $scope.close = function () {
                        $mdDialog.hide()
                    };
                    $scope.create = function (ev, user) {
                        $scope.loading = true;
                        Material.createUser(user)
                            .then(function (response) {
                                selectedUser = response.data;
                                $rootScope.$broadcast('UserUpdated');
                                $mdDialog.hide();
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
                    };
                    $scope.update = function (ev, user) {
                        $scope.loading = true;
                        Material.updateUser(user)
                            .then(function (response) {
                                selectedUser = response.data;
                                $rootScope.$broadcast('UserUpdated');
                                $mdDialog.hide();
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
                    };
                }
            })
        };

        $scope.openDeleteDialog = function (ev, users) {
            $mdDialog.show({
                templateUrl: 'material/views/admin/delete-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                controller: function ($scope, $rootScope, $q, $mdDialog) {
                    $scope.users = users;
                    $scope.delete = function (ev) {
                        $scope.loading = true;
                        $q.all(users.map(function (user) {
                            return Material.deleteUser(user)
                        })).then(function (results) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent("Deleted " + results.length + " items")
                                    .hideDelay(2000)
                            );
                            $rootScope.$broadcast('UserDeleted');
                        }).catch(function (response) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent(response.data.message)
                                    .hideDelay(2000)
                            );
                        }).then(function () {
                            $scope.loading = false;
                            $mdDialog.hide();
                        });
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    };
                }
            })
        };


        $scope.selected = [];

        $scope.query = {
            order: 'name',
            limit: 5,
            page: 1
        };

        function getUsers(query = $scope.query) {
            var params = {
                skip: query.limit * (query.page - 1),
                sort: query.order,
                limit: query.limit
            };
            $scope.promise = $http.get('/api/users', {params: params})
                .then(response => $scope.users = response.data)
                .then(() => $http.get('/api/users/count'))
                .then(response => $scope.count = response.data.count)
        }

        $scope.onPaginate = function (page, limit) {
            $scope.selected = [];
            $scope.query = angular.extend($scope.query, {page: page, limit: limit});
            getUsers();
        };

        $scope.onReorder = function (order) {
            $scope.query = angular.extend($scope.query, {sort: order});
            getUsers();
        };
        $scope.$on('UserCreated', function () {
            getUsers();
        });
        $scope.$on('UserUpdated', function () {
            getUsers();
        });
        $scope.$on('UserDeleted', function () {
            $scope.selected = [];
            getUsers();
        });

        getUsers();


    });