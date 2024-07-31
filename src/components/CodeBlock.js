// src/components/CodeBlock.js
import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Importing the style for code highlighting

const CodeBlock = ({ code, language }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="code-block">
      <pre>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <button onClick={handleCopy} className="copy-button bg-blue-500 text-white p-1 rounded-md mt-2">
        Copy
      </button>
    </div>
  );
};

export default CodeBlock;
