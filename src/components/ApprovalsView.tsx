import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { CampaignProposal } from '../types.js';

interface ApprovalsViewProps {
  pendingCampaign: CampaignProposal | null;
  onApprove: () => void;
  onReject: () => void;
  onNavigateToPipeline: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  pendingCampaign,
  onApprove,
  onReject,
  onNavigateToPipeline
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Human Approval Gate
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Every AI campaign proposal requires explicit merchant authorization before any action or payment order can be dispatched.
        </p>
      </div>

      {pendingCampaign ? (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                PENDING MERCHANT AUTHORIZATION
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {pendingCampaign.campaign_name}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{pendingCampaign.id}</span>
          </div>

          {/* Prompt Format Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-y-2.5">
              <div className="text-slate-400">Campaign:</div>
              <div className="text-white font-semibold">{pendingCampaign.campaign_name}</div>

              <div className="text-slate-400">Audience:</div>
              <div className="text-white font-semibold">{pendingCampaign.audience_size} customers</div>

              <div className="text-slate-400">Maximum discount:</div>
              <div className="text-teal-300 font-semibold">{pendingCampaign.max_discount_percent}%</div>

              <div className="text-slate-400">Budget:</div>
              <div className="text-emerald-400 font-semibold">₹{pendingCampaign.budget_limit.toLocaleString('en-IN')}</div>

              <div className="text-slate-400">Duration:</div>
              <div className="text-white font-semibold">{pendingCampaign.duration_days} days</div>

              <div className="col-span-2 border-t border-slate-800 my-1"></div>

              <div className="text-slate-400">Expected opportunity:</div>
              <div className="text-emerald-400 font-bold">₹84,500</div>

              <div className="text-slate-400">Confidence:</div>
              <div className="text-white">91%</div>

              <div className="text-slate-400">Risk:</div>
              <div className="text-emerald-400 font-semibold">LOW</div>

              <div className="text-slate-400">Evidence:</div>
              <div className="text-slate-300">126 inactive customers verified</div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 font-sans">
              <button
                onClick={onReject}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-bold text-xs border border-slate-700 transition"
              >
                [ REJECT ]
              </button>
              <button
                onClick={onApprove}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
              >
                [ APPROVE ]
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">No Campaigns Awaiting Approval</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            All proposed campaigns have either been reviewed or none are currently in flight. You can formulate a new campaign in the Multi-Agent Pipeline.
          </p>
          <button
            onClick={onNavigateToPipeline}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm"
          >
            Launch Multi-Agent Pipeline &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
