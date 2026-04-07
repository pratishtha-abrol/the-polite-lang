// Lexer for the polite language

export const TokenType = {
  PLEASE: 'PLEASE',
  THANK_YOU: 'THANK_YOU',
  PRINT: 'PRINT',
  LET: 'LET',
  KINDLY: 'KINDLY',
  IF: 'IF',
  OTHERWISE: 'OTHERWISE',
  END: 'END',
  WHILE: 'WHILE',
  FOR: 'FOR',
  FROM: 'FROM',
  TO: 'TO',
  STEP: 'STEP',
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  EQUAL: 'EQUAL',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  LESS: 'LESS',
  GREATER: 'GREATER',
  LESS_EQUAL: 'LESS_EQUAL',
  GREATER_EQUAL: 'GREATER_EQUAL',
  EQUAL_EQUAL: 'EQUAL_EQUAL',
  NOT_EQUAL: 'NOT_EQUAL',
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
      case 'kindly':
        return { type: TokenType.KINDLY, lexeme: text };
      case 'if':
        return { type: TokenType.IF, lexeme: text };
      case 'otherwise':
        return { type: TokenType.OTHERWISE, lexeme: text };
      case 'end':
        return { type: TokenType.END, lexeme: text };
      case 'while':
        return { type: TokenType.WHILE, lexeme: text };
      case 'for':
        return { type: TokenType.FOR, lexeme: text };
      case 'from':
        return { type: TokenType.FROM, lexeme: text };
      case 'to':
        return { type: TokenType.TO, lexeme: text };
      case 'step':
        return { type: TokenType.STEP, lexeme: text };
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
      if (!this.isAtEnd() && this.peek() === '=') {
        this.advance();
        return { type: TokenType.EQUAL_EQUAL, lexeme: '==' };
      }
      return { type: TokenType.EQUAL, lexeme: '=' };
    }
    if (c === '!') {
      if (!this.isAtEnd() && this.peek() === '=') {
        this.advance();
        return { type: TokenType.NOT_EQUAL, lexeme: '!=' };
      }
      throw new Error('Unexpected character: !');
    }
    if (c === '<') {
      if (!this.isAtEnd() && this.peek() === '=') {
        this.advance();
        return { type: TokenType.LESS_EQUAL, lexeme: '<=' };
      }
      return { type: TokenType.LESS, lexeme: '<' };
    }
    if (c === '>') {
      if (!this.isAtEnd() && this.peek() === '=') {
        this.advance();
        return { type: TokenType.GREATER_EQUAL, lexeme: '>=' };
      }
      return { type: TokenType.GREATER, lexeme: '>' };
    }
    if (c === '+') return { type: TokenType.PLUS, lexeme: '+' };
    if (c === '-') return { type: TokenType.MINUS, lexeme: '-' };
    if (c === '*') return { type: TokenType.STAR, lexeme: '*' };
    if (c === '/') return { type: TokenType.SLASH, lexeme: '/' };
    if (c === '%') return { type: TokenType.PERCENT, lexeme: '%' };

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
