import { useState } from 'react';

const TestComponent = () => {
  const questions = [
    { text: 'Q1', type: 'text', required: true, options: ['a', 'b'] },
    { text: 'Q2', type: 'choice', required: false, options: ['x', 'y'] }
  ];

  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} className="question-preview">
          <div className="question-preview-header">
            <span className="question-number">Q{i + 1}</span>
            <span className="question-type">{q.type}</span>
            {q.required && <span className="required-tag">Required</span>}
          </div>
          <div className="question-preview-text">{q.text}</div>
          {q.options && q.options.length > 0 && (
            <div className="question-preview-options">
              {q.options.map((opt, oi) => <span key={oi} className="option-tag">{opt}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestComponent;