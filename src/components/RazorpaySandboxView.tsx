import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  Zap,
  Terminal,
  Lock,
  Layers
} from 'lucide-react';
import { ExecutionRecord } from '../types.js';

interface RazorpaySandboxViewProps {
  latestExecution: ExecutionRecord | null;
  keyPreview: string;
  isLiveTestCredentials: boolean;
  onSimulateTestOrder: () => void;
}

export const RazorpaySandboxView: React.FC<RazorpaySandboxViewProps> = ({
  latestExecution,
  keyPreview,
  isLiveTestCredentials,
  onSimulateTestOrder
}) => {
  const [testCheckoutStep, setTestCheckoutStep] = useState<'idle' | 'processing' | 'paid'>('idle');
  const [testUpiId, setTestUpiId] = useState('customer@okhdfcbank');

  const handleSimulatePayment = () => {
    setTestCheckoutStep('processing');
    setTimeout(() => {
      setTestCheckoutStep('paid');
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Razorpay Test Mode Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulated payment orders, merchant offers, and circuit breaker status. Razorpay Test Mode never moves real money.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Test Mode Active
          </span>
        </div>
      </div>

      {/* Top Banner: Credential Isolation & Test Guarantee */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Authentication Mode</span>
          <div className="font-mono text-sm font-bold text-white">Basic Auth (Server-side)</div>
          <p className="text-[11px] text-slate-400">
            Keys are strictly isolated in Node.js server environment variables and never exposed to the client.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Active Test Key ID</span>
          <div className="font-mono text-sm font-bold text-emerald-400">{keyPreview}</div>
          <p className="text-[11px] text-slate-400">
            {isLiveTestCredentials ? 'Connected to live Razorpay Test API endpoint' : 'Using native simulated sandbox engine'}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Financial Safety</span>
          <div className="font-mono text-sm font-bold text-teal-300">₹0.00 Real Money Moved</div>
          <p className="text-[11px] text-slate-400">
            Simulated transactions create synthetic order objects without initiating banking debits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Circuit Breaker & Execution Monitor */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Circuit Breaker Status
              </h3>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                latestExecution?.circuit_breaker_tripped 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {latestExecution?.circuit_breaker_tripped ? 'STATUS: TRIPPED (OPEN)' : 'STATUS: NORMAL (CLOSED)'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If an API failure occurs during execution, the system attempts at most <strong className="text-white">1 automatic retry</strong>. If failure persists, the Circuit Breaker trips immediately to prevent cascading network failures or duplicate order attempts.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Consecutive Failures:</span>
                <span className="text-white font-bold">{latestExecution?.attempts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trip Threshold:</span>
                <span className="text-white">2 attempts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Repeated Call Prevention:</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Latest Execution Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              Latest Razorpay Action Output
            </h3>

            {latestExecution ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-emerald-400 font-bold">{latestExecution.razorpay_reference || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Status:</span>
                  <span className={latestExecution.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {latestExecution.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Circuit Breaker Tripped:</span>
                  <span className={latestExecution.circuit_breaker_tripped ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {latestExecution.circuit_breaker_tripped ? 'YES (Controlled Safe Stop)' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-300">{latestExecution.executed_at}</span>
                </div>
                {latestExecution.error_message && (
                  <div className="pt-2 text-[11px] text-amber-300 font-sans border-t border-slate-800">
                    {latestExecution.error_message}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No orders executed yet in this session. Run the Multi-Agent Pipeline to dispatch test orders.
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Razorpay Test Checkout Terminal */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Customer Test Checkout Simulator
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Simulated Razorpay UI</span>
            </div>

            <p className="text-xs text-slate-300">
              Test how inactive customers experience the bounded 10% win-back voucher during checkout.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="font-bold text-white text-sm">Artisan Espresso Roast 1kg</div>
                  <div className="text-slate-400 text-[11px]">Specialty Single Origin Bean</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 line-through text-[11px]">₹1,850</div>
                  <div className="text-emerald-400 font-bold text-base">₹1,665</div>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-600/30 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono font-bold">WINBACK10</span>
                  <span>(10% Campaign Discount)</span>
                </div>
                <span className="text-emerald-400 font-bold">-₹185</span>
              </div>

              {testCheckoutStep === 'paid' ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                  <div className="font-bold text-white text-sm">Simulated Test Payment Captured!</div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Payment ID: pay_test_{Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </div>
                  <button
                    onClick={() => setTestCheckoutStep('idle')}
                    className="mt-2 text-xs text-teal-400 hover:underline"
                  >
                    Reset Simulator
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Simulated Customer UPI ID</label>
                    <input
                      type="text"
                      value={testUpiId}
                      onChange={(e) => setTestUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    disabled={testCheckoutStep === 'processing'}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{testCheckoutStep === 'processing' ? 'Processing Test Payment...' : 'Pay ₹1,665 via Razorpay Test Sandbox'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
