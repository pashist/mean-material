'use strict';

const hasRole = (user, role) => {
    let result = false;
    if (user && user.roles && user.roles instanceof Array) {
        let roles = role instanceof Array ? role : [role];
        result = roles.some(val => user.roles.indexOf(val) !== -1);
    }
    return result;
};

module.exports = role => (req, res, next) => hasRole(req.user, role) ? next() : res.sendStatus(401).end();