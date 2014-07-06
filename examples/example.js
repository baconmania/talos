var Bot = require('./../index'),
    bot = new Bot({
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


bot.onMessage(function(req, res, next) {
    if (req.fromUser in bannedUsers) {
        return next('Ignoring message from banned user.');
    }

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