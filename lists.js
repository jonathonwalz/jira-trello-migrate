#!/usr/bin/env node

var util = require('util');

var Lists = module.exports = function (trello, boardPromise) {
    this.trello = trello;

    this.current = boardPromise.then(function (board) {
        return trello.get(util.format('/1/boards/%s/lists', board.id)).then(function (lists) {
            var map = {};
            lists.forEach(function(list){
                if (!map[list.name]) {
                    map[list.name] = [];
                }
                map[list.name].push(list);
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

Lists.prototype.getList = function(name) {
    var self = this;

    return self.current.then(function(current) {
        if (!current.map[name]) {
            current.map[name] = self.trello.post('/1/lists', {
                name: name,
                idBoard: current.board.id
            }).then(function (list) {
                return [list];
            });
        }

        return current.map[name];
    });
};
