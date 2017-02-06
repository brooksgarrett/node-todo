const {User} = require('../models/user');

var authenticate = (req, resp, next) => {
    var token = req.header('X-AUTH');

    User.findByToken(token)
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }
            req.user = user;
            req.token = token;
            next();
        }).catch((e) => {
            res.status(401).send();
        })
};

module.exports = {authenticate};