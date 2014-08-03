module.exports = function(Talos) {

    Talos.router = function() {
        var requestHandlers = [];

        /**
         * onMessage(handler(req, res, next)) - handler called on every message
         * onMessage(trigger, handler(req, res, next)) - handler called only when messages matches trigger
         */
        Talos.prototype.onMessage = function() {
            if (arguments.length === 1 && typeof arguments[0] === 'function') {
                // Only a handler was provided, and it should be called on all incoming requests
                requestHandlers.push({ fn: arguments[0] });
            } else {
                requestHandlers.push({ message: arguments[0], fn: arguments[1] });
            }

        };


        return function(req, res, next) {

            var matchedHandlers = requestHandlers.filter(function(handler) {
                // If no message is associated with a given handler, then that handler is a catch-all.
                return handler.message === undefined || handler.message === req.tokenized.command;
            });

            (function _runHandlers() {
                var middleware = matchedHandlers.shift();

                if (middleware !== undefined) {

                    middleware.fn(req, res, function(err) {
                        if (err) {
                            return console.dir(err);
                        }

                        _runHandlers();
                    });

                } else {
                    next();
                }
            }());

        }
    }

};
