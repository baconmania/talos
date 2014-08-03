talos
=====

An ExpressJS-inspired middleware framework for IRC bots in Node.

```javascript
var Talos = require('talos'),
    bot = new Talos({
        host: 'irc.freenode.net',
        nick: 'baconbot',
        channels: ['#baconmania']
    });

bot.use(Talos.listenFor(/^!baconbot/));
bot.use(Talos.tokenize());
bot.use(Talos.router());

bot.onMessage('echo', function(req, res, next) {
    res.send(req.tokenized.args.join(' '));
    next();
});

bot.connect();
```

```
baconmania: !baconbot echo this and that
baconbot: this and that
```

## Installation
```shell
$ npm install talos
```

## Writing middleware
Each piece of middleware you write should take three arguments: `req`, `res`, and `next`.
### req
The `req` object presents the following interface:
```javascript
var req = {
    fromUser: 'somenick',
    channel: 'somechannel',
    metadata: { ... }, // passed through from node-irc
    incomingMessage: 'some message'
};
```
### res
The `res` object exposes a single function, `send(message)`. Call this function to send the string `message` back to the channel or nick which sent a message to your bot.
### next
Every piece of middleware you write __must__ call `next()` to pass control to the next piece of middleware in the pipeline.

You can call `next(err)` to skip the remaining middleware in the pipeline. Talos will print the given error to stderr.
## Bundled middleware
Talos comes with a minimal set of middleware which implements functionality that most IRC bots will need.
### listenFor
Ignores all messages which don't match the given trigger RegEx.

When a message comes in and matches the given trigger, the trigger is removed from the incoming message text before control is passed to the next request handler.
```javascript
bot.use(Talos.listenFor(/^!baconbot/));
```
### tokenize
Splits each incoming message up into a command and a list of arguments. These get stored in a new `tokenized` property on the `req` object.
```javascript
bot.use(Talos.tokenize());
```
If the bot received the message `echo foo bar baz`, then the `req` object would look something like:
```javascript
var req = {
    ...,
    tokenized: {
        command: 'echo',
        args: ['foo', 'bar', 'baz']
    },
    ...
}
```
### bannedUsers
__Requires `Talos.tokenize()`__
```javascript
bot.use(Talos.tokenize());
...
bot.use(Talos.bannedUsers());
```
You can also pass in a list of banned users to initialize with.
```javascript
bot.use(Talos.bannedUsers(['baconmania', 'otherbannednick']));
```
With this middleware activated, you can say `ignore <nick>` and `unignore <nick>` in IRC to ban and unban users, respectively.
### router
__Requires `Talos.tokenize()`__

Exposes the `Talos.prototype.onMessage([trigger], handler)` function.

When an incoming message's first word token matches any of the defined triggers, each matching trigger's associated handler is called.

To define a catch-all handler, simply omit the `trigger` argument when calling `onMessage()`.
```javascript
bot.use(Talos.tokenize());
...
bot.use(Talos.router());

bot.onMessage('echo', function(req, res, next) {
    res.send(req.tokenized.args.join(' '));
    next();
});

bot.onMessage(function(req, res, next) {
    res.send('you hit a catch-all handler.');
    next();
});
```
## Low-level access to IRC client
`res.send()` is an easy way to reply to the channel or user which originally messaged your bot. If you have a more sophisticated use-case, you may wish to drop down to the node-irc client used by Talos.
```javascript
var Talos = require('talos'),
    bot = new Talos({ ... });

bot.use(function(req, res, next) {
    bot._client.say('#someOtherChannel', 'hello');
});
```
Refer to the [node-irc module](https://github.com/martynsmith/node-irc) for more information.
