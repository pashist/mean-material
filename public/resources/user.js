angular.module('mean.material').factory('User', ($resource) => {
    return $resource('/api/material/users/:id', {id: '@_id'}, {
        count: {method: "GET", params: {id: 'count'}}
    });
});