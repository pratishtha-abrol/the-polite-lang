# the-polite-lang

A tiny esoteric programming language where every block starts with `please` and ends with `thank-you`.

## Language overview

- A program is one or more *blocks*.
- Each block must start with the word `please` and end with the word `thank-you` on their own lines.
- Inside a block you can currently:
  - `print "Some text"` — prints the text to standard output.
  - `let name "Some text"` — stores a string value in a variable (not yet reused in expressions, but kept in an environment).

Example program (`example.polite`):

```text
please
  print "Hello, polite world!"
thank-you
```

Running this program prints:

```text
Hello, polite world!
```

## Installing / running

This repo is a minimal Node-based implementation.

```bash
npm test           # run the tiny test
node polite.js example.polite  # run the sample program
```

If you want to install it globally as a CLI named `polite`:

```bash
npm install -g .
polite example.polite
```

## Design notes

- The goal is to demonstrate a language whose structure is literally framed by polite words.
- The implementation is intentionally small and readable: a tokenizer, a hand-written parser, and a simple interpreter.
- It should be easy to extend with new statements (e.g., conditionals, loops) that must still live inside `please` / `thank-you` blocks.
