import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  UserCheck, 
  RotateCcw,
  Play,
  Zap,
  Lock,
  Flame,
  Clock,
  ChevronDown
} from 'lucide-react';
import { 
  Opportunity, 
  CampaignProposal, 
  VerifierResult, 
  PolicyResult, 
  ExecutionRecord, 
  AuditEntry, 
  PolicyConfig 
} from '../types.js';
import { 
  createCampaignProposal, 
  verifyCampaign, 
  submitMerchantApproval, 
  executeCampaign 
} from '../services/api.js';

interface MultiAgentPipelineViewProps {
  opportunities: Opportunity[];
  activeOpportunity: Opportunity | null;
  policyConfig: PolicyConfig | null;
  onAuditUpdated: () => void;
  onViewAudit: () => void;
}

export const MultiAgentPipelineView: React.FC<MultiAgentPipelineViewProps> = ({
  opportunities,
  activeOpportunity,
  policyConfig,
  onAuditUpdated,
  onViewAudit
}) => {
  const currentOpp = activeOpportunity || opportunities[0];

  // Pipeline states
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Proposal parameters
  const [audienceSize, setAudienceSize] = useState<number>(100);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [durationDays, setDurationDays] = useState<number>(7);

  // Execution options
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  // Active records
  const [proposal, setProposal] = useState<CampaignProposal | null>(null);
  const [verifierResult, setVerifierResult] = useState<VerifierResult | null>(null);
  const [policyResult, setPolicyResult] = useState<PolicyResult | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [executionRecord, setExecutionRecord] = useState<ExecutionRecord | null>(null);
  const [auditEntry, setAuditEntry] = useState<AuditEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Preset 1: Standard Win-Back (Compliant)
  const applyStandardPreset = () => {
    setAudienceSize(100);
    setDiscountPercent(10);
    setBudgetLimit(5000);
    setDurationDays(7);
    setSimulateFailure(false);
    resetPipeline();
  };

  // Quick Preset 2: Test Policy Violation (18% Discount - Rejected by Verifier)
  const applyViolationPreset = () => {
    setAudienceSize(100);
    setDiscountPercent(18); // Exceeds 10% ceiling!
    setBudgetLimit(12000); // Exceeds ₹10k ceiling!
    setDurationDays(7);
    setSimulateFailure(false);
    resetPipeline();
  };

  // Quick Preset 3: Controlled Razorpay Failure (Circuit Breaker)
  const applyFailurePreset = () => {
    setAudienceSize(100);
    setDiscountPercent(10);
    setBudgetLimit(5000);
    setDurationDays(7);
    setSimulateFailure(true);
    resetPipeline();
  };

  const resetPipeline = () => {
    setCurrentStep(1);
    setProposal(null);
    setVerifierResult(null);
    setPolicyResult(null);
    setApprovalStatus('PENDING');
    setExecutionRecord(null);
    setAuditEntry(null);
    setErrorMessage(null);
  };

  // Step 1 -> Step 2: Run Campaign Agent
  const handleRunCampaignAgent = async () => {
    if (!currentOpp) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const generated = await createCampaignProposal({
        opportunity_id: currentOpp.id,
        custom_audience_size: audienceSize,
        custom_discount_percent: discountPercent,
        custom_duration_days: durationDays,
        custom_budget_limit: budgetLimit
      });

      setProposal(generated);
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate proposal');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2 -> Step 3: Run Verifier Agent & Deterministic Policy Engine
  const handleRunVerifierAgent = async () => {
    if (!proposal) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await verifyCampaign({
        proposal_id: proposal.id,
        proposal_override: proposal
      });

      setVerifierResult(res.verifierResult);
      setPolicyResult(res.policyResult);

      if (res.verifierResult.verdict === 'PASSED' && res.policyResult.passed) {
        setCurrentStep(3); // Proceed to Approval Gate
      } else {
        // Halt at verifier step!
        setCurrentStep(2.5); // Verifier / Policy rejection state
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification process failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Merchant Approval Decision
  const handleApprovalDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!proposal) return;
    setIsProcessing(true);

    try {
      const res = await submitMerchantApproval({
        campaign_id: proposal.id,
        decision,
        notes: decision === 'APPROVED' ? 'Authorized by store manager' : 'Declined at approval gate'
      });

      setApprovalStatus(decision);

      if (decision === 'APPROVED') {
        setCurrentStep(4); // Move to Razorpay Test Execution
      } else {
        if (res.audit_entry) setAuditEntry(res.audit_entry);
        onAuditUpdated();
        setCurrentStep(5); // Complete with rejection logged
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval submission failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 4: Execute Campaign in Razorpay Test Mode
  const handleExecuteRazorpay = async () => {
    if (!proposal) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await executeCampaign({
        campaign_id: proposal.id,
        simulate_failure: simulateFailure
      });

      setExecutionRecord(res.execution);
      setAuditEntry(res.audit);
      onAuditUpdated();
      setCurrentStep(5); // Completed
    } catch (err: any) {
      setErrorMessage(err.message || 'Execution failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Analyst & Campaign Formulation', desc: 'Converts merchant signals into bounded proposal' },
    { num: 2, title: 'Self-Verifier Agent ⭐', desc: 'Mathematical proof against raw customer data' },
    { num: 3, title: 'Human Approval Gate 👤', desc: 'Explicit merchant authorization requirement' },
    { num: 4, title: 'Razorpay Test Execution 💳', desc: 'Test Mode sandbox orders & circuit breaker' },
    { num: 5, title: 'Auditable Record 🧾', desc: 'Immutable explanation trace' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls & Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Multi-Agent Workflow Execution</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience the full LangGraph-style agent chain with explainability, self-verification, and safety gates.
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Demo Scenarios:</span>
            <button
              onClick={applyStandardPreset}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
            >
              ✅ Standard Win-Back Flow
            </button>
            <button
              onClick={applyViolationPreset}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition"
            >
              ❌ Test Policy Violation (18% Discount)
            </button>
            <button
              onClick={applyFailurePreset}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
            >
              💥 Controlled Failure &amp; Circuit Breaker
            </button>
            <button
              onClick={resetPipeline}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Reset Pipeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual LangGraph Node Steps Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-slate-800">
          {stepsList.map((step) => {
            const isCompleted = currentStep > step.num || (currentStep === 5 && step.num === 5);
            const isCurrent = Math.floor(currentStep) === step.num || (currentStep === 2.5 && step.num === 2);
            return (
              <div 
                key={step.num}
                className={`p-3 rounded-xl border text-xs transition relative ${
                  isCompleted 
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                    : isCurrent 
                    ? 'bg-slate-800 border-emerald-400/80 text-white ring-1 ring-emerald-400/30' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[11px]">0{step.num}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ) : null}
                </div>
                <div className="font-semibold text-white leading-tight">{step.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Multi-Agent Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Active Stage */}
        <div className="lg:col-span-7 space-y-6">
          {/* STAGE 1: Campaign Agent Proposal Config */}
          {currentStep === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    STAGE 1
                  </span>
                  <h3 className="font-bold text-white text-base">Campaign Agent Formulation</h3>
                </div>
                <span className="text-xs text-slate-400">Target: {currentOpp?.title}</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <div className="font-semibold text-slate-300">Ground Truth Input from Analyst Agent:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-400">
                  <div>Inactive accounts: <strong className="text-white">126</strong></div>
                  <div>VIP inactive: <strong className="text-amber-400">32</strong></div>
                  <div>Potential recovery: <strong className="text-emerald-400">₹84,500</strong></div>
                </div>
              </div>

              {/* Bounded Proposal Inputs */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Configurable Campaign Bounds
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Audience Size</span>
                      <span className="font-mono text-white font-semibold">{audienceSize} customers</span>
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={150}
                      step={10}
                      value={audienceSize}
                      onChange={(e) => setAudienceSize(Number(e.target.value))}
                      className="w-full mt-2 accent-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400">Merchant Policy Limit: 100 accounts</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Discount Percent</span>
                      <span className={`font-mono font-semibold ${discountPercent > 10 ? 'text-rose-400 font-bold' : 'text-white'}`}>
                        {discountPercent}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={25}
                      step={1}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full mt-2 accent-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Merchant Policy Limit: <strong className="text-emerald-400">10% max</strong> {discountPercent > 10 && '(Will trigger rejection)'}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Promotional Budget</span>
                      <span className="font-mono text-white font-semibold">₹{budgetLimit.toLocaleString('en-IN')}</span>
                    </label>
                    <input
                      type="range"
                      min={1000}
                      max={16000}
                      step={1000}
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(Number(e.target.value))}
                      className="w-full mt-2 accent-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400">Merchant Policy Limit: ₹10,000 max</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Campaign Lifespan</span>
                      <span className="font-mono text-white font-semibold">{durationDays} days</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={14}
                      step={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full mt-2 accent-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400">Merchant Policy Limit: 7 days max</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Step 1 of 4: Campaign proposal creation
                </span>
                <button
                  onClick={handleRunCampaignAgent}
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isProcessing ? 'Formulating...' : 'Generate Proposal & Proceed'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: Verifier Agent ⭐ Verification */}
          {(currentStep === 2 || currentStep === 2.5) && proposal && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                    STAGE 2
                  </span>
                  <h3 className="font-bold text-white text-base">Verifier Agent ⭐ &amp; Policy Engine</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{proposal.id}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  Generated Proposal Under Audit
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                  <div>Audience: <strong className="text-white">{proposal.audience_size}</strong></div>
                  <div>Discount: <strong className="text-white">{proposal.max_discount_percent}%</strong></div>
                  <div>Budget: <strong className="text-white">₹{proposal.budget_limit.toLocaleString('en-IN')}</strong></div>
                  <div>Duration: <strong className="text-white">{proposal.duration_days}d</strong></div>
                </div>
              </div>

              {!verifierResult ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-slate-300">
                    The Verifier Agent receives original transaction data + recommendation + proposal to run independent mathematical verification.
                  </p>
                  <button
                    onClick={handleRunVerifierAgent}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying Claims...' : 'Run Verifier Agent Check'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Verdict Banner */}
                  <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    verifierResult.verdict === 'PASSED'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        {verifierResult.verdict === 'PASSED' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <span className="font-bold text-sm tracking-wider uppercase">
                          VERIFICATION {verifierResult.verdict}
                        </span>
                      </div>
                      <p className="text-xs mt-1.5 leading-relaxed text-slate-200">
                        {verifierResult.explanation}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-900/80 border border-slate-700">
                      Risk: {verifierResult.risk_level}
                    </span>
                  </div>

                  {/* 5-Point Verification Checklist */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Verification Result Checklist
                    </div>
                    {[
                      verifierResult.checks.data_evidence_grounding,
                      verifierResult.checks.audience_correctness,
                      verifierResult.checks.financial_bounds,
                      verifierResult.checks.policy_compliance,
                      verifierResult.checks.reasoning_consistency
                    ].filter(Boolean).map((chk) => (
                      <div 
                        key={chk.id} 
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          chk.passed 
                            ? 'bg-slate-950/40 border-slate-800 text-slate-300' 
                            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-white">{chk.title}</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">{chk.evidence}</div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <span className={chk.passed ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                            {chk.passed ? 'PASSED ✅' : 'FAILED ❌'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* If Failed, show rejection notice */}
                  {verifierResult.verdict === 'FAILED' && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2 text-xs">
                      <div className="font-bold text-rose-400 uppercase tracking-wider">
                        ACTION: REJECTED
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        Deterministic Policy Engine intercepted non-compliant proposal. <strong className="text-white">Zero API calls made to Razorpay.</strong> Merchant boundaries strictly enforced.
                      </p>
                      <button
                        onClick={applyStandardPreset}
                        className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        Reset to Compliant Parameters
                      </button>
                    </div>
                  )}

                  {/* If Passed, proceed to human approval */}
                  {verifierResult.verdict === 'PASSED' && (
                    <div className="pt-3 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20"
                      >
                        Proceed to Merchant Approval Gate &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: Human Approval Gate 👤 */}
          {currentStep === 3 && proposal && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    STAGE 3
                  </span>
                  <h3 className="font-bold text-white text-base">Human Approval Gate</h3>
                </div>
                <span className="text-xs text-amber-400 font-semibold">Requires Authorization</span>
              </div>

              {/* Exact Human Approval Card Structure matching Prompt Specification */}
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-5 space-y-4 font-mono text-xs text-slate-300">
                <div className="text-center font-bold text-sm text-amber-300 border-b border-slate-800 pb-2">
                  CAMPAIGN REQUIRES APPROVAL
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div className="text-slate-400">Campaign:</div>
                  <div className="text-white font-semibold">Win-Back Inactive Customers</div>

                  <div className="text-slate-400">Audience:</div>
                  <div className="text-white font-semibold">{proposal.audience_size} customers</div>

                  <div className="text-slate-400">Maximum discount:</div>
                  <div className="text-teal-300 font-semibold">{proposal.max_discount_percent}%</div>

                  <div className="text-slate-400">Budget:</div>
                  <div className="text-emerald-400 font-semibold">₹{proposal.budget_limit.toLocaleString('en-IN')}</div>

                  <div className="text-slate-400">Duration:</div>
                  <div className="text-white font-semibold">{proposal.duration_days} days</div>

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
                    onClick={() => handleApprovalDecision('REJECTED')}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-bold text-xs border border-slate-700 transition"
                  >
                    [ REJECT ]
                  </button>
                  <button
                    onClick={() => handleApprovalDecision('APPROVED')}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                  >
                    [ APPROVE ]
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: Razorpay Test Mode Execution & Circuit Breaker */}
          {currentStep === 4 && proposal && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    STAGE 4
                  </span>
                  <h3 className="font-bold text-white text-base">Razorpay Test Mode Execution</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400">Approved by Merchant</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Execution Target:</span>
                  <span className="font-mono text-emerald-400 font-semibold">Razorpay Test Sandbox</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Campaign ID:</span>
                  <span className="font-mono text-white">{proposal.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Simulated Action:</span>
                  <span className="text-slate-300">Create promotional test orders &amp; discounted checkout links</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-semibold block">Simulate Gateway Failure:</span>
                    <span className="text-[11px] text-slate-400">Test circuit breaker and safe stop mechanism</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExecuteRazorpay}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessing ? 'Executing in Razorpay Test Mode...' : 'Execute Razorpay Test Action'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: Result & Audit Record */}
          {currentStep === 5 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    STAGE 5
                  </span>
                  <h3 className="font-bold text-white text-base">Execution Summary &amp; Audit Trail</h3>
                </div>
              </div>

              {/* If Failure / Circuit Breaker Tripped */}
              {executionRecord?.circuit_breaker_tripped ? (
                <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-5 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ EXECUTION FAILED (CIRCUIT BREAKER)
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs pt-2">
                    <div className="text-slate-400">Campaign:</div>
                    <div className="text-white">Win-Back Campaign</div>

                    <div className="text-slate-400">Attempts:</div>
                    <div className="text-amber-400 font-bold">{executionRecord.attempts} (Initial + 1 Retry)</div>

                    <div className="text-slate-400">Result:</div>
                    <div className="text-emerald-400 font-bold">Stopped safely</div>

                    <div className="text-slate-400">Further actions:</div>
                    <div className="text-white font-bold">NONE</div>

                    <div className="text-slate-400">Merchant approval:</div>
                    <div className="text-emerald-400 font-bold">RETAINED</div>

                    <div className="text-slate-400">Audit:</div>
                    <div className="text-emerald-400 font-bold">RECORDED</div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-2 border-t border-slate-800">
                    {executionRecord.error_message}
                  </p>
                </div>
              ) : executionRecord?.status === 'SUCCESS' ? (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    RAZORPAY TEST MODE EXECUTION SUCCESSFUL
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 font-mono text-xs pt-2">
                    <div className="text-slate-400">Razorpay Reference:</div>
                    <div className="text-emerald-400 font-bold">{executionRecord.razorpay_reference}</div>

                    <div className="text-slate-400">Discount Applied:</div>
                    <div className="text-white">{proposal?.max_discount_percent}% Voucher</div>

                    <div className="text-slate-400">Status:</div>
                    <div className="text-emerald-400 font-bold">CREATED IN TEST SANDBOX</div>

                    <div className="text-slate-400">Money Moved:</div>
                    <div className="text-slate-300">₹0.00 (Simulated Test Order)</div>
                  </div>

                  {executionRecord.razorpay_payment_link && (
                    <div className="pt-2">
                      <a
                        href="#razorpay"
                        onClick={(e) => {
                          e.preventDefault();
                          // navigate to razorpay sandbox tab
                        }}
                        className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-sans"
                      >
                        Inspect in Razorpay Test Terminal &rarr;
                      </a>
                    </div>
                  )}
                </div>
              ) : approvalStatus === 'REJECTED' ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs space-y-2">
                  <div className="font-bold text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    CAMPAIGN REJECTED AT HUMAN APPROVAL GATE
                  </div>
                  <p className="text-slate-300">
                    The merchant declined authorization. No actions were dispatched to Razorpay. An immutable rejection log was stored in the audit trail.
                  </p>
                </div>
              ) : null}

              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                <button
                  onClick={resetPipeline}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  Start New Pipeline Run
                </button>
                <button
                  onClick={onViewAudit}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Audit Entry &rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Multi-Agent Trace & Explainability */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Agent Explainability Inspector
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <span>1. Analyst Agent</span>
                  <span className="text-[10px] text-emerald-400 font-mono">PASSED</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Scanned 1,248 customer rows. Flagged 126 records matching inactivity threshold (&gt;60 days). Prior spend: ₹84,500.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <span>2. Campaign Agent</span>
                  <span className="text-[10px] text-teal-400 font-mono">
                    {proposal ? 'FORMULATED' : 'WAITING'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {proposal 
                    ? `Bounded proposal: ${proposal.audience_size} accounts, ${proposal.max_discount_percent}% discount, ₹${proposal.budget_limit} budget.`
                    : 'Awaiting trigger to generate bounded campaign parameters.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <span>3. Verifier Agent ⭐</span>
                  <span className={`text-[10px] font-mono ${
                    verifierResult?.verdict === 'PASSED' ? 'text-emerald-400' : verifierResult?.verdict === 'FAILED' ? 'text-rose-400 font-bold' : 'text-slate-500'
                  }`}>
                    {verifierResult ? verifierResult.verdict : 'PENDING'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {verifierResult 
                    ? verifierResult.explanation 
                    : 'Evaluates real customer dates, audience bounds, merchant discount limits, budget, and rationale consistency.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <span>4. Deterministic Policy Engine 🔐</span>
                  <span className="text-[10px] text-indigo-400 font-mono">IMMUTABLE CODE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Hard bounds configured by merchant: Max Budget ₹10,000, Max Audience 100, Max Discount 10%, Max Lifespan 7 days. AI cannot modify these values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
