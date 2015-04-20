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
    .option('project', {
        abbr: 'p',
        help: 'The path to a directory of json files representing JIRA issues',
        type: 'string',
        required: true
    })
    .parse();

var util = require('util');
var Q = require('q');
var FS = require("q-io/fs");
var Trello = require('./trello-wrapper');
var t = new Trello(opts.key, opts.token);
var board = t.get(util.format('/1/boards/%s/', opts.board));
var labels = new (require('./labels'))(t, board);
var lists = new (require('./lists'))(t, board);

var issues = FS.listTree(opts.project, function(path, stat) {
    return stat.isFile() && path.indexOf('sync_state.json') < 0 && path.match('json$') == 'json';
}).then(function (filePaths) {
    return filePaths.map(function (filePath) {
        return FS.read(filePath).then(function(content) {
            return JSON.parse(content);
        });
    });
});

