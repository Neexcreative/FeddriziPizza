import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const errors = [];
const required = [
  '<!DOCTYPE html>',
  'name="viewport"',
  'name="description"',
  'id="main"',
  'id="checkoutForm"',
  'aria-live="polite"'
];

for (const marker of required) {
  if (!html.includes(marker)) errors.push(`Missing required marker: ${marker}`);
}

const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) errors.push('Inline application script was not found.');
else {
  try { new vm.Script(script); }
  catch (error) { errors.push(`JavaScript syntax error: ${error.message}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Validation passed: document structure and JavaScript syntax are valid.');
