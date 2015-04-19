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

var labels = new (function (board) {
    this.currentLabels = board.then(function (b) {
        return t.get(util.format('/1/boards/%s/labels', b.id)).then(function (labels) {
            var map = {};
            labels.forEach(function(label){
                if (!map[label.name]) {
                    map[label.name] = [];
                }
                map[label.name].push(label);
            });
            for (key in map) {
                if (map.hasOwnProperty(key)) {
                    map[key] = Promise.resolve(map[key]);
                }
            }
        
            return map;
        });
    });

    this.getLabel = function(name) {
        return this.currentLabels.then(function(map) {
            return board.then(function (b) {
                if (!map[name]) {
                    map[name] = t.post('/1/labels', {
                        name: name,
                        color: null,
                        idBoard: b.id
                    }).then(function (label) {
                    console.log(label);
                        return [label];
                    });
                }
    
                return map[name];
            });
        });
    };
})(board);
