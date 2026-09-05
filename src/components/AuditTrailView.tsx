import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ShieldCheck, 
  Bot, 
  Clock, 
  UserCheck, 
  CreditCard,
  X
} from 'lucide-react';
import { AuditEntry } from '../types.js';

interface AuditTrailViewProps {
  entries: AuditEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ entries }) => {
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(e => 
    e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.opportunity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.evidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.razorpay_reference && e.razorpay_reference.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campaignpilot_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Immutable Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete provenance and decision trace answering: <strong className="text-white">"Why did the AI do this?"</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by ID, opportunity, evidence, or Razorpay ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Audit Entries Grid / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Opportunity</th>
                <th className="py-3 px-3">Audience &amp; Budget</th>
                <th className="py-3 px-3">Verifier ⭐</th>
                <th className="py-3 px-3">Policy 🔐</th>
                <th className="py-3 px-3">Approval 👤</th>
                <th className="py-3 px-3">Execution 💳</th>
                <th className="py-3 px-4 text-right">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {filteredEntries.map((entry) => {
                const isPassed = entry.verifier === 'PASSED' && entry.policy === 'PASSED';
                return (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      {entry.id}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {entry.timestamp}
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      {entry.opportunity}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {entry.audience} users / ₹{entry.budget.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.verifier === 'PASSED' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {entry.verifier}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.policy === 'PASSED' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {entry.policy}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.merchant_approval === 'APPROVED' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {entry.merchant_approval}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.execution === 'SUCCESS' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : entry.execution === 'FAILED'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {entry.execution}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Explain &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* "Why did the AI do this?" Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {selectedEntry.id}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Why Did The AI Do This?
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete causal chain from merchant raw data to test action execution.
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Specification Card */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-2.5 text-slate-300">
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-slate-400">ID:</div>
                  <div className="text-white font-bold">{selectedEntry.id}</div>

                  <div className="text-slate-400">Timestamp:</div>
                  <div className="text-white">{selectedEntry.timestamp}</div>

                  <div className="text-slate-400">Agent:</div>
                  <div className="text-white">{selectedEntry.agent}</div>

                  <div className="text-slate-400">Opportunity:</div>
                  <div className="text-emerald-400 font-semibold">{selectedEntry.opportunity}</div>

                  <div className="text-slate-400">Evidence:</div>
                  <div className="text-slate-300">{selectedEntry.evidence}</div>

                  <div className="text-slate-400">Audience:</div>
                  <div className="text-white font-semibold">{selectedEntry.audience}</div>

                  <div className="text-slate-400">Budget:</div>
                  <div className="text-white font-semibold">₹{selectedEntry.budget.toLocaleString('en-IN')}</div>

                  <div className="text-slate-400">Maximum Discount:</div>
                  <div className="text-teal-300 font-semibold">{selectedEntry.max_discount}%</div>

                  <div className="text-slate-400">Verifier:</div>
                  <div className="text-emerald-400 font-bold">{selectedEntry.verifier}</div>

                  <div className="text-slate-400">Policy:</div>
                  <div className="text-emerald-400 font-bold">{selectedEntry.policy}</div>

                  <div className="text-slate-400">Merchant Approval:</div>
                  <div className="text-emerald-400 font-bold">{selectedEntry.merchant_approval}</div>

                  <div className="text-slate-400">Execution:</div>
                  <div className="text-emerald-400 font-bold">{selectedEntry.execution}</div>

                  <div className="text-slate-400">Razorpay Reference:</div>
                  <div className="text-emerald-300 font-bold">{selectedEntry.razorpay_reference || 'N/A'}</div>
                </div>
              </div>

              {/* Step-by-Step Causal Trace */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Complete Execution Trace
                </div>
                <div className="space-y-2 text-xs">
                  {selectedEntry.trace_steps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{step.step}</span>
                        <span className="text-[11px] font-mono text-slate-400">{step.agent_or_system}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
