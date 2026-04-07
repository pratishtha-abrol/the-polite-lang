#!/usr/bin/env node

// Interpreter and CLI for the polite language

import fs from 'node:fs';
import { tokenize } from '../lexer/index.js';
import { parse } from '../parser/index.js';

// Simple symbol table for variables
export class SymbolTable {
  constructor(initial = undefined) {
    this.table = initial ?? Object.create(null);
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
    case 'BinaryExpression': {
      const left = evaluateExpression(expr.left, symbols);
      const right = evaluateExpression(expr.right, symbols);
      switch (expr.operator) {
        case 'PLUS':
          return Number(left) + Number(right);
        case 'MINUS':
          return Number(left) - Number(right);
        case 'STAR':
          return Number(left) * Number(right);
        case 'SLASH':
          return Number(left) / Number(right);
        case 'PERCENT':
          return Number(left) % Number(right);
        case 'LESS':
          return left < right;
        case 'LESS_EQUAL':
          return left <= right;
        case 'GREATER':
          return left > right;
        case 'GREATER_EQUAL':
          return left >= right;
        case 'EQUAL_EQUAL':
          return left === right;
        case 'NOT_EQUAL':
          return left !== right;
        default:
          throw new Error(`Unknown binary operator: ${expr.operator}`);
      }
    }
    default:
      throw new Error(`Unknown expression type: ${expr.type}`);
  }
}

export function run(ast, output = s => process.stdout.write(s), symbols = new SymbolTable()) {
  const block = ast.block;
  for (const stmt of block.statements) {
    if (stmt.type === 'PrintStatement') {
      const value = evaluateExpression(stmt.expression, symbols);
      output(String(value) + '\n');
    } else if (stmt.type === 'AssignmentStatement') {
      const value = evaluateExpression(stmt.expression, symbols);
      symbols.define(stmt.name, value);
    } else if (stmt.type === 'IfStatement') {
      const cond = evaluateExpression(stmt.condition, symbols);
      const blockToRun = cond ? stmt.thenBlock : stmt.elseBlock;
      if (blockToRun) {
        for (const inner of blockToRun.statements) {
          run({ block: { statements: [inner] } }, output, symbols);
        }
      }
    } else if (stmt.type === 'WhileStatement') {
      // Run body while condition is truthy
      while (true) {
        const cond = evaluateExpression(stmt.condition, symbols);
        if (!cond) break;
        for (const inner of stmt.body.statements) {
          run({ block: { statements: [inner] } }, output, symbols);
        }
      }
    } else if (stmt.type === 'ForStatement') {
      const fromVal = evaluateExpression(stmt.from, symbols);
      const toVal = evaluateExpression(stmt.to, symbols);
      const stepVal = evaluateExpression(stmt.step, symbols);

      const step = Number(stepVal) || 1;
      const start = Number(fromVal);
      const end = Number(toVal);

      if (step === 0) {
        throw new Error('Error: for loop step cannot be 0');
      }

      if (step > 0) {
        for (let i = start; i <= end; i += step) {
          symbols.define(stmt.iterator, i);
          for (const inner of stmt.body.statements) {
            run({ block: { statements: [inner] } }, output, symbols);
          }
        }
      } else {
        for (let i = start; i >= end; i += step) {
          symbols.define(stmt.iterator, i);
          for (const inner of stmt.body.statements) {
            run({ block: { statements: [inner] } }, output, symbols);
          }
        }
      }
    } else {
      throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }
  return symbols.table;
}

export function interpret(source, output, symbols = new SymbolTable()) {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  return run(ast, output, symbols);
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , maybeFile] = process.argv;

  function usage() {
    console.error('Usage: polite <file.polite>');
    console.error('       polite --help');
  }

  if (!maybeFile || maybeFile === '--help' || maybeFile === '-h') {
    usage();
    process.exit(maybeFile ? 0 : 1);
  }

  const filePath = maybeFile;
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const src = fs.readFileSync(filePath, 'utf8');
    interpret(src);
  } catch (err) {
    console.error(String(err.message || err));
    process.exit(1);
  }
}
