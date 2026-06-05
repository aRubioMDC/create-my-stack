const fs = require('fs');
const file = 'dist/index.js';
const content = fs.readFileSync(file, 'utf8');
if (!content.startsWith('#!/usr/bin/env node')) {
 fs.writeFileSync(file, '#!/usr/bin/env node\n' + content);
}
// Make the file executable
fs.chmodSync(file, '755');
console.log('Shebang added to dist/index.js');