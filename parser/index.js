// Parser for the polite language

import { TokenType, tokenize } from '../lexer/index.js';
import {
  Program,
  StatementBlock,
  PrintStatement,
  AssignmentStatement,
   IfStatement,
   WhileStatement,
  ForStatement,
  StringLiteral,
  NumberLiteral,
  Identifier,
  BinaryExpression,
} from './ast.js';

export function parse(source) {
  const tokens = Array.isArray(source) ? source : tokenize(source);
  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume(expectedType) {
    const t = tokens[pos];
    if (!t || t.type === TokenType.EOF) {
      throw new Error(`Expected ${expectedType}, got EOF`);
    }
    if (t.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, got ${t.type}`);
    }
    pos++;
    return t;
  }

  function expectToken(expectedType, friendlyMessage) {
    const t = tokens[pos];
    if (!t || t.type === TokenType.EOF) {
      throw new Error(friendlyMessage || `Expected ${expectedType}, got EOF`);
    }
    if (t.type !== expectedType) {
      throw new Error(friendlyMessage || `Expected ${expectedType}, got ${t.type}`);
    }
    pos++;
    return t;
  }

  // Expression grammar with precedence:
  // expression     → equality
  // equality       → comparison ( ("==" | "!=") comparison )*
  // comparison     → term ( ("<" | "<=" | ">" | ">=") term )*
  // term           → factor ( ("+" | "-") factor )*
  // factor         → primary ( ("*" | "/") primary )*
  // primary        → STRING | NUMBER | IDENTIFIER

  function parsePrimary() {
    const t = peek();
    if (!t || t.type === TokenType.EOF) {
      throw new Error('Expected expression, got EOF');
    }
    if (t.type === TokenType.STRING) {
      consume(TokenType.STRING);
      return StringLiteral(t.lexeme);
    }
    if (t.type === TokenType.NUMBER) {
      consume(TokenType.NUMBER);
      return NumberLiteral(t.value);
    }
    if (t.type === TokenType.IDENTIFIER) {
      consume(TokenType.IDENTIFIER);
      return Identifier(t.lexeme);
    }
    throw new Error(`Unexpected token in expression: ${t.type}`);
  }

  function parseFactor() {
    let expr = parsePrimary();
    while (true) {
      const t = peek();
      if (!t) break;
      if (t.type === TokenType.STAR || t.type === TokenType.SLASH || t.type === TokenType.PERCENT) {
        const op = consume(t.type).type;
        const right = parsePrimary();
        expr = BinaryExpression(op, expr, right);
        continue;
      }
      break;
    }
    return expr;
  }

  function parseTerm() {
    let expr = parseFactor();
    while (true) {
      const t = peek();
      if (!t) break;
      if (t.type === TokenType.PLUS || t.type === TokenType.MINUS) {
        const op = consume(t.type).type;
        const right = parseFactor();
        expr = BinaryExpression(op, expr, right);
        continue;
      }
      break;
    }
    return expr;
  }

  function parseComparison() {
    let expr = parseTerm();
    while (true) {
      const t = peek();
      if (!t) break;
      if (
        t.type === TokenType.LESS ||
        t.type === TokenType.LESS_EQUAL ||
        t.type === TokenType.GREATER ||
        t.type === TokenType.GREATER_EQUAL
      ) {
        const op = consume(t.type).type;
        const right = parseTerm();
        expr = BinaryExpression(op, expr, right);
        continue;
      }
      break;
    }
    return expr;
  }

  function parseEquality() {
    let expr = parseComparison();
    while (true) {
      const t = peek();
      if (!t) break;
      if (t.type === TokenType.EQUAL_EQUAL || t.type === TokenType.NOT_EQUAL) {
        const op = consume(t.type).type;
        const right = parseComparison();
        expr = BinaryExpression(op, expr, right);
        continue;
      }
      break;
    }
    return expr;
  }

  function parseExpression() {
    return parseEquality();
  }

  function parsePrintStatement() {
    consume(TokenType.PRINT);
    const expr = parseExpression();
    return PrintStatement(expr);
  }

  function parseAssignmentStatement() {
    consume(TokenType.LET);
    const identTok = consume(TokenType.IDENTIFIER);
    consume(TokenType.EQUAL);
    const expr = parseExpression();
    return AssignmentStatement(identTok.lexeme, expr);
  }

  function parseIfStatement() {
    // We expect: kindly if <expr> <statements> [otherwise <statements>] end if
    consume(TokenType.KINDLY);
    consume(TokenType.IF);
    const condition = parseExpression();

    const thenStatements = [];
    while (true) {
      const t = peek();
      if (!t || t.type === TokenType.EOF) {
        throw new Error("Error: Expected 'end if' before end of input");
      }
      if (t.type === TokenType.OTHERWISE || t.type === TokenType.END) break;
      thenStatements.push(parseStatement());
    }

    let elseStatements = null;
    if (peek().type === TokenType.OTHERWISE) {
      consume(TokenType.OTHERWISE);
      elseStatements = [];
      while (true) {
        const t = peek();
        if (!t || t.type === TokenType.EOF) {
          throw new Error("Error: Expected 'end if' before end of input");
        }
        if (t.type === TokenType.END) break;
        elseStatements.push(parseStatement());
      }
    }

    expectToken(TokenType.END, "Error: Expected 'end if' before end of input");
    expectToken(TokenType.IF, "Error: Expected 'end if' to close if-statement");

    const thenBlock = StatementBlock(thenStatements);
    const elseBlock = elseStatements ? StatementBlock(elseStatements) : null;
    return IfStatement(condition, thenBlock, elseBlock);
  }

  function parseWhileStatement() {
    // We expect: kindly while <expr> <statements> end while
    consume(TokenType.KINDLY);
    consume(TokenType.WHILE);
    const condition = parseExpression();

    const bodyStatements = [];
    while (true) {
      const t = peek();
      if (!t || t.type === TokenType.EOF) {
        throw new Error("Error: Expected 'end while' before end of input");
      }
      if (t.type === TokenType.END) break;
      bodyStatements.push(parseStatement());
    }

    expectToken(TokenType.END, "Error: Expected 'end while' before end of input");
    expectToken(TokenType.WHILE, "Error: Expected 'end while' to close while-loop");
    const bodyBlock = StatementBlock(bodyStatements);
    return WhileStatement(condition, bodyBlock);
  }

  function parseForStatement() {
    // kindly for i from 0 to 10 [step 2]
    consume(TokenType.KINDLY);
    consume(TokenType.FOR);
    const identTok = consume(TokenType.IDENTIFIER);
    consume(TokenType.FROM);
    const fromExpr = parseExpression();
    consume(TokenType.TO);
    const toExpr = parseExpression();

    let stepExpr = NumberLiteral(1);
    if (peek() && peek().type === TokenType.STEP) {
      consume(TokenType.STEP);
      stepExpr = parseExpression();
    }

    const bodyStatements = [];
    while (true) {
      const t = peek();
      if (!t || t.type === TokenType.EOF) {
        throw new Error("Error: Expected 'end for' before end of input");
      }
      if (t.type === TokenType.END) break;
      bodyStatements.push(parseStatement());
    }

    expectToken(TokenType.END, "Error: Expected 'end for' before end of input");
    expectToken(TokenType.FOR, "Error: Expected 'end for' to close for-loop");
    const bodyBlock = StatementBlock(bodyStatements);
    return ForStatement(identTok.lexeme, fromExpr, toExpr, stepExpr, bodyBlock);
  }

  function parseStatement() {
    const t = peek();
    if (!t || t.type === TokenType.EOF) {
      throw new Error('Unexpected end of input in statement');
    }
    if (t.type === TokenType.PRINT) return parsePrintStatement();
    if (t.type === TokenType.LET) return parseAssignmentStatement();
    if (t.type === TokenType.KINDLY) {
      const next = tokens[pos + 1];
      if (next && next.type === TokenType.IF) return parseIfStatement();
      if (next && next.type === TokenType.WHILE) return parseWhileStatement();
      if (next && next.type === TokenType.FOR) return parseForStatement();
      throw new Error("Error: Expected 'if', 'while', or 'for' after 'kindly'");
    }
    throw new Error(`Unexpected token at start of statement: ${t.type}`);
  }

  function parseStatementList() {
    const statements = [];
    while (true) {
      const t = peek();
      if (!t || t.type === TokenType.EOF) break;
      if (t.type === TokenType.THANK_YOU) break;
      statements.push(parseStatement());
    }
    if (statements.length === 0) {
      throw new Error('Expected at least one statement inside please/thank you block');
    }
    return statements;
  }

  function parseStatementBlock() {
    const first = peek();
    if (!first || first.type !== TokenType.PLEASE) {
      throw new Error("Error: Expected 'please' at start of block");
    }
    consume(TokenType.PLEASE);
    const statements = parseStatementList();
    const end = peek();
    if (!end || end.type !== TokenType.THANK_YOU) {
      throw new Error("Error: Expected 'thank you' at end of block");
    }
    consume(TokenType.THANK_YOU);
    return StatementBlock(statements);
  }

  function parseProgram() {
    const block = parseStatementBlock();
    const end = peek();
    if (end && end.type !== TokenType.EOF) {
      throw new Error('Unexpected tokens after end of program');
    }
    return Program(block);
  }

  return parseProgram();
}
