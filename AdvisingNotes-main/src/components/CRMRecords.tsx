import { useState } from 'react';
import { ArrowLeft, FileText, Clock, Search, Calendar, DollarSign, Trash2 } from 'lucide-react';

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
}

export default function CRMRecords({ onBack, records, onDeleteRecord }: CRMRecordsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'session-notes' | 'invoice'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'type'>('date');

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="session-notes">Session Notes</option>
                  <option value="invoice">Invoices</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
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
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                            title="Delete record"
                          >
                            <Trash2 size={18} />
                          </button>
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
