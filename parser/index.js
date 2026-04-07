// Parser for the polite language

import { TokenType, tokenize } from '../lexer/index.js';
import {
  Program,
  StatementBlock,
  PrintStatement,
  AssignmentStatement,
  StringLiteral,
  NumberLiteral,
  Identifier,
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

  function parseExpression() {
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

  function parseStatement() {
    const t = peek();
    if (!t || t.type === TokenType.EOF) {
      throw new Error('Unexpected end of input in statement');
    }
    if (t.type === TokenType.PRINT) return parsePrintStatement();
    if (t.type === TokenType.LET) return parseAssignmentStatement();
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
