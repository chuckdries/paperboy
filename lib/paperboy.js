# lib/paperboy.js

'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3');
var Bot = require('slackbots');

var PaperBoy = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'paperboy';
    this.dbPath = settings.dPath || path.resolve(process.cwd(),'data','paperboy.db');

    this.user = null;
    this.db = null;
}

util.inherits(PaperBoy, Bot);

module.exports = PaperBoy;
