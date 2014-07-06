'use strict';

var irc = require('irc');

function Talos(options) {
    var self = this;

    this._options = options;
    this._client = new irc.Client(this._options.host, this._options.nick, {
        channels: this._options.channels,
        port: this._options.port,
        debug: true,
        userName: this._options.userName,
        realName: this._options.realName,
        password: this._options.password,
        autoConnect: false
    });
    this._requestHandlers = [];


    this._client.on('message', function(fromUser, channel, message, metadata) {
        var tokens,
            command,
            args,
            matchedHandlers;

        // Don't trigger commands based on what the bot itself says.
        if (fromUser === self._options.nick) return;

        // Ignore non-matching messages if we've been given a regex to listen for.
        if (self._options.listenFor !== undefined) {
            if (!self._options.listenFor.test(message)) return;

            // FIXME: if the regex is anything other than a string literal, we'll likely
            // FIXME: unintentionally delete chunks of the message that we want to keep
            message = message.replace(self._options.listenFor, '').trim();
        }

        tokens = message.split(' ');
        command = tokens[0].toLowerCase();
        args = tokens.splice(1).join(' ');

        matchedHandlers = self._requestHandlers.filter(function(handler) {
            // If no message is associated with a given handler, then that handler is a catch-all.
            return handler.message === undefined || handler.message.indexOf(command) !== -1;
        });

        (function _runMiddlewarePipeline() {
            var middleware = matchedHandlers.shift(),
                req = {
                    fromUser: fromUser,
                    channel: channel,
                    args: args,
                    metadata: metadata
                },
            // If the `channel` is the bot's own nick, that means this is a privmsg from a user.
            // In that case, set `res.send` to respond to the `fromUser` instead of the `channel`.
                res = {
                    send: self._client.say.bind(
                        self._client,
                        (channel === self._client.nick) ? fromUser : channel
                    )
                };

            if (middleware !== undefined) {

                middleware.fn(req, res, function(err) {
                    if (err) {
                        return console.dir(err);
                    }

                    _runMiddlewarePipeline();
                });

            }
        }());

    });
}


Talos.prototype.onMessage = function(message, handler) {
    if (arguments.length === 1 && typeof arguments[0] === 'function') {
        // Only a handler was provided, and it should be called on all incoming requests
        this._requestHandlers.push({ fn: message });
    } else {
        this._requestHandlers.push({ message: message, fn: handler });
    }

};


Talos.prototype.connect = function(cb) {
    this._client.connect(cb);
};


module.exports = Talos;