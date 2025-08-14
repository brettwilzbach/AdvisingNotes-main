import { useState, useRef } from 'react';
import { Clock, Plus, Trash2, FileDown, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  rate: number;
  total: number;
}

interface TimeTrackerProps {
  onBack: () => void;
  onSaveInvoice: (clientName: string, fileName: string, invoiceData: any) => void;
}

export default function TimeTracker({ onBack, onSaveInvoice }: TimeTrackerProps) {
  const [clientName, setClientName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(150);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diff = endTime.getTime() - startTime.getTime();
    return Math.max(0, diff / (1000 * 60 * 60));
  };

  const addEntry = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      hours: 0,
      description: '',
      rate: hourlyRate,
      total: 0
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof TimeEntry, value: any) => {
    setTimeEntries(entries => entries.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        
        if (field === 'startTime' || field === 'endTime') {
          updated.hours = calculateHours(updated.startTime, updated.endTime);
          updated.total = updated.hours * updated.rate;
        }
        
        if (field === 'rate' || field === 'hours') {
          updated.total = updated.hours * updated.rate;
        }
        
        return updated;
      }
      return entry;
    }));
  };

  const deleteEntry = (id: string) => {
    setTimeEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalAmount = timeEntries.reduce((sum, entry) => sum + entry.total, 0);

  const generatePDF = async () => {
    if (!printRef.current) return;

    const element = printRef.current;
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    const buttons = clonedElement.querySelectorAll('button');
    buttons.forEach(button => button.remove());
    
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.background = 'white';
    clonedElement.style.width = '800px';
    document.body.appendChild(clonedElement);
    
    try {
      const canvas = await html2canvas(clonedElement, {
        width: 800,
        height: clonedElement.scrollHeight,
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      const fileName = `invoice-${clientName.replace(/\s+/g, '-').toLowerCase() || 'client'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Save to CRM records
      onSaveInvoice(clientName, fileName, {
        totalHours,
        totalAmount,
        hourlyRate,
        entries: timeEntries.length
      });
    } finally {
      document.body.removeChild(clonedElement);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional STW Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              {/* STW Logo */}
              <div className="flex items-center">
                <div className="w-64 h-48 flex items-center justify-center">
                  <img src="/STW_LOGO.JPG" alt="STW College Consulting" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
            <button
              onClick={generatePDF}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <FileDown size={18} />
              Generate Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div ref={printRef} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          
          {/* STW Invoice Header - Blue and Gold Theme */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-200">
                  <img src="/STW_LOGO.JPG" alt="STW Logo" className="w-28 h-28 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{fontFamily: 'Georgia, serif'}}>STW College Consulting</h1>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white uppercase tracking-wider font-semibold" style={{fontFamily: 'Georgia, serif'}}>Invoice Date</div>
                <div className="text-2xl font-light text-white" style={{fontFamily: 'Georgia, serif'}}>{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
            </div>
          </div>

          <div className="p-10">

            {/* Client Info - Blue Theme */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 mb-10 border-2 border-blue-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium text-blue-900 bg-white"
                    style={{fontFamily: 'Georgia, serif'}}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide" style={{fontFamily: 'Georgia, serif'}}>
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium text-blue-900 bg-white"
                    style={{fontFamily: 'Georgia, serif'}}
                    placeholder="150"
                  />
                </div>
              </div>
            </div>

            {/* Time Entries - Blue and Gold Theme */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-blue-800" style={{fontFamily: 'Georgia, serif'}}>Time Entries</h2>
                </div>
                <button
                  onClick={addEntry}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  style={{fontFamily: 'Georgia, serif'}}
                >
                  <Plus size={16} />
                  Add Entry
                </button>
              </div>

              <div className="bg-blue-50/30 rounded-lg border border-blue-200 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Date</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Start Time</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">End Time</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Hours</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Description</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Rate</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Total</th>
                        <th className="border border-slate-300 p-4 text-left font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeEntries.map((entry) => (
                        <tr key={entry.id} className="bg-white hover:bg-slate-50">
                          <td className="border border-slate-300 p-3">
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-slate-700"
                            />
                          </td>
                          <td className="border border-slate-300 p-3">
                            <input
                              type="time"
                              value={entry.startTime}
                              onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-slate-700"
                            />
                          </td>
                          <td className="border border-slate-300 p-3">
                            <input
                              type="time"
                              value={entry.endTime}
                              onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-slate-700"
                            />
                          </td>
                          <td className="border border-slate-300 p-3 text-center font-medium text-slate-700">
                            {entry.hours.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-3">
                            <input
                              type="text"
                              value={entry.description}
                              onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-slate-700"
                              placeholder="Session description"
                            />
                          </td>
                          <td className="border border-slate-300 p-3">
                            <input
                              type="number"
                              value={entry.rate}
                              onChange={(e) => updateEntry(entry.id, 'rate', Number(e.target.value))}
                              className="w-20 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-slate-700"
                            />
                          </td>
                          <td className="border border-slate-300 p-3 text-right font-semibold text-slate-800">
                            ${entry.total.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-3 text-center">
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {timeEntries.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No time entries yet</p>
                    <p className="text-slate-400 text-sm mt-1">Click "Add Entry" to create your first time entry</p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="border-t border-blue-200 pt-8">
              <div className="flex justify-end">
                <div className="w-80 bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex justify-between py-3 border-b border-blue-200">
                    <span className="font-semibold text-blue-800" style={{fontFamily: 'Georgia, serif'}}>Total Hours:</span>
                    <span className="font-medium text-blue-900" style={{fontFamily: 'Georgia, serif'}}>{totalHours.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-4 text-xl font-bold text-blue-900" style={{fontFamily: 'Georgia, serif'}}>
                    <span>Total Amount:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}