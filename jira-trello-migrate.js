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
    .option('attachments', {
        abbr: 'a',
        help: 'The path to a directory of attachments',
        type: 'string',
        required: false
    })
    .parse();

var util = require('util');
var Q = require('q');
var FS = require('q-io/fs');
var fss = require('fs');
var Trello = require('./trello-wrapper');
var t = new Trello(opts.key, opts.token);
var board = t.get(util.format('/1/boards/%s/', opts.board));
var labels = new (require('./labels'))(t, board);
var lists = new (require('./lists'))(t, board);

var processComment = function(card, comment) {
    var cardComment = {
        text: util.format('From %s on %s:\\n%s', comment.author.displayName, comment.created, comment.body)
    };
    
    return t.post(util.format('/1/cards/%s/actions/comments', card.id), cardComment);
}

var processAttachment = function(card, issue, attachment) {
    var filepath = util.format('%s/%s %s %s', opts.attachments, issue.key, attachment.id, attachment.filename);
    var cardAttachment = {
        attachment: fss.createReadStream(filepath),
        name: attachment.filename
    };

    return t.post(util.format('/1/cards/%s/attachments', card.id), cardAttachment);
}

var processIssue = function(issue) {
    var firstId = function(item) {
        return item[0].id;
    };
    var cardLabelsPromise = issue.fields.labels;
    cardLabelsPromise.push(issue.fields.issuetype.name);
    cardLabelsPromise.push(issue.fields.priority.name);
    cardLabelsPromise = Q.all(cardLabelsPromise.map(function (label) { 
        return labels.getLabel(label).then(firstId); 
    }));
    var cardListPromise = lists.getList(issue.fields.status.name).then(firstId);

    return Q.spread([cardListPromise, cardLabelsPromise], function (cardList, cardLabels) {
        var card = {
            name: util.format('%s (%s)', issue.fields.summary, issue.key),
            desc: util.format('From %s on %s:\\n%s', issue.fields.creator.displayName, issue.fields.created, issue.fields.description),
            due: null,
            idLabels: cardLabels,
            idList: cardList,
            urlSource: ''
        };
        
        return t.post('/1/cards', card).then(function (trelloCard) {
            var promise = Q.all(issue.fields.comment.comments.map(function (comment) {
                return processComment(trelloCard, comment);
            }));
        
            if (opts.attachments) {
                promise = Q.all([promise, Q.all(issue.fields.attachment.map(function (attachment) {
                    return processAttachment(trelloCard, issue, attachment);
                }))]);
            }
        
            return promise;
        });
    });
};

var issues = FS.listTree(opts.project, function(path, stat) {
    return stat.isFile() && path.indexOf('sync_state.json') < 0 && path.match('json$') == 'json';
}).then(function (filePaths) {
    return filePaths.map(function (filePath) {
        return FS.read(filePath).then(function(content) {
            return JSON.parse(content);
        });
    });
}).then(function(issues){
    return Q.all(issues.map(function(issue) {
        return issue.then(processIssue);
    }));
}).done();
