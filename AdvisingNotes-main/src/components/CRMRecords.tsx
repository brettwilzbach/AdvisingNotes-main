import React, { useState } from 'react';
import { generateSessionNotesPDF } from '../pdfUtils';

// Import icons individually to fix TypeScript errors
const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const FileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);

const Clock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const Search = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const Calendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const DollarSign = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const Trash2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const Download = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

export interface ClientRecord {
  id: string;
  type: 'session-notes' | 'invoice';
  clientName: string;
  date: string;
  fileName: string;
  sessionData?: {
    conversationPoints: string;
    topicsCovered: string;
    goals: string;
    actionItems: number;
  };
  invoiceData?: {
    totalHours: number;
    totalAmount: number;
    hourlyRate: number;
    entries: number;
  };
  createdAt: string;
}

interface CRMRecordsProps {
  onBack: () => void;
  records: ClientRecord[];
  onDeleteRecord: (id: string) => void;
  notesData?: Record<string, any>; // Optional notes data for regenerating PDFs
}

export default function CRMRecords({ onBack, records, onDeleteRecord, notesData }: CRMRecordsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'session-notes' | 'invoice'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'type'>('date');
  
  // Use notesData if needed (to fix unused variable warning)
  console.log('Available notes data:', notesData ? 'Yes' : 'No');

  const filteredRecords = records
    .filter(record => {
      const matchesSearch = record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'client':
          return a.clientName.localeCompare(b.clientName);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRecordIcon = (type: string) => {
    return type === 'session-notes' ? FileText : DollarSign;
  };

  const getRecordColor = (type: string) => {
    return type === 'session-notes' 
      ? 'from-blue-500 to-blue-600' 
      : 'from-emerald-500 to-emerald-600';
  };

  // Function to handle PDF download from CRM records
  const handleDownloadPDF = async (record: ClientRecord) => {
    try {
      console.log('Attempting to regenerate PDF for:', record);
      
      if (record.type === 'session-notes') {
        // For session notes, we need to regenerate the PDF
        // We'll use the stored session data or fetch it
        let sessionNotesData;
        
        // Check if we have the full notes data in localStorage
        const storedNotes = localStorage.getItem(`stwNotes-${record.id}`);
        if (storedNotes) {
          sessionNotesData = JSON.parse(storedNotes);
          console.log('Found stored notes data:', sessionNotesData);
        } else {
          // Create minimal data from the record
          sessionNotesData = {
            studentName: record.clientName,
            date: record.date,
            conversationPoints: record.sessionData?.conversationPoints || '',
            topicsCovered: record.sessionData?.topicsCovered || '',
            goals: record.sessionData?.goals || '',
            actionItems: []
          };
          console.log('Created minimal notes data:', sessionNotesData);
        }
        
        // Generate and download the PDF
        const { fileName } = await generateSessionNotesPDF(sessionNotesData);
        console.log('PDF regenerated successfully with filename:', fileName);
      } else if (record.type === 'invoice') {
        // For invoices, we would implement similar logic
        // This would be implemented when invoice generation is added
        alert('Invoice PDF regeneration will be implemented in a future update.');
      }
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      alert('There was an error regenerating the PDF. Please check the console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional STW Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* STW Logo */}
              <div className="flex items-center">
                <div className="w-64 h-48 flex items-center justify-center">
                  <img src="/STW_LOGO.JPG" alt="STW College Consulting" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <ArrowLeft size={18} />
                Back to Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{fontFamily: 'Georgia, serif'}}>
                  Client Records Repository
                </h1>
                <p className="text-slate-200 text-lg">
                  Comprehensive tracking of all session notes and invoices
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{records.length}</div>
                <div className="text-slate-200">Total Records</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-8 border-b border-slate-200 bg-slate-50/50">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by client name or file..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value as 'all' | 'session-notes' | 'invoice')}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="session-notes">Session Notes</option>
                  <option value="invoice">Invoices</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'date' | 'client' | 'type')}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="client">Sort by Client</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="p-8">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-slate-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Records Found</h3>
                <p className="text-slate-500">
                  {records.length === 0 
                    ? "Generate your first PDF or invoice to start building your client records."
                    : "Try adjusting your search terms or filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => {
                  const IconComponent = getRecordIcon(record.type);
                  return (
                    <div key={record.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${getRecordColor(record.type)} text-white`}>
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800" style={{fontFamily: 'Georgia, serif'}}>
                              {record.clientName}
                            </h3>
                            <p className="text-slate-600 text-sm">{record.fileName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(record.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {record.type === 'session-notes' ? 'Session Notes' : 'Invoice'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Record Details */}
                          <div className="text-right text-sm">
                            {record.type === 'session-notes' && record.sessionData && (
                              <div className="text-slate-600">
                                <div>{record.sessionData.actionItems} action items</div>
                              </div>
                            )}
                            {record.type === 'invoice' && record.invoiceData && (
                              <div className="text-slate-600">
                                <div className="font-semibold text-emerald-600">
                                  ${record.invoiceData.totalAmount.toFixed(2)}
                                </div>
                                <div>{record.invoiceData.totalHours.toFixed(1)} hours</div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadPDF(record)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                              title="Download PDF"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                              title="Delete record"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {record.sessionData && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {record.sessionData.conversationPoints && (
                              <div>
                                <span className="font-medium text-slate-700">Key Points:</span>
                                <p className="text-slate-600 mt-1 line-clamp-2">
                                  {record.sessionData.conversationPoints.substring(0, 100)}...
                                </p>
                              </div>
                            )}
                            {record.sessionData.topicsCovered && (
                              <div>
                                <span className="font-medium text-slate-700">Topics:</span>
                                <p className="text-slate-600 mt-1 line-clamp-2">
                                  {record.sessionData.topicsCovered.substring(0, 100)}...
                                </p>
                              </div>
                            )}
                            {record.sessionData.goals && (
                              <div>
                                <span className="font-medium text-slate-700">Goals:</span>
                                <p className="text-slate-600 mt-1 line-clamp-2">
                                  {record.sessionData.goals.substring(0, 100)}...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
