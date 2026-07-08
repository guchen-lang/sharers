import { describe, it, expect } from 'vitest';
import { indexToLineCol, extractPositionFromErrorMessage } from './jsonWorkerUtils';

describe('jsonWorkerUtils', () => {
  it('indexToLineCol basic', () => {
    const text = 'line1\nline2\nline3';
    expect(indexToLineCol(text, 0)).toEqual({ line: 1, column: 1 });
    expect(indexToLineCol(text, 5)).toEqual({ line: 1, column: 6 });
    expect(indexToLineCol(text, 6)).toEqual({ line: 2, column: 1 });
    expect(indexToLineCol(text, text.length)).toEqual({ line: 3, column: 6 });
  });

  it('extractPositionFromErrorMessage finds position', () => {
    expect(extractPositionFromErrorMessage('Unexpected token } in JSON at position 123')).toBe(123);
    expect(extractPositionFromErrorMessage('SyntaxError: position 45')).toBe(45);
    expect(extractPositionFromErrorMessage('Error at char 67')).toBe(67);
    expect(extractPositionFromErrorMessage('some random text 89 end')).toBe(89);
    expect(extractPositionFromErrorMessage('no numbers here')).toBeUndefined();
  });
});
