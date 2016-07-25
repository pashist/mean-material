'use strict';

import 'angular-material';
import 'angular-material/angular-material.css';
import 'angular-material-data-table';
import 'angular-material-data-table/dist/md-data-table.css';
import './assets/css/material.css';
import './assets/css/color-palettes.css';

angular.module('mean.material').config($mdThemingProvider => {
    let primaryPalette = localStorage.getItem("themePrimaryPalette");
    let accentPalette = localStorage.getItem("themeAccentPalette");
    if (primaryPalette) {
        $mdThemingProvider.theme('default').primaryPalette(primaryPalette);
    }
    if (accentPalette) {
        $mdThemingProvider.theme('default').accentPalette(accentPalette);
    }
});

angular.module('mean.material').constant('role', {
    resolver: name => Global => new Promise((resolve, reject) => {
        let roles = name instanceof Array ? name : [name];
        Global.identity().then(user => {
            user && user.roles && user.roles.filter(name => ~roles.indexOf(name)).length
                ? resolve(true)
                : reject({type: 'unauthorized', message: 'You don\'t have access to requested page'});
        }).catch(err => reject({type: 'unauthorized', message: err.message}))
    })
});

angular.module('mean.material').run(($rootScope, $state, Material) => {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        if (error.type == 'unauthorized') {
            if (error.redirect) {
                $state.go(error.redirect)
            }
            Material.toast(error.message);
        } else {
            console.log(error);
        }
    });
});
