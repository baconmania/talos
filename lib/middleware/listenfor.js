module.exports = function(Talos) {

    Talos.listenFor = function(trigger) {

        return function(req, res, next) {
            // Ignore non-matching messages if we've been given a regex to listen for.
            console.dir(trigger);
            console.dir(req.incomingMessage);
            if (!trigger.test(req.incomingMessage)) return next(true);

            // FIXME: if the regex is anything other than a string literal, we'll likely
            // FIXME: unintentionally delete chunks of the message that we want to keep
            req.incomingMessage = req.incomingMessage.replace(trigger, '').trim();
            next();
        };

    };

};
