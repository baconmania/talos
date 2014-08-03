'use strict';

var irc = require('irc'),
    fs = require('fs');

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
    this._handlers = [];


    // Load bundled middleware
    fs.readdirSync('./lib/middleware').forEach(function(middleware) {
        require('./middleware/' + middleware)(Talos);
    });


    this._client.on('message', function(fromUser, channel, message, metadata) {
        var req = {
                fromUser: fromUser,
                channel: channel,
                metadata: metadata,
                incomingMessage: message
            },
        // If the `channel` is the bot's own nick, that means this is a privmsg from a user.
        // In that case, set `res.send` to respond to the `fromUser` instead of the `channel`.
            res = {
                send: self._client.say.bind(
                    self._client,
                    (channel === self._client.nick) ? fromUser : channel
                )
            };

        (function runMiddlewarePipeline(handler) {
            handler = handler || 0;
            return function(err) {
                if (err) {
                    console.error(err);
                } else if (handler < self._handlers.length) {
                    self._handlers[handler](req, res, runMiddlewarePipeline(++handler));
                }

            }
        })()();

    });
}


Talos.prototype.connect = function(cb) {
    this._client.connect(cb);
};


Talos.prototype.use = function(handler) {
    this._handlers.push(handler);
};


module.exports = Talos;