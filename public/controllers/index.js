'use strict';
angular.module('mean.material').controller('MaterialController',
    function ($http, $scope, $rootScope, $state, Global, Material, MeanUser, $mdDialog, $mdMedia, $mdToast, $mdSidenav) {

        $scope.global = Global;
        $scope.package = {
            name: 'material-admin'
        };
        $scope.user = MeanUser;
        $scope.$state = $state;
        $scope.loaded = true;
        $scope.toolbar = 'material/views/toolbar.html';
        
        $scope.openLoginDialog = openLoginDialog;
        $scope.openRegistrationDialog = openRegistrationDialog;

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

        function openLoginDialog(ev) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
            $mdDialog.show({
                templateUrl: 'material/views/login.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen,
                escapeToClose: true,
                controller: function ($scope, $rootScope, $mdDialog) {
                    $scope.user = {
                        email: '',
                        password: ''
                    };
                    $scope.login = function (user) {
                        $rootScope.action = 'login';
                        MeanUser.login(user);
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    };
                    $scope.openRegistrationDialog = function (ev, user) {
                        openRegistrationDialog(ev, user);
                    };
                }
            })
        }

        function openRegistrationDialog(ev, user) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
            $mdDialog.show({
                templateUrl: 'material/views/register.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen,
                escapeToClose: true,
                controller: function ($scope, $rootScope, $mdDialog) {
                    $scope.user = user;
                    $scope.register = function (user) {
                        user.confirmPassword = user.password;
                        user.name = user.username;
                        Material.registerUser(user)
                            .then(function (response) {
                                MeanUser.onIdentity(response.data);
                                $state.go('admin.profile');
                            })
                            .catch(function (response) {
                                console.log(response);
                                $rootScope.$broadcast('UserRegistrationFailed', response);
                            })

                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    }
                }
            })
        }

        $scope.logout = function (ev) {
            MeanUser.logout();
        };

        $rootScope.$on('loggedin', function () {
            if ($rootScope.action == 'login') {
                $state.go('admin.dashboard');
                delete $rootScope.action;
            }
            /* $mdToast.show(
             $mdToast.simple()
             .textContent('Login success')
             .hideDelay(2000)
             );*/
            $mdDialog.hide();
        });
        $rootScope.$on('loginfailed', function (err) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Login failed')
                    .hideDelay(2000)
            );
        });
        $rootScope.$on('UserRegistrationFailed', function (ev, response) {
            var errors = [];
            if (angular.isArray(response.data)) {
                angular.forEach(response.data, function(value){
                    errors.push(value.msg);
                })
            }
            $mdToast.show({
                template: '<md-toast>Registration failed<br />' + errors.join(', ') + '</md-toast>',
                hideDelay: 2000
            });
        });

        $rootScope.$on('logout', function () {
            $state.go('home');
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Logout success')
                    .hideDelay(2000)
            );
        });
    });