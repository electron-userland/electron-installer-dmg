import {expectType} from 'tsd';
import createDMG = require('.');

expectType<Promise<createDMG.DMGOptions>>(createDMG({
  appPath: '',
  name: 'my dmg',
}));

expectType<Promise<createDMG.DMGOptions>>(createDMG({
  contents: [
      { x: 448, y: 344, type: 'link', path: '/Applications' },
      { x: 192, y: 344, type: 'file', path: '/path/to/application.app' },
  ],
  appPath: '',
  name: 'my dmg',
}));

function getContents(): createDMG.Content[] {
  return [
      { x: 448, y: 344, type: 'link', path: '/Applications' },
      { x: 192, y: 344, type: 'file', path: '/path/to/application.app' },
  ];
}

expectType<Promise<createDMG.DMGOptions>>(createDMG({
  contents: getContents,
  appPath: '',
  name: 'my dmg',
}));

expectType<Promise<createDMG.DMGOptions>>(createDMG({
  appPath: '',
  format: 'UDBZ',
  additionalDMGOptions: {
      window: {
          position: { x: 100, y: 100 },
      },
  },
  name: 'my dmg',
}))
