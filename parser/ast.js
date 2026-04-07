// AST node constructors for the polite language

export function Program(block) {
  return { type: 'Program', block };
}

export function StatementBlock(statements) {
  return { type: 'StatementBlock', statements };
}

export function PrintStatement(expression) {
  return { type: 'PrintStatement', expression };
}

export function AssignmentStatement(name, expression) {
  return { type: 'AssignmentStatement', name, expression };
}

export function IfStatement(condition, thenBlock, elseBlock = null) {
  return { type: 'IfStatement', condition, thenBlock, elseBlock };
}

export function WhileStatement(condition, body) {
  return { type: 'WhileStatement', condition, body };
}

export function ForStatement(iterator, from, to, step, body) {
  return { type: 'ForStatement', iterator, from, to, step, body };
}

export function StringLiteral(value) {
  return { type: 'StringLiteral', value };
}

export function NumberLiteral(value) {
  return { type: 'NumberLiteral', value };
}

export function Identifier(name) {
  return { type: 'Identifier', name };
}

export function BinaryExpression(operator, left, right) {
  return { type: 'BinaryExpression', operator, left, right };
}
