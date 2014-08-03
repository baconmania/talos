var util = require('util');

module.exports = function(Talos) {

    var bannedUsers = {};

    Talos.bannedUsers = function(preBannedUsers) {

        if (preBannedUsers) {
            preBannedUsers.map(ban);
        }

        return function(req, res, next) {
            if (req.fromUser in bannedUsers) {
                next(util.format('Ignoring message from banned user %s.', req.fromUser));
            } else {

                if (req.tokenized.command === 'ignore') {
                    req.tokenized.args.map(ban);
                } else if (req.tokenized.command === 'unignore') {
                    req.tokenized.args.map(unban);
                }

                next();
            }
        };

    };

    function ban(targetUser) {
        bannedUsers[targetUser] = 1;
    }

    function unban(targetUser) {
        delete bannedUsers[targetUser];
    }

};