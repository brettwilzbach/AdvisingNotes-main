import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Trash2, Clock, GraduationCap, FileDown, Plus, Check, Database } from 'lucide-react';
import jsPDF from 'jspdf';
import TimeTracker from './components/TimeTracker';
import CRMRecords, { ClientRecord } from './components/CRMRecords';

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

  const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 0;

    // STW HEADER - Windsurf Brand Guidelines
    pdf.setFillColor(0, 32, 96); // Darker brand blue #002060
    pdf.rect(0, 0, pageWidth, 40, 'F'); // Reduced height
    
    // STW Logo in white rounded box - enlarged
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, 6, 28, 28, 2, 2, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, 6, 28, 28, 2, 2, 'D');
    
    // Try to embed actual logo
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = 120;
          canvas.height = 120;
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          pdf.addImage(imgData, 'JPEG', 16.5, 7.5, 25, 25); // Enlarged logo
          resolve(null);
        };
        img.onerror = reject;
        img.src = '/STW_LOGO.JPG';
      });
    } catch (error) {
      // Fallback: STW text logo in the white box
      pdf.setTextColor(0, 32, 96);
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.text('STW', 29, 22, { align: 'center' });
    }
    
    // Company name - centered vertically, Georgia Bold white text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('times', 'bold');
    pdf.text('STW College Consulting', 52, 23);
    
    // Right-aligned SESSION NOTES and date directly below it
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('times', 'bold');
    pdf.text('SESSION NOTES', pageWidth - 15, 16, { align: 'right' });
    
    // American date format (MM/DD/YYYY) - directly under SESSION NOTES
    pdf.setFontSize(13);
    pdf.setFont('times', 'bold');
    const today = new Date();
    const americanDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    pdf.text(americanDate, pageWidth - 15, 26, { align: 'right' });

    yPos = 50;

    // STUDENT INFO SECTION - Windsurf Brand Guidelines
    pdf.setFillColor(255, 255, 255); // White background
    pdf.roundedRect(15, yPos, pageWidth - 30, 28, 3, 3, 'F');
    pdf.setDrawColor(180, 180, 180); // Light gray border
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, yPos, pageWidth - 30, 28, 3, 3, 'D');
    
    yPos += 8;
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.setFont('times', 'bold');
    pdf.text('STUDENT NAME', 20, yPos);
    pdf.text('SESSION DATE', pageWidth/2 + 5, yPos);
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal'); // Georgia regular for body text
    pdf.setTextColor(50, 50, 50);
    pdf.text(notesData.studentName || 'Not specified', 20, yPos);
    
    // Convert date to American format (MM/DD/YYYY)
    let formattedDate = 'Not specified';
    if (notesData.date) {
      const dateObj = new Date(notesData.date + 'T00:00:00'); // Add time to avoid timezone issues
      formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;
    }
    pdf.text(formattedDate, pageWidth/2 + 5, yPos);
    
    yPos += 20;

    // Section helper function - Windsurf Brand Guidelines
    const addSection = (title: string, content: string) => {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Full-width brand blue bar with rounded top corners
      pdf.setFillColor(0, 32, 96); // Darker brand blue #002060
      pdf.roundedRect(15, yPos, pageWidth - 30, 10, 3, 3, 'F');
      
      // Section title - Georgia Bold white text - larger and more to the left
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      pdf.text(title, 18, yPos + 7);
      
      yPos += 10;
      
      if (content.trim()) {
        const lines = pdf.splitTextToSize(content, pageWidth - 40);
        const contentHeight = Math.max(20, lines.length * 4.5 + 16);
        
        // Section box with light gray border and rounded corners
        pdf.setFillColor(255, 255, 255);
        pdf.rect(15, yPos, pageWidth - 30, contentHeight, 'F');
        pdf.setDrawColor(180, 180, 180); // Light gray border
        pdf.setLineWidth(0.5);
        pdf.roundedRect(15, yPos, pageWidth - 30, contentHeight, 0, 0, 'D');
        
        // Content text - Georgia regular
        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(10);
        pdf.setFont('times', 'normal');
        
        lines.forEach((line: string, index: number) => {
          pdf.text(line, 20, yPos + 12 + (index * 4.5));
        });
        yPos += contentHeight + 8; // Reduced spacing
      } else {
        // Empty state with placeholder text
        pdf.setFillColor(255, 255, 255);
        pdf.rect(15, yPos, pageWidth - 30, 16, 'F');
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(15, yPos, pageWidth - 30, 16, 0, 0, 'D');
        
        pdf.setTextColor(160, 160, 160); // Light gray italic
        pdf.setFontSize(9);
        pdf.setFont('times', 'italic');
        pdf.text('No information recorded', 20, yPos + 10);
        yPos += 24; // Reduced spacing
      }
    };

    // Page 1 content with proper spacing
    addSection('Conversation Points', notesData.conversationPoints);
    addSection('Topics Covered', notesData.topicsCovered);
    addSection('Goals', notesData.goals);
    
    // Page break for Action Items
    pdf.addPage();
    yPos = 20;
    
    // ACTION ITEMS PAGE - Windsurf Brand Guidelines
    pdf.setFillColor(0, 32, 96); // Darker brand blue #002060
    pdf.roundedRect(15, yPos, pageWidth - 30, 10, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('times', 'bold');
    pdf.text('Immediate Action Items', 20, yPos + 7);
    
    yPos += 10;
    
    if (notesData.actionItems.length > 0) {
      const validItems = notesData.actionItems.filter((item: ChecklistItem) => item.text.trim());
      const itemsHeight = Math.max(20, validItems.length * 10 + 16);
      
      pdf.setFillColor(255, 255, 255);
      pdf.rect(15, yPos, pageWidth - 30, itemsHeight, 'F');
      pdf.setDrawColor(180, 180, 180); // Light gray border
      pdf.setLineWidth(0.5);
      pdf.roundedRect(15, yPos, pageWidth - 30, itemsHeight, 0, 0, 'D');
      
      yPos += 8;
      
      validItems.forEach((item: ChecklistItem) => {
        const checkmark = item.completed ? '✓' : '○';
        // Checkbox styling
        pdf.setTextColor(item.completed ? 34 : 100, item.completed ? 197 : 100, item.completed ? 94 : 100);
        pdf.setFontSize(10);
        pdf.setFont('times', 'bold');
        pdf.text(checkmark, 20, yPos);
        
        // Action item text - Georgia regular
        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(10);
        pdf.setFont('times', 'normal');
        const lines = pdf.splitTextToSize(item.text, pageWidth - 45);
        lines.forEach((line: string, index: number) => {
          pdf.text(line, 30, yPos + (index * 4.5));
        });
        yPos += Math.max(10, lines.length * 4.5);
      });
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(15, yPos, pageWidth - 30, 16, 'F');
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(15, yPos, pageWidth - 30, 16, 0, 0, 'D');
      
      pdf.setTextColor(160, 160, 160); // Light gray italic
      pdf.setFontSize(9);
      pdf.setFont('times', 'italic');
      pdf.text('No action items recorded', 20, yPos + 10);
    }

    // Footer - Windsurf Brand Guidelines
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Thin gray divider above footer
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.3);
      pdf.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18);
      
      // Centered footer text - small italic gray
      pdf.setFontSize(8);
      pdf.setFont('times', 'italic');
      pdf.setTextColor(120, 120, 120);
      pdf.text('STW College Consulting', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Page numbers on right
      pdf.setFontSize(8);
      pdf.setFont('times', 'normal');
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }

    // Save with proper filename
    const fileName = `STW-Session-Notes-${notesData.studentName.replace(/\s+/g, '-') || 'Student'}-${notesData.date}.pdf`;
    pdf.save(fileName);
    
    // Save to CRM records
    const newRecord: ClientRecord = {
      id: Date.now().toString(),
      type: 'session-notes',
      clientName: notesData.studentName || 'Unknown Student',
      date: notesData.date,
      fileName: fileName,
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
    localStorage.setItem('stwClientRecords', JSON.stringify(updatedRecords));
  };
  
  const deleteRecord = (id: string) => {
    const updatedRecords = clientRecords.filter((record: ClientRecord) => record.id !== id);
    setClientRecords(updatedRecords);
    localStorage.setItem('stwClientRecords', JSON.stringify(updatedRecords));
  };
  
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

  if (currentView === 'timetracker') {
    return <TimeTracker onBack={() => handleViewChange('notes')} onSaveInvoice={saveInvoiceRecord} />;
  }

