var Promise = require('promise');
var Trello = require('node-trello');

var TrelloWrapper = module.exports = function (key, token) {
    this.trello = new Trello(key, token);
};

TrelloWrapper.prototype.get = function(uri, args) {
    var self = this;
    return new Promise(function (fulfill, reject) {
        self.trello.get(uri, args, function (err, res) {
            if (err) {
                reject(err);
            } else {
                fulfill(res);
            }
        });
    });
}