import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const styleMap = {
  RED: { color: "red" },
  UNDERLINE: { textDecoration: "underline" },
  HEADING: { fontSize: "1.6em", fontWeight: "bold" },
};

const MarkdownEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    const savedContent = localStorage.getItem("markdownEditorContent");
    if (savedContent) {
      const content = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(content));
    }
  }, []);

  const handleBeforeInput = (char) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (text === "*" && char === " ") {
      applyStyleAndClearPattern("BOLD", "*");
      return "handled";
    } else if (text === "**" && char === " ") {
      applyStyleAndClearPattern("RED", "**");
      return "handled";
    } else if (text === "***" && char === " ") {
      applyStyleAndClearPattern("UNDERLINE", "***");
      return "handled";
    } else if (text === "#" && char === " ") {
      applyStyleAndClearPattern("HEADING", "#");
      return "handled";
    }

    return "not-handled";
  };

  const applyStyleAndClearPattern = (style, pattern) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = currentContent.getBlockForKey(selection.getStartKey());

    const start = block.getText().indexOf(pattern);
    const end = start + pattern.length;

  
    const contentStateWithoutPattern = Modifier.removeRange(
      currentContent,
      selection.merge({
        anchorOffset: start,
        focusOffset: end,
      }),
      "backward"
    );

    const newEditorState = EditorState.push(
      editorState,
      contentStateWithoutPattern,
      "remove-range"
    );

    setEditorState(RichUtils.toggleInlineStyle(newEditorState, style));
  };

  const handleSave = () => {
    const content = editorState.getCurrentContent();
    const rawContent = convertToRaw(content);
    localStorage.setItem("markdownEditorContent", JSON.stringify(rawContent));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-2">Markdown Editor</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 float-right"
        >
          Save
        </button>
      </div>
      <div className="border border-gray-300 p-4 min-h-[400px] rounded" style={{border:"2px solid grey",padding:"100px"}}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          style={{border:"2px solid grey",padding:"100px"}}
        />
      </div>
      <div className="mt-2">
        <p className="text-gray-700">
          Type '** ' (double asterisks followed by a space) to apply red color,
          '*** ' (triple asterisks) for underline, and '# ' for heading.
        </p>
      </div>
    </div>
  );
};

export default MarkdownEditor;
