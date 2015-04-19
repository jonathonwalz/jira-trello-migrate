#!/usr/bin/env node

var opts = require('nomnom')
    .script('jira-trello-migrate')
    .option('key', {
        abbr: 'k',
        help: 'A developer public key. Get it from here: https://trello.com/1/appKey/generate',
        metavar: 'PUBLIC_KEY',
        type: 'string',
        required: true
    })
    .option('token', {
        abbr: 't',
        help: 'A token for your user. Get it from here (replace <PUBLIC_KEY> with your public key): https://trello.com/1/connect?key=<PUBLIC_KEY>&name=JIRAMigrate&response_type=token&scope=read,write',
        metavar: 'TOKEN',
        type: 'string',
        required: true
    })
    .option('board', {
        abbr: 'b',
        help: 'The id of the board to migrate issues to. Go to your board and it is the token in the url: https://trello.com/b/<BOARD ID>/',
        metavar: 'BOARD_ID',
        type: 'string',
        required: true
    })
    .parse();

var util = require('util');
var Promise = require('promise');
var Trello = require('./trello-wrapper');
var t = new Trello(opts.key, opts.token);
var board = t.get(util.format('/1/boards/%s/', opts.board));
var labels = new (require('./labels'))(t, board);

// t.get(util.format('/1/boards/%s/labels', board)).then(
//     function(data){console.log(data);},
//     function(error) {console.log('Error');console.log(error);}
// );

labels.getLabel('test2').then(
    function(data){console.log(data);},
    function(error) {console.log('Error');console.log(error);}
);