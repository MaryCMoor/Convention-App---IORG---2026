import { useState } from 'react';
import { X, Edit, Eye, BarChart2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Download, ClipboardList, Search, Filter, Calendar, Tag, AlertCircle } from 'lucide-react';

const TestComponent = () => {
  const [viewSurvey, setViewSurvey] = useState({
    title: 'Test Survey',
    description: 'Test Description',
    type: 'Feedback',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    anonymous: false,
    requiredCompletion: false,
    questions: [
      { text: 'Q1', type: 'text', required: true },
      { text: 'Q2', type: 'choice', required: false, options: ['a', 'b'] }
    ]
  });

  const getStatusClass = (s) => ({
    draft: 'status-draft', active: 'status-active', 
    closed: 'status-closed', archived: 'status-archived'
  }[s] || 'status-draft');

  return (
    <div>
      {viewSurvey && (
        <div className="modal-overlay" onClick={() => setViewSurvey(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Survey Details</h2>
              <button className="modal-close" onClick={() => setViewSurvey(null)}}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="view-grid">
                <div className="view-section">
                  <h4>Survey Info</h4>
                  <dl>
                    <dt>Title</dt><dd>{viewSurvey.title}</dd>
                    <dt>Description</dt><dd>{viewSurvey.description || '—'}</dd>
                    <dt>Type</dt><dd><span className="type-badge">{viewSurvey.type}</span></dd>
                    <dt>Status</dt>
                    <dd>
                      <span className={'status-badge ' + getStatusClass(viewSurvey.status)}>
                        {viewSurvey.status}
                      </span>
                    </dd>
                  </dl>
                </div>
                <div className="view-section">
                  <h4>Settings</h4>
                  <dl>
                    <dt>Start Date</dt><dd>{viewSurvey.startDate ? new Date(viewSurvey.startDate).toLocaleDateString() : '—'}</dd>
                    <dt>End Date</dt><dd>{viewSurvey.endDate ? new Date(viewSurvey.endDate).toLocaleDateString() : '—'}</dd>
                    <dt>Anonymous</dt><dd>{viewSurvey.anonymous ? 'Yes' : 'No'}</dd>
                    <dt>Required Completion</dt><dd>{viewSurvey.requiredCompletion ? 'Yes' : 'No'}</dd>
                  </dl>
                </div>
                {(viewSurvey.questions || []).length > 0 && (
                  <div className="view-section full-width">
                    <h4>Questions ({(viewSurvey.questions || []).length})</h4>
                    <div className="questions-preview">
                      {(viewSurvey.questions || []).map((q, i) => (
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setViewSurvey(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setViewSurvey(null); }}>
                <Edit size={16} /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestComponent;