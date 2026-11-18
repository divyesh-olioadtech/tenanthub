// Our source imports end in ".js" (ESM style) but the real files are ".ts".
// Remap a relative "./x.js" to "./x.ts" ONLY when that .ts file exists, so
// imports inside node_modules are left alone.
const fs = require('node:fs');
const path = require('node:path');

module.exports = (request, options) => {
  if (/^\.{1,2}\//.test(request) && request.endsWith('.js')) {
    const ts = path.resolve(options.basedir, request.slice(0, -3) + '.ts');
    if (fs.existsSync(ts)) return ts;
  }
  return options.defaultResolver(request, options);
};
