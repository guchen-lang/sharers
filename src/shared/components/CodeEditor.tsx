import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import type { EditorView } from '@codemirror/view';

export type CodeEditorHandle = {
  setSelection: (line: number, column?: number) => void;
  focus: () => void;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
};

const CodeEditor = forwardRef<CodeEditorHandle, Props>(({ value, onChange, readOnly = false }, ref) => {
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    setSelection(line: number, column = 1) {
      const view = viewRef.current;
      if (!view) return;
      const doc = view.state.doc;
      const l = Math.max(1, Math.min(line, doc.lines));
      const lineInfo = doc.line(l);
      const pos = Math.min(lineInfo.from + Math.max(0, column - 1), lineInfo.to);
      view.dispatch({ selection: { anchor: pos, head: pos } });
      view.focus();
    },
    focus() {
      const view = viewRef.current;
      if (!view) return;
      view.focus();
    }
  }));

  useEffect(() => {
    // keep content in sync if external changes happen
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return (
    <CodeMirror
      value={value}
      height="auto"
      extensions={[json()]}
      onCreateEditor={(view) => {
        // @ts-ignore
        viewRef.current = view;
      }}
      onChange={(val) => onChange(val)}
      editable={!readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true
      }}
      theme="light"
      style={{ minHeight: '240px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace' }}
    />
  );
});

export default CodeEditor;
