/**
 * https://github.com/loopline-systems/electron-builder
 * Licensed under the MIT license.
 */
var fs = require('fs');
var path = require('path');
var os = require('os');
var debug = require('debug')('electron-installer-dmg');

function build(opts, done) {
  var appdmg = require('appdmg');
  var spec = {
    title: opts.title || opts.productName || opts.name,
    contents: opts.contents,
    icon: opts.icon,
    'icon-size': opts['icon-size'],
    background: opts.background,
    format: opts.format
  };
  var contents = JSON.stringify(spec, null, 2);

  debug('DMG spec is:\n', spec);

  var src = path.resolve(os.tmpdir(), 'appdmg.json');
  debug('writing config to `%s`', src);

  fs.writeFile(src, contents, function(err) {
    if (err) return done(err);
    debug('creating dmg...');
    appdmg({
      source: src,
      target: opts.dmgPath
    }).on('progress', function(info) {
      if (info.type === 'step-begin') {
        debug('appdmg [%d/%d]: %s...', info.current, info.total, info.title);
      }
    }).on('finish', function() {
      debug('appdmg finished!');
      debug('cleaning up temp config at `%s`', src);
      fs.unlink(src, function(err2) {
        if (err2) return done(err2);
        done(null, opts);
      });
    }).on('error', function(err3) {
      done(err3);
    });
  });
}

module.exports = function(opts, done) {
  if (process.platform !== 'darwin') {
    return done(new Error('Must be run on OSX'));
  }
  if (!opts.background) {
    opts.background = path.resolve(__dirname, 'resources/mac/background.png');
  } else {
    opts.background = path.resolve(opts.background);
  }
  if (!opts.icon) {
    opts.icon = path.resolve(__dirname, 'resources/mac/atom.icns');
  } else {
    opts.icon = path.resolve(opts.icon);
  }

  opts['icon-size'] = opts['icon-size'] || 80;
  opts.out = opts.out || process.cwd();

  opts.appPath = path.resolve(process.cwd(), opts.appPath);
  opts.dmgPath = path.resolve(opts.dmgPath || path.join(opts.out, opts.name + '.dmg'));

  opts.overwrite = opts.overwrite || false;

  opts.format = opts.format || 'UDZO';

  opts.contents = opts.contents || [
    {
      x: 448,
      y: 344,
      type: 'link',
      path: '/Applications'
    },
    {
      x: 192,
      y: 344,
      type: 'file',
      path: opts.appPath
    }
    // {
    //   x: 512,
    //   y: 128,
    //   type: 'file',
    //   path: 'release-notes'
    // }
  ];

  fs.exists(opts.dmgPath, function(exists) {
    if (exists && !opts.overwrite) {
      debug('DMG already exists at `%s` and overwrite is false', opts.dmgPath);
      var msg = 'DMG already exists.  Run electron-installer-dmg again with '
        + '`--overwrite` or remove the file and rerun. ' + opts.dmgPath;
      return done(new Error(msg));
    } else if (exists && opts.overwrite) {
      debug('DMG already exists at `%s`.  Removing...', opts.dmgPath);
      fs.unlink(opts.dmgPath, function(err) {
        if (err) return done(err);
        build(opts, done);
      });
    } else {
      build(opts, done);
    }
  });
};
