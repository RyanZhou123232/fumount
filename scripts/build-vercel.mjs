import {mkdir, cp, writeFile} from 'node:fs/promises';
import {build} from 'esbuild';

// Vercel Build Output API v3: CDN assets plus a Node server function.
const output = '.vercel/output';
const fn = `${output}/functions/storefront.func`;
await mkdir(fn, {recursive: true});
await cp('dist/client', `${output}/static`, {recursive: true});
await build({
  entryPoints: ['scripts/vercel-handler.mjs'],
  outfile: `${fn}/index.mjs`,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  minify: true,
  define: {'process.env.NODE_ENV': '"production"'},
});
await writeFile(`${fn}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs22.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  maxDuration: 30,
  supportsResponseStreaming: true,
}));
await writeFile(`${output}/config.json`, JSON.stringify({
  version: 3,
  routes: [{handle: 'filesystem'}, {src: '/(.*)', dest: '/storefront'}],
}));
process.stdout.write('Vercel output ready: CDN assets and Hydrogen server function.\n');
