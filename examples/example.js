var Talos = require('./../index'),
    bot = new Talos({
        host: 'irc.freenode.net',
        nick: 'baconbot',
        channels: ['#baconmania']
    }),
    request = require('request'),
    cheerio = require('cheerio'),
    querystring = require('querystring'),
    bannedUsers = {
        //baconmania: 1
    };


bot.use(Talos.listenFor(/^!baconbot/));
bot.use(Talos.tokenize());
bot.use(Talos.bannedUsers());
bot.use(Talos.router());

bot.onMessage('echo', function(req, res, next) {
    res.send(req.tokenized.args.join(' '));
    next();
});

bot.onMessage(function logger(req, res, next) {
    console.log(require('util').inspect(arguments, { depth: null }));
    next();
});

bot.onMessage('yomama', function(req, res, next) {
    request({ uri: 'http://api.yomomma.info/', headers: { 'Accept': 'application/json' }, json: true }, function(err, incomingMessage, response) {
        if (err) return next(err);

        var $ = cheerio.load(response),
            data = JSON.parse($('body').text());
        res.send(data.joke);

        next();
    });
});

bot.onMessage('urban', function(req, res, next) {
    request(
        {
            uri: 'http://api.urbandictionary.com/v0/define?' + querystring.stringify({ term: req.args }),
            json: true
        },
        function(err, incomingMessage, response) {
            if (err) return next(err);

            if (response['result_type'] == 'exact') {
                res.send(req.args + ": " + response['list'][0]['definition']);
            } else {
                res.send('No results found.');
            }

            next();
        }
    );
});


bot.connect();