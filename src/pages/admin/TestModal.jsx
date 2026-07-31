import { useState } from 'react';
import { X, Eye, BarChart2 } from 'lucide-react';

const TestComponent = () => {
  const [viewResponses, setViewResponses] = useState({
    title: 'Test Survey',
    responsesCount: 5,
    completionRate: 80,
    questions: [
      { text: 'Q1', type: 'text', responses: ['a', 'b'] },
      { text: 'Q2', type: 'choice', responses: ['x'] }
    ]
  });

  return (
    <div>
      {viewResponses && (
        <div className="modal-overlay" onClick={() => setViewResponses(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Survey Responses - {viewResponses.title}</h2>
              <button className="modal-close" onClick={() => setViewResponses(null)}}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="responses-summary">
                <div className="summary-card">
                  <h4>Total Responses</h4>
                  <p className="summary-number">{viewResponses.responsesCount || 0}</p>
                </div>
                <div className="summary-card">
                  <h4>Questions</h4>
                  <p className="summary-number">{(viewResponses.questions || []).length}</p>
                </div>
                <div className="summary-card">
                  <h4>Completion Rate</h4>
                  <p className="summary-number">{(viewResponses.completionRate || 0)}%</p>
                </div>
              </div>
              <div className="responses-detail">
                {(viewResponses.questions || []).map((q, i) => (
                  <div key={i} className="response-question">
                    <h5>Q{i + 1}: {q.text}</h5>
                    <p className="question-type">{q.type}</p>
                    {q.responses && q.responses.length > 0 ? (
                      <div className="response-list">
                        {q.responses.map((r, ri) => <div key={ri} className="response-item">{r}</div>)}
                      </div>
                    ) : (
                      <p className="no-responses">No responses yet</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setViewResponses(null)}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;