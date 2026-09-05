import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Key
} from 'lucide-react';
import { PolicyConfig } from '../types.js';
import { updatePolicies } from '../services/api.js';

interface SettingsViewProps {
  policy: PolicyConfig | null;
  onPolicyUpdated: (newPolicy: PolicyConfig) => void;
  razorpayKeyPreview: string;
  isLiveTestCredentials: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  policy,
  onPolicyUpdated,
  razorpayKeyPreview,
  isLiveTestCredentials
}) => {
  const [maxBudget, setMaxBudget] = useState(policy?.max_campaign_budget || 10000);
  const [maxAudience, setMaxAudience] = useState(policy?.max_audience || 100);
  const [maxDiscount, setMaxDiscount] = useState(policy?.max_discount_percent || 10);
  const [maxDuration, setMaxDuration] = useState(policy?.max_duration_days || 7);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await updatePolicies({
        max_campaign_budget: maxBudget,
        max_audience: maxAudience,
        max_discount_percent: maxDiscount,
        max_duration_days: maxDuration
      });

      onPolicyUpdated(res.policy);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update policy:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Deterministic Policy Guardrails &amp; Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hard bounds enforced by deterministic code. <strong className="text-white">AI agents cannot alter, bypass, or override these limits.</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Merchant Guardrails Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Merchant Risk Boundaries
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Deterministic Code
            </span>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Maximum Campaign Budget (₹)
              </label>
              <input
                type="number"
                min={1000}
                max={50000}
                step={500}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Any proposal requesting more than ₹{maxBudget.toLocaleString('en-IN')} will be immediately rejected by the Verifier Agent.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Maximum Audience Size (Recipients)
              </label>
              <input
                type="number"
                min={10}
                max={500}
                step={10}
                value={maxAudience}
                onChange={(e) => setMaxAudience(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Caps the maximum number of recipients in a single campaign run.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Maximum Discount Percentage (%)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                step={1}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Absolute incentive ceiling (e.g. 10%). Protects merchant unit economics.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Maximum Campaign Lifespan (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Time limit for coupon redemption to ensure urgency and predictability.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Guardrails saved!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Enforced on all agent runs
                </span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Update Guardrails'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Razorpay & AI Sandbox Environment Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Razorpay Test Mode Integration
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono space-y-1 text-slate-300">
                <div className="text-slate-400 text-[11px]">Key ID Status:</div>
                <div className="text-emerald-400 font-bold">{razorpayKeyPreview}</div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Credentials are strictly kept server-side in container environment variables.
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Razorpay Test Mode provides a sandboxed environment where all payments, orders, and payment links simulate realistic lifecycle transitions without transferring real money.
              </p>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                <span className="font-bold">Sandbox Safe Guarantee:</span>
                <p>
                  Zero financial liability. All test requests use Razorpay test credentials or native synthetic order generation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Key className="w-4 h-4 text-indigo-400" />
              Gemini Multi-Agent System
            </h3>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                Powered by Gemini models running on the backend with structured outputs and deterministic schema validation.
              </p>
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-600/30 text-indigo-300 text-[11px]">
                <strong className="block mb-0.5 text-white">Zero Autonomous Actions:</strong>
                All operations must navigate the Verifier Agent, Policy Engine, and Merchant Approval Gate before reaching the Razorpay executor.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
