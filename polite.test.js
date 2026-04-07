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

// 3. While loop
src = `please
  let i = 0
  kindly while i < 3
    print i
    let i = i + 1
  end while
thank you
`;

out = capture();
interpret(src, (s) => out.write(s));

if (out.lines.join('') !== '0\n1\n2\n') {
  console.error('Test 3 failed: unexpected output', out.lines.join(''));
  process.exit(1);
}

console.log('All control-flow tests passed.');

// 4. For loop
src = `please
  kindly for i from 0 to 4
    print i
  end for
thank you
`;

out = capture();
interpret(src, (s) => out.write(s));

if (out.lines.join('') !== '0\n1\n2\n3\n4\n') {
  console.error('Test 4 failed: unexpected output', out.lines.join(''));
  process.exit(1);
}

console.log('All for-loop tests passed.');

// 5. Modulo operator
src = `please
  let x = 5 % 2
  print x
thank you
`;

out = capture();
interpret(src, (s) => out.write(s));

if (out.lines.join('') !== '1\n') {
  console.error('Test 5 failed: unexpected output for modulo', out.lines.join(''));
  process.exit(1);
}

console.log('All modulo tests passed.');
