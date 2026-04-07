# the-polite-lang (tpl)

A tiny esoteric programming language where every program is framed by polite words.

- Blocks start with `please` and end with `thank you`.
- Inside a block you can declare variables with `let` and print values with `print`.
- The reference CLI speaks in polite commands: `please run <file>`, `please show version`, etc.

This repo contains a small but complete implementation: lexer → parser → AST → interpreter → CLI.

---

## Language overview

### Grammar (current)

Informal grammar for a single-block program:

```text
program           → statement_block

statement_block   → "please" statement_list "thank you"

statement_list    → statement
                   | statement statement_list

statement         → print_statement
                   | assignment_statement

print_statement   → "print" expression

assignment_statement → "let" identifier "=" expression

expression        → string
                   | number
                   | identifier
```

### Semantics

- `let name = value` evaluates `value` and stores it in a symbol table under `name`.
- `print expr` evaluates `expr` and prints the result followed by a newline.
- `expr` can be:
  - a string literal, e.g. `"Hello"`
  - a number literal, e.g. `42`
  - an identifier, which looks up a previously `let`-bound variable

If you reference a variable that has not been defined, you’ll get a clear error:

```text
Error: Undefined variable 'x'
```

### Example: simplest program

`examples/hello.polite`:

```tpl
please
  let x = 42
  print x
thank you
```

Output:

```text
42
```

### Example: string variables and reuse

`examples/variables.polite`:

```tpl
please
  let greeting = "Hello"
  let target = "world"
  print greeting
  print target
thank you
```

Output:

```text
Hello
world
```

### Example: multiple statements in one block

`examples/multi-statements.polite`:

```tpl
please
  let x = 1
  let y = 2
  print x
  print y
  print x
thank you
```

Output:

```text
1
2
1
```

### Example: polite while loop

`examples/while.polite`:

```tpl
please
  let i = 0
  kindly while i < 3
    print i
    let i = i + 1
  end while
thank you
```

Output:

```text
0
1
2
```

### Example: polite if/otherwise

`examples/if.polite`:

```tpl
please
  let x = 2
  kindly if x == 2
    print "x is two"
  otherwise
    print "x is not two"
  end if
thank you
```

Output:

```text
x is two
```

---

## Project structure

The codebase is intentionally small and organized into clear phases of compilation/execution:

```text
cmd/
  main.js           # CLI entry point (the `tpl` command)

lexer/
  index.js          # Tokenizer for the polite language

parser/
  ast.js            # AST node constructors
  index.js          # Parser: tokens → AST

interpreter/
  index.js          # Interpreter: AST → execution (with symbol table)

examples/
  hello.polite
  variables.polite
  multi-statements.polite

polite.test.js      # Small test suite
package.json
README.md
LICENSE
```

### Components

- **Lexer (`lexer/index.js`)**
  - Exposes `TokenType` and `tokenize(source)`.
  - Skips whitespace and produces tokens for:
    - keywords: `please`, `thank you`, `print`, `let`
    - identifiers
    - string literals with basic escapes
    - number literals
    - equals sign (`=`)

- **AST (`parser/ast.js`)**
  - Node constructors like `Program`, `StatementBlock`, `PrintStatement`, `AssignmentStatement`, `StringLiteral`, `NumberLiteral`, `Identifier`.

- **Parser (`parser/index.js`)**
  - Consumes tokens and returns a `Program` AST.
  - Enforces polite framing:
    - Missing `please` → `Error: Expected 'please' at start of block`
    - Missing `thank you` → `Error: Expected 'thank you' at end of block`

- **Interpreter (`interpreter/index.js`)**
  - Traverses the AST and executes statements.
  - Uses a `SymbolTable` class to store variables and report undefined-variable errors.

- **CLI (`cmd/main.js`)**
  - Implements the `tpl` command with polite subcommands.

---

## CLI usage (developer ergonomics)

The CLI is exposed as `tpl` via `package.json`:

```json
"bin": { "tpl": "./cmd/main.js" }
```

You can run it directly with Node, or install it globally.

### Commands

All commands start with `please`:

```bash
tpl please run <file>     # Execute a file
tpl please run shell      # Interactive shell
tpl please show version   # Show version
tpl please help           # Show help
```

#### `please run <file>` – Execute a file

```bash
tpl please run examples/hello.polite
```

This reads the file, lexes, parses, executes it, and prints any output.

If the file does not exist you’ll see something like:

```text
Error: File not found: examples/missing.polite
```

#### `please run shell` – Interactive shell

```bash
tpl please run shell
```

Starts a simple REPL:

```text
tpl shell - type a single polite block and press Enter. Ctrl+C to exit.
tpl> please let x = 5 print x thank you
5
tpl>
```

Each line is treated as a complete program. This is intended as a quick playground rather than a full multi-line REPL.

#### `please show version` – Show version

```bash
tpl please show version
```

Prints:

```text
tpl version 0.1.0
```

#### `please help` – Show usage page

```bash
tpl please help
```

Prints a short help page summarizing the commands:

```text
Commands:
  please run <file>     Execute a file
  please run shell      Interactive shell
  please show version   Show version
  please help           Show this help page
```

---

## Running tests

There is a tiny test script that sanity-checks printing and variable reuse:

```bash
npm test

# or directly
node polite.test.js
```

The tests drive the interpreter programmatically (not via the CLI) and ensure:
- strings print correctly,
- numeric variables can be assigned with `let` and reused by name.

---

## Installing / developing locally

Clone and install dependencies (there are no runtime deps beyond Node itself):

```bash
git clone https://github.com/pratishtha-abrol/the-polite-lang.git
cd the-polite-lang
npm install   # currently just sets up package metadata
```

Run the examples via the CLI:

```bash
node cmd/main.js please run examples/hello.polite
node cmd/main.js please run examples/variables.polite
node cmd/main.js please run examples/multi-statements.polite
```

Optionally, install globally for a `tpl` binary on your PATH:

```bash
npm install -g .
tpl please run examples/hello.polite
```

---

## Design notes

- The goal is to explore a language whose *structure and tooling* are framed by politeness (`please`, `thank you`).
- The implementation is intentionally small and readable:
  - hand-written lexer
  - hand-written recursive-descent parser
  - simple AST and interpreter
  - light CLI wrapper
- Error messages are phrased to be explicit and helpful:
  - `Error: Expected 'please' at start of block`
  - `Error: Expected 'thank you' at end of block`
  - `Error: Undefined variable 'x'`

This should be a friendly base if you’d like to extend the language with more polite constructs (conditionals, loops, multiple blocks, etc.).
