// Interpreter for the polite language

import fs from 'node:fs';
import { tokenize } from '../lexer/index.js';
import { parse } from '../parser/index.js';

// Simple symbol table for variables
class SymbolTable {
  constructor() {
    this.table = Object.create(null);
  }

  define(name, value) {
    this.table[name] = value;
  }

  lookup(name) {
    if (Object.prototype.hasOwnProperty.call(this.table, name)) {
      return this.table[name];
    }
    throw new Error(`Error: Undefined variable '${name}'`);
  }
}

function evaluateExpression(expr, symbols) {
  switch (expr.type) {
    case 'StringLiteral':
      return expr.value;
    case 'NumberLiteral':
      return expr.value;
    case 'Identifier': {
      return symbols.lookup(expr.name);
    }
    default:
      throw new Error(`Unknown expression type: ${expr.type}`);
  }
}

export function run(ast, output = s => process.stdout.write(s)) {
  const symbols = new SymbolTable();
  const block = ast.block;
  for (const stmt of block.statements) {
    if (stmt.type === 'PrintStatement') {
      const value = evaluateExpression(stmt.expression, symbols);
      output(String(value) + '\n');
    } else if (stmt.type === 'AssignmentStatement') {
      const value = evaluateExpression(stmt.expression, symbols);
      symbols.define(stmt.name, value);
    } else {
      throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }
  return symbols.table;
}

export function interpret(source, output) {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  return run(ast, output);
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, file] = process.argv;
  if (!file) {
    console.error('Usage: polite <file.polite>');
    process.exit(1);
  }
  const src = fs.readFileSync(file, 'utf8');
  interpret(src);
}
