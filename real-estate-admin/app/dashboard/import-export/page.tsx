'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Download, Upload, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface ImportResult {
  logId: string;
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  hasErrors: boolean;
}

interface Log {
  _id: string;
  type: string;
  format: string;
  performedBy: { name: string };
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  exportedCount: number;
  createdAt: string;
}

export default function ImportExportPage() {
  const [tab, setTab]           = useState<'import' | 'export' | 'logs'>('export');
  const [logs, setLogs]         = useState<Log[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPages, setLogsPages] = useState(1);
  const [logsLoading, setLogsLoading] = useState(false);

  // Export state
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportStatus, setExportStatus] = useState('');
  const [exportSource, setExportSource] = useState('');
  const [exportStart, setExportStart]   = useState('');
  const [exportEnd, setExportEnd]       = useState('');
  const [exportLimit, setExportLimit]   = useState('');
  const [exporting, setExporting]       = useState(false);

  // Import state
  const [importFile, setImportFile]     = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState('csv');
  const [onDuplicate, setOnDuplicate]   = useState('skip');
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchLogs = async (p = 1) => {
    setLogsLoading(true);
    try {
      const res = await api.get(`/admin/import-export/logs?page=${p}&limit=15`);
      setLogs(res.data.data.logs);
      setLogsTotal(res.data.data.total);
      setLogsPages(res.data.data.pages);
      setLogsPage(p);
    } catch {}
    finally { setLogsLoading(false); }
  };

  useEffect(() => { if (tab === 'logs') fetchLogs(1); }, [tab]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.post('/admin/import-export/export', {
        format: exportFormat,
        status: exportStatus || undefined,
        source: exportSource || undefined,
        startDate: exportStart || undefined,
        endDate:   exportEnd   || undefined,
        limit:     exportLimit || undefined,
      }, { responseType: 'blob' });

      const ext  = exportFormat === 'excel' ? 'xlsx' : 'csv';
      const url  = URL.createObjectURL(new Blob([res.data]));
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `properties-export-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const handleDownloadTemplate = async (format: string) => {
    try {
      const res = await api.get(`/admin/import-export/template/${format}`, { responseType: 'blob' });
      const ext  = format === 'excel' ? 'xlsx' : 'csv';
      const url  = URL.createObjectURL(new Blob([res.data]));
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `property-template.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download template'); }
  };

  const handleImport = async () => {
    if (!importFile) return toast.error('Please select a file');
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      fd.append('onDuplicate', onDuplicate);
      const res = await api.post('/admin/import-export/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data.data);
      toast.success('Import completed');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Import failed'); }
    finally { setImporting(false); }
  };

  const handleDownloadErrors = async (logId: string, format = 'csv') => {
    try {
      const res = await api.get(`/admin/import-export/logs/${logId}/errors?format=${format}`, { responseType: 'blob' });
      const ext = format === 'json' ? 'json' : 'csv';
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `import-errors-${logId}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('No errors to download'); }
  };

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Import / Export</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['export','import','logs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {t === 'logs' ? 'History' : t}
          </button>
        ))}
      </div>

      {/* ── EXPORT ── */}
      {tab === 'export' && (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Export Properties</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className={input}>
                <option value="csv">CSV</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
              <select value={exportStatus} onChange={e => setExportStatus(e.target.value)} className={input}>
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Filter</label>
              <select value={exportSource} onChange={e => setExportSource(e.target.value)} className={input}>
                <option value="">All Sources</option>
                <option value="marketplace">Marketplace</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit (optional)</label>
              <input type="number" value={exportLimit} onChange={e => setExportLimit(e.target.value)} className={input} placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={exportStart} onChange={e => setExportStart(e.target.value)} className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)} className={input} />
            </div>
          </div>

          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Download size={16} /> {exporting ? 'Exporting...' : 'Export Now'}
          </button>
        </div>
      )}

      {/* ── IMPORT ── */}
      {tab === 'import' && (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-4">
          <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Import Properties</h2>

          {/* Template download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Download Sample Template</p>
              <p className="text-xs text-blue-500">Use this template to prepare your import file</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDownloadTemplate('csv')} className="text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">CSV</button>
              <button onClick={() => handleDownloadTemplate('excel')} className="text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">Excel</button>
              <button onClick={() => handleDownloadTemplate('json')} className="text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">JSON</button>
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File (CSV or Excel)</label>
            <div onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setImportFile(f); }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
              {importFile ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText size={20} />
                  <span className="text-sm font-medium">{importFile.name}</span>
                  <span className="text-xs text-gray-400">({(importFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click or drag & drop CSV, Excel, or JSON file</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={e => setImportFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">On Duplicate</label>
            <select value={onDuplicate} onChange={e => setOnDuplicate(e.target.value)} className={input}>
              <option value="skip">Skip (keep existing)</option>
              <option value="update">Update existing</option>
            </select>
          </div>

          <button onClick={handleImport} disabled={importing || !importFile}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
            <Upload size={16} /> {importing ? 'Importing...' : 'Start Import'}
          </button>

          {/* Import Result */}
          {importResult && (
            <div className="border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-700">Import Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">{importResult.totalRows}</p>
                  <p className="text-xs text-gray-500">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-xs text-green-500">Imported</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{importResult.updated}</p>
                  <p className="text-xs text-blue-500">Updated</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{importResult.skipped}</p>
                  <p className="text-xs text-yellow-500">Skipped</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                  <p className="text-xs text-red-500">Failed</p>
                </div>
              </div>
              {importResult.hasErrors && (
                <div className="flex gap-3">
                  <button onClick={() => handleDownloadErrors(importResult.logId, 'csv')}
                    className="flex items-center gap-2 text-sm text-red-600 hover:underline">
                    <Download size={14} /> Error Report (CSV)
                  </button>
                  <button onClick={() => handleDownloadErrors(importResult.logId, 'json')}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:underline">
                    <Download size={14} /> Error Report (JSON)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LOGS ── */}
      {tab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {logsLoading ? <div className="text-center py-10 text-gray-400">Loading...</div> :
            logs.length === 0 ? <div className="text-center py-10 text-gray-400">No history yet.</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Format</th>
                  <th className="px-4 py-3 text-left">By</th>
                  <th className="px-4 py-3 text-left">Results</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.type === 'import' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 uppercase text-xs">{log.format}</td>
                    <td className="px-4 py-3 text-gray-600">{log.performedBy?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {log.type === 'import' ? (
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-600">✓{log.imported}</span>
                          <span className="text-blue-600">↑{log.updated}</span>
                          <span className="text-yellow-600">–{log.skipped}</span>
                          {log.failed > 0 && <span className="text-red-600">✗{log.failed}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-600">{log.exportedCount} rows</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {log.type === 'import' && log.failed > 0 && (
                        <div className="flex gap-2">
                          <button onClick={() => handleDownloadErrors(log._id, 'csv')} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                            <Download size={12} /> CSV
                          </button>
                          <button onClick={() => handleDownloadErrors(log._id, 'json')} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                            <Download size={12} /> JSON
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="px-4 pb-4">
            <Pagination page={logsPage} pages={logsPages} onPageChange={fetchLogs} />
          </div>
        </div>
      )}
    </div>
  );
}
