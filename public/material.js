'use strict';

import 'angular-material';
import 'angular-material/angular-material.css';
import 'angular-material-data-table';
import 'angular-material-data-table/dist/md-data-table.css';
import './assets/css/material.css';
import './assets/css/color-palettes.css';

angular.module('mean.material').config($mdThemingProvider => {
    let palette = localStorage.getItem("themePrimaryPalette");
    if (palette) {
        $mdThemingProvider.theme('default').primaryPalette(palette);
    }
});

/** prevent default admin routing **/
angular.module('mean.material').run(($rootScope, $state, $mdColorPalette) => {
    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
            let toRedirect = ['users', 'settings', 'modules', 'themes'];
            if (toRedirect.indexOf(toState.name) != -1) {
                let newStateName = 'admin.' + toState.name;
                event.preventDefault();
                $state.go(newStateName);
            }
        });
    $rootScope.getMaterialColor = shade => {
        let palette = localStorage.getItem("themePrimaryPalette") || 'indigo';
        let color = $mdColorPalette[palette][shade].value;
        return 'rgb(' + color.join(',') + ')';
    };
});

angular.module('mean-factory-interceptor', []); // hack to disable redirect on login fail attempt
