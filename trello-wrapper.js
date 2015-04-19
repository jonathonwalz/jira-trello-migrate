var Q = require('q');
var Trello = require('node-trello');

var TrelloWrapper = module.exports = function (key, token) {
    this.trello = new Trello(key, token);
};

TrelloWrapper.prototype.get = function(uri, args) {
    var self = this;
    return Q.Promise(function (fulfill, reject) {
        self.trello.get(uri, args, function (err, res) {
            if (err) {
                reject(err);
            } else {
                fulfill(res);
            }
        });
    });
}

TrelloWrapper.prototype.post = function(uri, args) {
    var self = this;
    return Q.Promise(function (fulfill, reject) {
        self.trello.post(uri, args, function (err, res) {
            if (err) {
                reject(err);
            } else {
                fulfill(res);
            }
        });
    });
}