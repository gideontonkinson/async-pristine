import * as esbuild from 'esbuild'

// Unminified bundle
await esbuild.build({
  entryPoints: ['src/pristine.js'],
  bundle: true,
  minify: false,
  sourcemap: true,
  outfile: 'dist/pristine.js',
  format: 'iife',
  globalName: 'Pristine',
  target: ['es2017'],
})

// Minified bundle
await esbuild.build({
  entryPoints: ['src/pristine.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/pristine.min.js',
  format: 'iife',
  globalName: 'Pristine',
  target: ['es2017'],
})

// Minified bundle
await esbuild.build({
  entryPoints: ['src/pristine.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/pristine.cjs.js',
  format: 'cjs',
  globalName: 'Pristine',
  target: ['es2017'],
})

// Minified bundle
await esbuild.build({
  entryPoints: ['src/pristine.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/pristine.esm.js',
  format: 'esm',
  globalName: 'Pristine',
  target: ['es2017'],
})
