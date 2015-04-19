#!/usr/bin/env node

var util = require('util');

var Labels = module.exports = function (trello, boardPromise) {
    this.trello = trello;

    this.current = boardPromise.then(function (board) {
        return trello.get(util.format('/1/boards/%s/labels', board.id)).then(function (labels) {
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
        
            return {board: board, map: map};
        });
    });
};

Labels.prototype.getLabel = function(name) {
    var self = this;

    return self.current.then(function(current) {
        if (!current.map[name]) {
            current.map[name] = self.trello.post('/1/labels', {
                name: name,
                color: null,
                idBoard: current.board.id
            }).then(function (label) {
                return [label];
            });
        }

        return current.map[name];
    });
};
