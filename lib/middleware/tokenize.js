module.exports = function(Talos) {

    Talos.tokenize = function() {
        return function(req, res, next) {
            var tokens,
                command,
                args;

            tokens = req.incomingMessage.split(' ');
            command = tokens[0].toLowerCase();
            args = tokens.splice(1);

            req.tokenized = {
                command: command,
                args: args
            };

            next();
        };
    };

};