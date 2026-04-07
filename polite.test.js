import { interpret } from './polite.js';

function capture() {
  const lines = [];
  const write = (s) => lines.push(s);
  return { lines, write };
}

// Very small sanity test for the polite language.
const src = `please
  print "Hello, polite test!"
thank-you
`;

const out = capture();
interpret(src, (s) => out.write(s));

if (out.lines.join('') !== 'Hello, polite test!\n') {
  console.error('Test failed: unexpected output', out.lines.join(''));
  process.exit(1);
}

console.log('All polite tests passed.');
