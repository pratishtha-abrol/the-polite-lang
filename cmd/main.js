#!/usr/bin/env node

// CLI entry point for the polite language (tpl)

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { interpret, SymbolTable } from '../interpreter/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

function usage() {
  console.log('Commands:');
  console.log('  please run <file>     Execute a file');
  console.log('  please run shell      Interactive shell');
  console.log('  please show version   Show version');
  console.log('  please help           Show this help page');
}

async function runFile(path) {
  if (!fs.existsSync(path)) {
    console.error(`Error: File not found: ${path}`);
    process.exit(1);
  }
  try {
    const src = fs.readFileSync(path, 'utf8');
    interpret(src);
  } catch (err) {
    console.error(String(err.message || err));
    process.exit(1);
  }
}

async function runShell() {
  console.log('tpl shell - type a polite program. End input with a blank line. Ctrl+C to exit.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const symbols = new SymbolTable();

  let buffer = '';

  function ask() {
    const prompt = buffer ? '> ' : 'tpl> ';
    rl.question(prompt, (line) => {
      const trimmed = line.trim();

      // If line is exactly 'please quit thank you', exit immediately
      if (!buffer && trimmed === 'please quit thank you') {
        rl.close();
        return;
      }

      // Accumulate multi-line program
      if (trimmed) {
        buffer += (buffer ? '\n' : '') + line;
      }

      // If we just saw a line that ends with 'thank you', treat as end of program
      if (trimmed.endsWith('thank you')) {
        const src = buffer;
        buffer = '';
        try {
          interpret(src, (s) => process.stdout.write(s), symbols);
        } catch (err) {
          console.error(String(err.message || err));
        }
      }

      ask();
    });
  }

  ask();
}

async function main(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] !== 'please') {
    usage();
    process.exit(1);
  }

  const cmd = args[1];

  if (cmd === 'run') {
    const target = args[2];
    if (!target) {
      console.error('Error: please specify a file or "shell"');
      usage();
      process.exit(1);
    }
    if (target === 'shell') {
      await runShell();
      return;
    }
    await runFile(target);
    return;
  }

  if (cmd === 'show' && args[2] === 'version') {
    console.log(`tpl version ${pkg.version}`);
    return;
  }

  if (cmd === 'help' || (cmd === 'show' && args[2] === 'help')) {
    usage();
    return;
  }

  usage();
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv);
}
