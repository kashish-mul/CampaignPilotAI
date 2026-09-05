import React from 'react';
import { 
  IndianRupee, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  UserX, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Eye, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { MerchantStats, Opportunity } from '../types.js';

interface DashboardViewProps {
  stats: MerchantStats | null;
  opportunities: Opportunity[];
  onViewEvidence: (opportunity: Opportunity) => void;
  onCreateCampaign: (opportunity: Opportunity) => void;
  onNavigateToPipeline: () => void;
  onRefreshOpportunities: () => void;
  isAnalyzing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  opportunities,
  onViewEvidence,
  onCreateCampaign,
  onNavigateToPipeline,
  onRefreshOpportunities,
  isAnalyzing
}) => {
  const topOpportunity = opportunities.find(o => o.type === 'win_back') || opportunities[0];

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Pitch */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Revenue Optimization Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            CampaignPilot AI
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            An explainable, self-verifying AI agent that discovers merchant revenue opportunities, proposes bounded campaigns, obtains merchant approval, executes approved actions through <strong className="text-emerald-300 font-semibold">Razorpay Test Mode</strong>, and records every decision in an auditable trail.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onRefreshOpportunities}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Merchant Data...' : 'Find Growth Opportunities'}</span>
            </button>
            <button
              onClick={onNavigateToPipeline}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-600 transition"
            >
              <span>View Multi-Agent Architecture</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Merchant Core KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Merchant Metrics
          </h2>
          <span className="text-xs text-slate-400">
            Synchronized from Synthetic Merchant Store Dataset
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              ₹{stats ? stats.revenue.toLocaleString('en-IN') : '4,82,500'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>Healthy GMV baseline</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Customers</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {stats ? stats.customersCount.toLocaleString('en-IN') : '1,248'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Registered buyers
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Transactions</span>
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {stats ? stats.transactionsCount.toLocaleString('en-IN') : '2,341'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Lifetime orders logged
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Failed Payments</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 tracking-tight">
              {stats ? stats.failedPaymentsCount : '87'}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">
              Recoverable drop-offs
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">At-Risk Customers</span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-400 tracking-tight">
              {stats ? stats.atRiskCustomersCount : '126'}
            </div>
            <div className="text-[11px] text-rose-300/80 mt-1">
              Inactive &gt;60 days
            </div>
          </div>
        </div>
      </div>

      {/* AI Growth Intelligence Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="text-base font-bold text-white tracking-wide">
              AI GROWTH INTELLIGENCE
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {opportunities.length} opportunities detected
          </span>
        </div>

        {/* Featured Killer Opportunity: 1. WIN-BACK */}
        {topOpportunity && (
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  1. WIN-BACK
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  🔥 High Priority
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Confidence: <strong className="text-emerald-400">{Math.round(topOpportunity.confidence * 100)}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Risk: <strong className="text-emerald-400">{topOpportunity.risk}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-2 border-y border-slate-800 my-4">
              <div>
                <div className="text-xs text-slate-400">Target Cohort</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {topOpportunity.inactive_customers} customers
                </div>
                <div className="text-xs text-slate-400">inactive &gt;60 days</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Potential Opportunity</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  ₹{topOpportunity.potential_revenue.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400">estimated GMV recovery</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Recommended Audience</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {topOpportunity.recommended_audience} customers
                </div>
                <div className="text-xs text-slate-400">bounded selection</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Maximum Incentive</div>
                <div className="text-lg font-bold text-teal-300 mt-0.5">
                  {topOpportunity.recommended_discount_percent}% discount
                </div>
                <div className="text-xs text-slate-400">bounded by merchant policy</div>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {topOpportunity.evidence_summary}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onViewEvidence(topOpportunity)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>[ VIEW EVIDENCE ]</span>
              </button>
              <button
                onClick={() => onCreateCampaign(topOpportunity)}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>[ CREATE CAMPAIGN ]</span>
              </button>
              <span className="text-xs text-slate-400 ml-auto hidden lg:inline">
                Verified against 1,248 customers &bull; 0 real money moved (Test Mode)
              </span>
            </div>
          </div>
        )}

        {/* Secondary Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {opportunities.filter(o => o.type !== 'win_back').map((opp, idx) => (
            <div key={opp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {idx + 2}. {opp.type === 'cross_sell' ? 'CROSS-SELL' : 'PAYMENT RECOVERY'}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  opp.priority === 'High' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {opp.priority === 'High' ? '⚠️ High Priority' : '💡 Medium Priority'}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{opp.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                {opp.description}
              </p>
              <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-3 text-slate-300">
                <span>Potential: <strong className="text-emerald-400 font-semibold">₹{opp.potential_revenue.toLocaleString('en-IN')}</strong></span>
                <span>Confidence: <strong className="text-white">{Math.round(opp.confidence * 100)}%</strong></span>
                <button
                  onClick={() => onCreateCampaign(opp)}
                  className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Agent Architecture Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Multi-Agent Architecture vs. Single Giant LLM
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explainable verification chain isolating analysis, campaign proposal, mathematical verification, policy bounds, and human approval.
            </p>
          </div>
          <button
            onClick={onNavigateToPipeline}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Launch Interactive Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="font-semibold text-white">1. Analyst</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Discovers Opportunity</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="font-semibold text-white">2. Campaign</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Proposes Bounds</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40">
            <div className="font-semibold text-emerald-300">3. Verifier ⭐</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Checks Ground Truth</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-600/40">
            <div className="font-semibold text-indigo-300">4. Policy 🔐</div>
            <div className="text-[10px] text-indigo-400/80 mt-0.5">Deterministic Guard</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/40">
            <div className="font-semibold text-amber-300">5. Approval 👤</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Merchant Decision</div>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-600/40">
            <div className="font-semibold text-teal-300">6. Razorpay 💳</div>
            <div className="text-[10px] text-teal-400/80 mt-0.5">Test Mode Action</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 col-span-2 sm:col-span-1">
            <div className="font-semibold text-white">7. Audit 🧾</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Immutable Trail</div>
          </div>
        </div>
      </div>
    </div>
  );
};
