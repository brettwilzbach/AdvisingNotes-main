import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Trash2, Clock, GraduationCap, FileDown, Plus, Check, Database } from 'lucide-react';
import TimeTracker from './components/TimeTracker';
import CRMRecords, { ClientRecord } from './components/CRMRecords';
import { generateSessionNotesPDF } from './pdfUtils';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'Suzanne' | 'Student' | 'Parent/Guardian';
}

interface NotesData {
  studentName: string;
  date: string;
  conversationPoints: string;
  topicsCovered: string;
  goals: string;
  actionItems: ChecklistItem[];
}

function App() {
  const [currentView, setCurrentView] = useState<'notes' | 'timetracker' | 'crm'>('notes');
  const [clientRecords, setClientRecords] = useState<ClientRecord[]>(() => {
    const saved = localStorage.getItem('stwClientRecords');
    return saved ? JSON.parse(saved) : [];
  });
  const [notesData, setNotesData] = useState<NotesData>(() => {
    const savedNotes = localStorage.getItem('stwNotesData');
    return savedNotes ? JSON.parse(savedNotes) : {
      studentName: '',
      date: new Date().toISOString().split('T')[0],
      conversationPoints: '',
      topicsCovered: '',
      goals: '',
      actionItems: []
    };
  });
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const printRef = useRef<HTMLDivElement>(null);

  const addActionItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      assignedTo: 'Student'
    };
    setNotesData((prev: NotesData) => ({
      ...prev,
      actionItems: [...prev.actionItems, newItem]
    }));
  };

  const updateActionItem = (id: string, field: 'text' | 'completed' | 'assignedTo', value: string | boolean) => {
    setNotesData((prev: NotesData) => ({
      ...prev,
      actionItems: prev.actionItems.map((item: ChecklistItem) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const deleteActionItem = (id: string) => {
    setNotesData((prev: NotesData) => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== id)
    }));
  };

  // Save notes to localStorage
  const saveNotes = () => {
    setSaveStatus('saving');
    localStorage.setItem('stwNotesData', JSON.stringify(notesData));
    setTimeout(() => setSaveStatus('saved'), 1000); // Show saved status for 1 second
  };
  
  // Auto-save when navigating away from notes
  const handleViewChange = (view: 'notes' | 'timetracker' | 'crm') => {
    if (currentView === 'notes' && view !== 'notes') {
      saveNotes();
    }
    setCurrentView(view);
  };
  
  // Set unsaved status when notes data changes
  useEffect(() => {
    if (saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
  }, [notesData]);

  const deleteRecord = (id: string) => {
    const updatedRecords = clientRecords.filter((record: ClientRecord) => record.id !== id);
    setClientRecords(updatedRecords);
    localStorage.setItem('stwClientRecords', JSON.stringify(updatedRecords));
  };

  const saveInvoiceRecord = (clientName: string, fileName: string, invoiceData: any) => {
    const newRecord: ClientRecord = {
      id: Date.now().toString(),
      type: 'invoice',
      clientName: clientName || 'Unknown Client',
      date: new Date().toISOString().split('T')[0],
      fileName: fileName,
      invoiceData: {
        totalHours: invoiceData.totalHours,
        totalAmount: invoiceData.totalAmount,
        hourlyRate: invoiceData.hourlyRate,
        entries: invoiceData.entries
      },
      createdAt: new Date().toISOString()
    };
    
    const updatedRecords = [...clientRecords, newRecord];
    setClientRecords(updatedRecords);
    localStorage.setItem('stwClientRecords', JSON.stringify(updatedRecords));
  };

  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation with data:', notesData);
      const { fileName } = await generateSessionNotesPDF(notesData);
      console.log('PDF generated successfully with filename:', fileName);
      // keep existing CRM save logic exactly as is
      const newRecord: ClientRecord = {
      id: Date.now().toString(),
      type: "session-notes",
      clientName: notesData.studentName || "Unknown Student",
      date: notesData.date,
      fileName,
      sessionData: {
        conversationPoints: notesData.conversationPoints,
        topicsCovered: notesData.topicsCovered,
        goals: notesData.goals,
        actionItems: notesData.actionItems.length
      },
      createdAt: new Date().toISOString()
    };
    const updatedRecords = [...clientRecords, newRecord];
    setClientRecords(updatedRecords);
    localStorage.setItem("stwClientRecords", JSON.stringify(updatedRecords));
    console.log('CRM record saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please check the console for details.');
    }
  };

  if (currentView === 'timetracker') {
    return <TimeTracker onBack={() => handleViewChange('notes')} onSaveInvoice={saveInvoiceRecord} />;
  }

  if (currentView === 'crm') {
    return <CRMRecords onBack={() => handleViewChange('notes')} records={clientRecords} onDeleteRecord={deleteRecord} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-64 h-48 flex items-center justify-center">
                  <img src="/STW_LOGO.JPG" alt="STW College Consulting" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleViewChange('crm')}
                className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <Database size={18} />
                Client Records ({clientRecords.length})
              </button>
              <button
                onClick={() => handleViewChange('timetracker')}
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <Clock size={18} />
                Time Tracker
              </button>
              <button
                onClick={saveNotes}
                className={`${saveStatus === 'saved' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : saveStatus === 'saving' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm`}
              >
                {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={generatePDF}
                className="bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-950 hover:to-blue-900 text-white px-8 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <FileDown size={18} />
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={printRef} className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* PDF Header - Only visible in PDF */}
          <div className="pdf-only bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8" style={{display: 'none'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold" style={{fontFamily: 'Georgia, serif'}}>STW College Consulting</h1>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-300 uppercase tracking-wider font-semibold">Session Notes</div>
                <div className="text-2xl font-light">{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Student Information Card */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-8 mb-10 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={notesData.studentName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNotesData((prev: NotesData) => ({ ...prev, studentName: e.target.value }))}
                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all duration-200 font-medium text-slate-800 bg-white"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={notesData.date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNotesData((prev: NotesData) => ({ ...prev, date: e.target.value }))}
                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all duration-200 font-medium text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Conversation Points */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>Conversation Points</h2>
              </div>
              <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-1">
                <textarea
                  value={notesData.conversationPoints}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotesData((prev: NotesData) => ({ ...prev, conversationPoints: e.target.value }))}
                  className="w-full p-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-900/30 resize-none bg-white text-slate-700 leading-relaxed"
                  rows={3}
                  placeholder="Key discussion points and insights from today's session..."
                />
              </div>
            </div>

            {/* Topics Covered */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>Topics Covered</h2>
              </div>
              <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-1">
                <textarea
                  value={notesData.topicsCovered}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotesData((prev: NotesData) => ({ ...prev, topicsCovered: e.target.value }))}
                  className="w-full p-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-900/30 resize-none bg-white text-slate-700 leading-relaxed"
                  rows={3}
                  placeholder="List the main topics and subjects discussed during this session..."
                />
              </div>
            </div>

            {/* Goals */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>Goals</h2>
              </div>
              <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-1">
                <textarea
                  value={notesData.goals}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotesData((prev: NotesData) => ({ ...prev, goals: e.target.value }))}
                  className="w-full p-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-900/30 resize-none bg-white text-slate-700 leading-relaxed"
                  rows={3}
                  placeholder="Document the goals and objectives established during this session..."
                />
              </div>
            </div>

            {/* Action Items */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>Action Items</h2>
                </div>
                <button 
                  onClick={addActionItem}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {notesData.actionItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <button
                          onClick={() => updateActionItem(item.id, 'completed', !item.completed)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${item.completed ? 'bg-green-600 text-white' : 'border-2 border-slate-300'}`}
                        >
                          {item.completed && <Check size={14} />}
                        </button>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateActionItem(item.id, 'text', e.target.value)}
                          className={`w-full p-1 border-b border-slate-200 focus:border-blue-500 focus:ring-0 ${item.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}
                          placeholder="Describe the action item..."
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <select
                            value={item.assignedTo}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => updateActionItem(item.id, 'assignedTo', e.target.value as 'Suzanne' | 'Student' | 'Parent/Guardian')}
                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-700"
                          >
                            <option value="Suzanne">Assigned to: Suzanne</option>
                            <option value="Student">Assigned to: Student</option>
                            <option value="Parent/Guardian">Assigned to: Parent/Guardian</option>
                          </select>
                          <button
                            onClick={() => deleteActionItem(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {notesData.actionItems.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-1" style={{fontFamily: 'Georgia, serif'}}>No Action Items Yet</h3>
                    <p className="text-slate-400 text-sm mt-1" style={{fontFamily: 'Georgia, serif'}}>Click "Add Item" to create your first action item</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          .edit-only { 
            display: none !important; 
          }
          .pdf-only {
            display: block !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            padding: 8px 0 !important;
            font-weight: 500 !important;
          }
          input:focus, textarea:focus {
            ring: none !important;
          }
          .bg-gradient-to-r,
          .bg-gradient-to-b,
          .bg-gradient-to-br {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
