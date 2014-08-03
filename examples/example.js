var Talos = require('./../index'),
    bot = new Talos({
        host: 'irc.freenode.net',
        nick: 'baconbot',
        channels: ['#baconmania']
    }),
    request = require('request'),
    cheerio = require('cheerio'),
    querystring = require('querystring'),
    async = require('async');


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
    var term = req.tokenized.args.join(' ');

    request(
        {
            uri: 'http://api.urbandictionary.com/v0/define?' + querystring.stringify({ term: term }),
            json: true
        },
        function(err, incomingMessage, response) {
            if (err) return next(err);

            if (response['result_type'] == 'exact') {
                res.send(term + ": " + response['list'][0]['definition']);
            } else {
                res.send('No results found.');
            }

            next();
        }
    );
});

bot.onMessage('btc', function(req, res, next) {
    async.series([
        function(done) {
            request({ uri: 'http://data.mtgox.com/api/2/BTCUSD/money/ticker_fast', json: true},
                function(err, incomingMessage, response) {
                    if (err)
                        return next(err);

                    if (response['result'] != "success")
                        return next(response);

                    res.send(
                        'MtGox: 1 BTC = ' + Number(response['data']['last']['value']).toFixed(2) + ' USD'
                    );
                    done();
                }
            );

        },
        function(done) {
            request({ uri: 'https://coinbase.com//api/v1/currencies/exchange_rates', json: true},
                function(err, incomingMessage, response) {
                    if (err)
                        return next(err);

                    res.send('Coinbase: 1 BTC = ' + response['btc_to_usd'] + ' USD');
                    done();
                }
            )
        }
    ], next);
});

bot.connect();