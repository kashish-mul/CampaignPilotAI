import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { DashboardView } from './components/DashboardView.js';
import { OpportunitiesView } from './components/OpportunitiesView.js';
import { MultiAgentPipelineView } from './components/MultiAgentPipelineView.js';
import { ApprovalsView } from './components/ApprovalsView.js';
import { RazorpaySandboxView } from './components/RazorpaySandboxView.js';
import { AuditTrailView } from './components/AuditTrailView.js';
import { SettingsView } from './components/SettingsView.js';

import { 
  MerchantStats, 
  Opportunity, 
  CampaignProposal, 
  AuditEntry, 
  PolicyConfig, 
  ExecutionRecord 
} from './types.js';
import { 
  fetchStats, 
  fetchOpportunities, 
  fetchAuditTrail, 
  fetchPolicies,
  submitMerchantApproval 
} from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);
  const [selectedOpportunityForEvidence, setSelectedOpportunityForEvidence] = useState<Opportunity | null>(null);

  const [pendingCampaign, setPendingCampaign] = useState<CampaignProposal | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [latestExecution, setLatestExecution] = useState<ExecutionRecord | null>(null);

  const [policyConfig, setPolicyConfig] = useState<PolicyConfig | null>(null);
  const [razorpayKeyPreview, setRazorpayKeyPreview] = useState<string>('rzp_test_SANDBOX_DEMO');
  const [isLiveTestCredentials, setIsLiveTestCredentials] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingOpps, setIsRefreshingOpps] = useState<boolean>(false);

  // Load initial backend state
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [statsData, oppsData, auditData, policyData] = await Promise.all([
        fetchStats(),
        fetchOpportunities(false),
        fetchAuditTrail(),
        fetchPolicies()
      ]);

      setStats(statsData);
      setOpportunities(oppsData.opportunities);
      if (oppsData.opportunities.length > 0) {
        setActiveOpportunity(oppsData.opportunities[0]);
      }
      setAuditEntries(auditData.entries);
      setPolicyConfig(policyData.policy);
      setRazorpayKeyPreview(policyData.razorpay_key_preview);
      setIsLiveTestCredentials(policyData.is_live_test_credentials);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshOpportunities = async () => {
    setIsRefreshingOpps(true);
    try {
      const oppsData = await fetchOpportunities(true);
      setOpportunities(oppsData.opportunities);
      if (oppsData.opportunities.length > 0) {
        setActiveOpportunity(oppsData.opportunities[0]);
      }
    } catch (err) {
      console.error('Failed to refresh opportunities:', err);
    } finally {
      setIsRefreshingOpps(false);
    }
  };

  const handleReloadAuditTrail = async () => {
    try {
      const data = await fetchAuditTrail();
      setAuditEntries(data.entries);
    } catch (err) {
      console.error('Failed to reload audit trail:', err);
    }
  };

  // Launch campaign from opportunity card
  const handleLaunchCampaignFromOpportunity = (opp: Opportunity) => {
    setActiveOpportunity(opp);
    setCurrentTab('pipeline');
  };

  // Human approval decisions from the Approvals tab
  const handleApprovePending = async () => {
    if (!pendingCampaign) return;
    try {
      await submitMerchantApproval({
        campaign_id: pendingCampaign.id,
        decision: 'APPROVED',
        notes: 'Approved via Approvals Queue'
      });
      setPendingCampaign(null);
      handleReloadAuditTrail();
      setCurrentTab('pipeline');
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleRejectPending = async () => {
    if (!pendingCampaign) return;
    try {
      await submitMerchantApproval({
        campaign_id: pendingCampaign.id,
        decision: 'REJECTED',
        notes: 'Rejected via Approvals Queue'
      });
      setPendingCampaign(null);
      handleReloadAuditTrail();
      setCurrentTab('pipeline');
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingApprovalsCount={pendingCampaign ? 1 : 0}
        onRefreshOpportunities={handleRefreshOpportunities}
        isRefreshing={isRefreshingOpps}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-400">
              Initializing CampaignPilot AI Agent Environment...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                opportunities={opportunities}
                onViewEvidence={(opp) => {
                  setSelectedOpportunityForEvidence(opp);
                  setCurrentTab('opportunities');
                }}
                onCreateCampaign={handleLaunchCampaignFromOpportunity}
                onNavigateToPipeline={() => setCurrentTab('pipeline')}
                onRefreshOpportunities={handleRefreshOpportunities}
                isAnalyzing={isRefreshingOpps}
              />
            )}

            {currentTab === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                onSelectOpportunityToCampaign={handleLaunchCampaignFromOpportunity}
                selectedOpportunityForEvidence={selectedOpportunityForEvidence}
                onCloseEvidence={() => setSelectedOpportunityForEvidence(null)}
                onOpenEvidence={(opp) => setSelectedOpportunityForEvidence(opp)}
              />
            )}

            {currentTab === 'pipeline' && (
              <MultiAgentPipelineView
                opportunities={opportunities}
                activeOpportunity={activeOpportunity}
                policyConfig={policyConfig}
                onAuditUpdated={handleReloadAuditTrail}
                onViewAudit={() => setCurrentTab('audit')}
              />
            )}

            {currentTab === 'approvals' && (
              <ApprovalsView
                pendingCampaign={pendingCampaign}
                onApprove={handleApprovePending}
                onReject={handleRejectPending}
                onNavigateToPipeline={() => setCurrentTab('pipeline')}
              />
            )}

            {currentTab === 'razorpay' && (
              <RazorpaySandboxView
                latestExecution={latestExecution}
                keyPreview={razorpayKeyPreview}
                isLiveTestCredentials={isLiveTestCredentials}
                onSimulateTestOrder={() => {}}
              />
            )}

            {currentTab === 'audit' && (
              <AuditTrailView entries={auditEntries} />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                policy={policyConfig}
                onPolicyUpdated={(newP) => setPolicyConfig(newP)}
                razorpayKeyPreview={razorpayKeyPreview}
                isLiveTestCredentials={isLiveTestCredentials}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            CampaignPilot AI &bull; Autonomous, explainable commerce agent built with Gemini &amp; Razorpay Test Mode.
          </div>
          <div className="flex items-center gap-3">
            <span>Deterministic Policy Guards: <strong className="text-emerald-400">Strict</strong></span>
            <span>&bull;</span>
            <span>Real Money Debited: <strong className="text-emerald-400">₹0.00</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
