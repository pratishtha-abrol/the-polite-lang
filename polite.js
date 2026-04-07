#!/usr/bin/env node

// A tiny "polite" language interpreter.
// Blocks start with "please" and end with "thank-you".
// Very small feature set, just enough to demonstrate the idea.

import fs from 'node:fs';

function tokenize(source) {
  const tokens = [];
  const re = /please|thank-you|print|let|[a-zA-Z_][a-zA-Z0-9_]*|"[^"]*"|\n+|\s+|./gy;
  let m;
  while ((m = re.exec(source)) !== null) {
    const value = m[0];
    if (/^\s+$/.test(value)) continue;
    if (/^\n+$/.test(value)) { tokens.push({ type: 'NEWLINE', value }); continue; }
    if (value === 'please' || value === 'thank-you') tokens.push({ type: value.toUpperCase(), value });
    else if (value === 'print') tokens.push({ type: 'PRINT', value });
    else if (value === 'let') tokens.push({ type: 'LET', value });
    else if (/^"[^"]*"$/.test(value)) tokens.push({ type: 'STRING', value: value.slice(1, -1) });
    else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) tokens.push({ type: 'IDENT', value });
    else tokens.push({ type: 'SYMBOL', value });
  }
  return tokens;
}

function parse(tokens) {
  let pos = 0;
  function peek() { return tokens[pos]; }
  function consume(type) {
    const t = tokens[pos];
    if (!t || (type && t.type !== type)) {
      throw new Error(`Expected ${type}, got ${t ? t.type : 'EOF'}`);
    }
    pos++; return t;
  }

  function skipNewlines() {
    while (peek() && peek().type === 'NEWLINE') pos++;
  }

  function parseStatement() {
    const t = peek();
    if (!t) return null;
    if (t.type === 'PRINT') {
      consume('PRINT');
      const arg = consume('STRING');
      return { type: 'Print', value: arg.value };
    }
    if (t.type === 'LET') {
      consume('LET');
      const id = consume('IDENT');
      const value = consume('STRING');
      return { type: 'Let', name: id.value, value: value.value };
    }
    return null;
  }

  function parseBlock() {
    consume('PLEASE');
    skipNewlines();
    const body = [];
    while (peek() && peek().type !== 'THANK-YOU') {
      const stmt = parseStatement();
      if (!stmt) throw new Error('Unknown statement');
      body.push(stmt);
      skipNewlines();
    }
    consume('THANK-YOU');
    return { type: 'Block', body };
  }

  const program = [];
  skipNewlines();
  while (peek()) {
    program.push(parseBlock());
    skipNewlines();
  }
  return { type: 'Program', body: program };
}

function run(ast, output = s => process.stdout.write(s)) {
  const env = Object.create(null);
  for (const block of ast.body) {
    for (const stmt of block.body) {
      if (stmt.type === 'Print') {
        output(stmt.value + '\n');
      } else if (stmt.type === 'Let') {
        env[stmt.name] = stmt.value;
      }
    }
  }
  return env;
}

export function interpret(source, output) {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  return run(ast, output);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, file] = process.argv;
  if (!file) {
    console.error('Usage: polite <file.polite>');
    process.exit(1);
  }
  const src = fs.readFileSync(file, 'utf8');
  interpret(src);
}
