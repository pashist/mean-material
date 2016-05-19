'use strict';

module.exports = function(role) {
    return function(req, res, next) {
        function isAllowed() {
            var result = false;
            if (req.user && req.user.roles) {
                var roles = role instanceof Array ? role : [role];
                result = [].some.call(roles, function(val){
                    return req.user.roles.indexOf(val) !== -1
                })
            }
            return result;
        }
        if (isAllowed()) {
            next();
        } else {
            res.sendStatus(401);
            res.end();
        }
    }
};