// Lexer for the polite language

export const TokenType = {
  PLEASE: 'PLEASE',
  THANK_YOU: 'THANK_YOU',
  PRINT: 'PRINT',
  LET: 'LET',
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  EQUAL: 'EQUAL',
  EOF: 'EOF',
};

class Lexer {
  constructor(source) {
    this.source = source;
    this.length = source.length;
    this.pos = 0;
  }

  isAtEnd() {
    return this.pos >= this.length;
  }

  peek() {
    return this.isAtEnd() ? '\0' : this.source[this.pos];
  }

  advance() {
    return this.source[this.pos++];
  }

  skipWhitespace() {
    while (!this.isAtEnd()) {
      const c = this.peek();
      if (c === ' ' || c === '\r' || c === '\t' || c === '\n') {
        this.advance();
      } else {
        break;
      }
    }
  }

  identifierOrKeyword() {
    let text = '';
    while (!this.isAtEnd()) {
      const c = this.peek();
      if (/[a-zA-Z_]/.test(c) || /[0-9]/.test(c)) {
        text += this.advance();
      } else {
        break;
      }
    }

    switch (text) {
      case 'please':
        return { type: TokenType.PLEASE, lexeme: text };
      case 'thank': {
        if (this.source.slice(this.pos, this.pos + 4) === ' you') {
          this.pos += 4;
        }
        return { type: TokenType.THANK_YOU, lexeme: 'thank you' };
      }
      case 'print':
        return { type: TokenType.PRINT, lexeme: text };
      case 'let':
        return { type: TokenType.LET, lexeme: text };
      default:
        return { type: TokenType.IDENTIFIER, lexeme: text };
    }
  }

  string() {
    let value = '';
    while (!this.isAtEnd() && this.peek() !== '"') {
      const c = this.advance();
      if (c === '\\' && !this.isAtEnd()) {
        const next = this.advance();
        if (next === '"') value += '"';
        else if (next === '\\') value += '\\';
        else value += c + next;
      } else {
        value += c;
      }
    }
    if (this.isAtEnd()) throw new Error('Unterminated string literal');
    this.advance();
    return { type: TokenType.STRING, lexeme: value };
  }

  number(firstDigit) {
    let text = firstDigit;
    while (!this.isAtEnd() && /[0-9]/.test(this.peek())) {
      text += this.advance();
    }
    return { type: TokenType.NUMBER, lexeme: text, value: Number(text) };
  }

  nextToken() {
    this.skipWhitespace();
    if (this.isAtEnd()) return { type: TokenType.EOF, lexeme: '' };

    const c = this.advance();

    if (/[a-zA-Z_]/.test(c)) {
      this.pos--;
      return this.identifierOrKeyword();
    }
    if (/[0-9]/.test(c)) {
      return this.number(c);
    }
    if (c === '"') {
      return this.string();
    }
    if (c === '=') {
      return { type: TokenType.EQUAL, lexeme: '=' };
    }

    throw new Error(`Unexpected character: ${c}`);
  }
}

export function tokenize(source) {
  const lexer = new Lexer(source);
  const tokens = [];
  while (true) {
    const tok = lexer.nextToken();
    tokens.push(tok);
    if (tok.type === TokenType.EOF) break;
  }
  return tokens;
}
