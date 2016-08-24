#!/usr/bin/env node

/* eslint no-console:0 no-sync:0 */
var path = require('path');
var fs = require('fs');
var usage = fs.readFileSync(path.resolve(__dirname, '../usage.txt')).toString();
var args = require('minimist')(process.argv.slice(2), {
  boolean: ['debug', 'overwrite']
});

if (args.debug) {
  process.env.DEBUG = 'electron-installer-dmg';
}
var createDMG = require('../');
var pkg = require('../package.json');

args.appPath = args._[0];
args.name = args._[1];

if (args.help || args.h || !args.appPath || !args.name) {
  console.error(usage);
  process.exit(1);
}
if (args.version) {
  console.error(pkg.version);
  process.exit(1);
}

createDMG(args, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }
  console.error('Wrote DMG to:\n' + args.dmgPath);
});
