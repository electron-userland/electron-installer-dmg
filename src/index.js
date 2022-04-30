const debug = require('debug')('electron-installer-dmg');
const { existsSync, promises: fs } = require('fs');
const os = require('os');
const path = require('path');

async function build(opts) {
  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies, import/no-unresolved
  const appdmg = require('appdmg');
  const additionalDMGOptions = opts.additionalDMGOptions || {};
  const icon = opts.icon ? { icon: opts.icon } : {};

  const spec = {
    ...additionalDMGOptions,
    title: opts.title || opts.productName || opts.name,
    contents: opts.contents,
    'icon-size': opts['icon-size'],
    background: opts.background,
    format: opts.format,
    ...icon,
  };

  const specContents = JSON.stringify(spec, null, 2);

  debug('DMG spec is:\n', spec);

  const specDir = await fs.mkdtemp(path.join(os.tmpdir(), 'electron-installer-dmg-'));
  const specPath = path.join(specDir, 'appdmg.json');
  debug('writing config to `%s`', specPath);

  await fs.writeFile(specPath, specContents);
  debug('creating dmg...');
  return new Promise((resolve, reject) => {
    appdmg({
      source: specPath,
      target: opts.dmgPath,
    }).on('progress', (info) => {
      if (info.type === 'step-begin') {
        debug('appdmg [%d/%d]: %s...', info.current, info.total, info.title);
      }
    }).on('finish', async () => {
      debug('appdmg finished!');
      debug('cleaning up temp config at `%s`', specDir);
      await fs.rmdir(specDir, { recursive: true, maxRetries: 2 });
      resolve(opts);
    }).on('error', reject);
  });
}

module.exports = async (immutableOpts) => {
  const opts = { ...immutableOpts };

  if (process.platform !== 'darwin') {
    throw new Error('Must be run on OSX');
  }
  if (!opts.background) {
    opts.background = path.resolve(__dirname, '../resources/mac/background.png');
  } else {
    opts.background = path.resolve(opts.background);
  }

  if (opts.icon) {
    opts.icon = path.resolve(opts.icon);
  }

  opts['icon-size'] = opts.iconSize || opts['icon-size'] || 80;
  opts.out = opts.out || process.cwd();

  if (!opts.appPath || typeof opts.appPath !== 'string') {
    throw new Error('opts.appPath must be defined as a string');
  }

  opts.appPath = path.resolve(process.cwd(), opts.appPath);

  if (opts.dmgPath && typeof opts.dmgPath !== 'string') {
    throw new Error(`Expected opts.dmgPath to be a string but it was "${typeof opts.dmgPath}"`);
  }

  if (!opts.dmgPath && (!opts.out || typeof opts.out !== 'string')) {
    throw new Error('Either opts.dmgPath or opts.out must be defined as a string');
  }

  if (!opts.dmgPath && (!opts.name || typeof opts.name !== 'string')) {
    throw new Error('opts.name must be defined as a string');
  }

  opts.dmgPath = path.resolve(opts.dmgPath || path.join(opts.out, `${opts.name}.dmg`));

  await fs.mkdir(path.dirname(opts.dmgPath), { recursive: true });
  opts.format = opts.format || 'UDZO';

  opts.contents = opts.contents || [
    {
      x: 448,
      y: 344,
      type: 'link',
      path: '/Applications',
    },
    {
      x: 192,
      y: 344,
      type: 'file',
      path: opts.appPath,
    },
  ];

  if (typeof opts.contents === 'function') {
    opts.contents = opts.contents(opts);
  }

  if (existsSync(opts.dmgPath)) {
    if (!opts.overwrite) {
      debug('DMG already exists at `%s` and overwrite is false', opts.dmgPath);
      const msg = `DMG already exists.  Run electron-installer-dmg again with \
\`--overwrite\` or remove the file and rerun. ${opts.dmgPath}`;
      throw new Error(msg);
    } else {
      debug('DMG already exists at `%s`.  Removing...', opts.dmgPath);
      await fs.unlink(opts.dmgPath);
    }
  }

  return build(opts);
};
