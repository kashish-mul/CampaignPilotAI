import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Target, 
  Bot, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Video
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingApprovalsCount: number;
  onRefreshOpportunities: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  pendingApprovalsCount,
  onRefreshOpportunities,
  isRefreshing
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pitch', label: 'Pitch Video 🎬', icon: Video },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'pipeline', label: 'Multi-Agent Pipeline', icon: Bot },
    { 
      id: 'approvals', 
      label: 'Approvals', 
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { id: 'razorpay', label: 'Razorpay Sandbox', icon: CreditCard },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
    { id: 'settings', label: 'Policies & Guardrails', icon: ShieldCheck },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">CampaignPilot AI</span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Agentic Commerce
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Explainable, Self-Verifying AI Agent with Razorpay Test Mode
              </p>
            </div>
          </div>

          {/* Status Badges & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('pitch')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
              title="Watch Kashish's 5-minute Pitch Video"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pitch Video 🎬</span>
            </button>

            <button
              onClick={onRefreshOpportunities}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition disabled:opacity-50"
              title="Re-run Data Analyst Agent"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
              <span className="hidden md:inline">Run Analyst Agent</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-950/60 border border-emerald-600/30 text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Razorpay Test Mode</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-indigo-950/60 border border-indigo-600/30 text-indigo-300 font-mono">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-emerald-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