if (currentView === 'crm') {
  return <CRMRecords onBack={() => handleViewChange('notes')} records={clientRecords} onDeleteRecord={deleteRecord} />;
}

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
{/* Professional STW Header */}
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
              <div className="bg-blue-50/50 rounded-lg border border-blue-200 p-1">
                <textarea
                  value={notesData.topicsCovered}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotesData((prev: NotesData) => ({ ...prev, topicsCovered: e.target.value }))}
                  className="w-full p-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-900/30 resize-none bg-white text-slate-700 leading-relaxed"
                  rows={3}
                  placeholder="Academic subjects, college planning areas, or specific topics discussed..."
                />
              </div>
            </div>

            {/* Goals */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>Goals</h2>
              </div>
              <div className="bg-slate-50/30 rounded-lg border border-slate-200 p-1">
                <textarea
                  value={notesData.goals}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotesData((prev: NotesData) => ({ ...prev, goals: e.target.value }))}
                  className="w-full p-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-900/30 resize-none bg-white text-slate-700 leading-relaxed"
                  rows={3}
                  placeholder="Short-term and long-term objectives identified during the session..."
                />
              </div>
            </div>

            {/* Action Items */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>Immediate Action Items</h2>
                </div>
                <button
                  onClick={addActionItem}
                  className="bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-950 hover:to-blue-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  <Plus size={16} />
                  Add Action Item
                </button>
              </div>

              <div className="bg-blue-50/30 rounded-lg border border-blue-200 p-6">
                <div className="space-y-4">
                  {notesData.actionItems.map((item: ChecklistItem, index: number) => (
                    <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => updateActionItem(item.id, 'completed', e.currentTarget.checked)}
                              className="w-6 h-6 text-emerald-600 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
                            />
                            {item.completed && (
                              <Check size={16} className="absolute top-0.5 left-0.5 text-emerald-600 pointer-events-none" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateActionItem(item.id, 'text', e.target.value)}
                            className={`w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium ${
                              item.completed ? 'line-through text-slate-500 bg-slate-50' : 'text-slate-700 bg-white'
                            }`}
                            placeholder={`Action item ${index + 1}...`}
                          />
                        </div>
                        
                        <button
                          onClick={() => deleteActionItem(item.id)}
                          className="edit-only text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-10">
                        <span className="text-sm font-medium text-slate-600">Assigned to:</span>
                        <select
                          value={item.assignedTo}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => updateActionItem(item.id, 'assignedTo', e.target.value)}
                          className="edit-only px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          <option value="Suzanne">Suzanne</option>
                          <option value="Student">Student</option>
                          <option value="Parent/Guardian">Parent/Guardian</option>
                        </select>
                        <span className="print-only text-sm text-slate-600 font-medium">{item.assignedTo}</span>
                      </div>
                    </div>
                  ))}

                  {notesData.actionItems.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium" style={{fontFamily: 'Georgia, serif'}}>No action items yet</p>
                      <p className="text-slate-400 text-sm mt-1" style={{fontFamily: 'Georgia, serif'}}>Click "Add Item" to create your first action item</p>
                    </div>
                  )}
                </div>
              </div>
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
