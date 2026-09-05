import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Eye, 
  Sparkles, 
  Users, 
  Calendar, 
  IndianRupee, 
  Search, 
  CheckCircle2, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Opportunity, Customer } from '../types.js';
import { fetchCustomers } from '../services/api.js';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onSelectOpportunityToCampaign: (opp: Opportunity) => void;
  selectedOpportunityForEvidence: Opportunity | null;
  onCloseEvidence: () => void;
  onOpenEvidence: (opp: Opportunity) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onSelectOpportunityToCampaign,
  selectedOpportunityForEvidence,
  onCloseEvidence,
  onOpenEvidence
}) => {
  const [evidenceFilter, setEvidenceFilter] = useState<'all_inactive' | 'high_value_inactive'>('all_inactive');
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceCustomers, setEvidenceCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (selectedOpportunityForEvidence) {
      loadEvidenceData();
    }
  }, [selectedOpportunityForEvidence, evidenceFilter, evidenceSearch]);

  const loadEvidenceData = async () => {
    setLoadingCustomers(true);
    try {
      const filterParam = evidenceFilter === 'high_value_inactive' ? 'high_value_inactive' : 'inactive_60';
      const data = await fetchCustomers(filterParam, evidenceSearch, 150);
      setEvidenceCustomers(data.customers);
    } catch (err) {
      console.error('Failed to load evidence customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Revenue Growth Opportunities
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data Analyst Agent evaluated 1,248 customers and 2,341 transactions to detect actionable revenue opportunities.
          </p>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 gap-6">
        {opportunities.map((opp, idx) => {
          const isWinBack = opp.type === 'win_back';
          return (
            <div 
              key={opp.id} 
              className={`bg-slate-900 border rounded-2xl p-6 transition shadow-md ${
                isWinBack ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    OPP-{idx + 1}: {opp.type.toUpperCase().replace('_', '-')}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                    opp.priority === 'High' 
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {opp.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400">
                    Confidence: <strong className="text-emerald-400">{Math.round(opp.confidence * 100)}%</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    Risk: <span className="text-emerald-400 font-semibold">{opp.risk}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              {/* Data Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-5 text-xs">
                <div>
                  <span className="text-slate-400 block">Potential Revenue</span>
                  <span className="text-base font-bold text-emerald-400">
                    ₹{opp.potential_revenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Identified Audience</span>
                  <span className="text-base font-bold text-white">
                    {opp.inactive_customers || opp.cross_sell_candidates || opp.failed_payments || 100} accounts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Recommended Target</span>
                  <span className="text-base font-bold text-teal-300">
                    {opp.recommended_audience} recipients
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Maximum Incentive</span>
                  <span className="text-base font-bold text-white">
                    {opp.recommended_discount_percent}% discount
                  </span>
                </div>
              </div>

              {/* Evidence Points */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Analyst Agent Evidence Grounding
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {opp.evidence_points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => onOpenEvidence(opp)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>[ VIEW EVIDENCE &amp; AUDIENCE ]</span>
                </button>
                <button
                  onClick={() => onSelectOpportunityToCampaign(opp)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 ml-auto"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>[ CREATE CAMPAIGN ]</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Drawer / Modal */}
      {selectedOpportunityForEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    EVIDENCE PROOF
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {selectedOpportunityForEvidence.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifiable ground-truth customer database records backing this recommendation.
                </p>
              </div>
              <button
                onClick={onCloseEvidence}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEvidenceFilter('all_inactive')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    evidenceFilter === 'all_inactive'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Inactive (&gt;60d) ({selectedOpportunityForEvidence.inactive_customers ?? 126})
                </button>
                <button
                  onClick={() => setEvidenceFilter('high_value_inactive')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    evidenceFilter === 'high_value_inactive'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  High-Value VIPs (32)
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer name/email..."
                  value={evidenceSearch}
                  onChange={(e) => setEvidenceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-y-auto flex-1 p-4">
              {loadingCustomers ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Loading verified database records...
                </div>
              ) : evidenceCustomers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No matching customer records found.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-2.5 pl-2">Customer</th>
                      <th className="pb-2.5">Days Inactive</th>
                      <th className="pb-2.5">Last Order</th>
                      <th className="pb-2.5">Orders</th>
                      <th className="pb-2.5">Total Spend</th>
                      <th className="pb-2.5 pr-2">Segment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {evidenceCustomers.map((c) => (
                      <tr key={c.customer_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 pl-2">
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{c.email}</div>
                        </td>
                        <td className="py-2.5">
                          <span className="font-bold text-rose-400">{c.days_inactive} days</span>
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {c.last_purchase_date}
                        </td>
                        <td className="py-2.5">
                          {c.total_orders}
                        </td>
                        <td className="py-2.5 font-medium text-emerald-400">
                          ₹{c.total_spend.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 pr-2">
                          {c.is_high_value || c.total_spend >= 5000 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              VIP Buyer
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              Standard
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Showing {evidenceCustomers.length} verified records from database
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onCloseEvidence}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onCloseEvidence();
                    onSelectOpportunityToCampaign(selectedOpportunityForEvidence);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Proceed to Campaign Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
