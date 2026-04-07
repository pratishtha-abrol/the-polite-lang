import { interpret } from './interpreter/index.js';

function capture() {
  const lines = [];
  const write = (s) => lines.push(s);
  return { lines, write };
}

// Very small sanity tests for the polite language.

// 1. Simple print of a string
let src = `please
  print "Hello, polite test!"
thank you
`;

let out = capture();
interpret(src, (s) => out.write(s));

if (out.lines.join('') !== 'Hello, polite test!\n') {
  console.error('Test 1 failed: unexpected output', out.lines.join(''));
  process.exit(1);
}

// 2. Let assignment and identifier expression
src = `please
  let x = 42
  print x
thank you
`;

out = capture();
interpret(src, (s) => out.write(s));

if (out.lines.join('') !== '42\n') {
  console.error('Test 2 failed: unexpected output', out.lines.join(''));
  process.exit(1);
}

console.log('All polite tests passed.');
