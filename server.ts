import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { customers, transactions, products, merchantStats } from './server/syntheticData.js';
import { runAnalystAgent } from './server/agents/analystAgent.js';
import { runCampaignAgent } from './server/agents/campaignAgent.js';
import { runVerifierAgent } from './server/agents/verifierAgent.js';
import { activeMerchantPolicy, updateMerchantPolicy, evaluatePolicy } from './server/policies/policyEngine.js';
import { executeCampaignInRazorpayTestMode } from './server/razorpay/executor.js';
import { razorpayTestClient } from './server/razorpay/client.js';
import { getAuditEntries, logAuditEntry } from './server/audit/auditService.js';
import { Opportunity, CampaignProposal, VerifierResult, PolicyResult, ExecutionRecord } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory runtime state for active demo workflow
let cachedOpportunities: Opportunity[] = [];
let activeProposals: Map<string, CampaignProposal> = new Map();
let activeVerifications: Map<string, VerifierResult> = new Map();
let activePolicyResults: Map<string, PolicyResult> = new Map();
let activeApprovals: Map<string, 'APPROVED' | 'REJECTED'> = new Map();
let activeExecutions: Map<string, ExecutionRecord> = new Map();

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    razorpay_mode: 'Test Mode Sandbox',
    has_gemini_key: Boolean(process.env.GEMINI_API_KEY),
    has_razorpay_key: razorpayTestClient.isLiveCredentialsConfigured()
  });
});

// 2. Dashboard Statistics
app.get('/api/stats', (req, res) => {
  res.json(merchantStats);
});

// 3. AI Growth Opportunities (Analyst Agent)
app.get('/api/opportunities', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    if (cachedOpportunities.length === 0 || forceRefresh) {
      cachedOpportunities = await runAnalystAgent(customers, transactions);
    }
    res.json({
      opportunities: cachedOpportunities,
      detected_count: cachedOpportunities.length,
      analyzed_customers: customers.length,
      analyzed_transactions: transactions.length
    });
  } catch (err: any) {
    console.error('Error running Analyst Agent:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Customer Dataset Explorer & Evidence Verification
app.get('/api/customers', (req, res) => {
  const filter = (req.query.filter as string) || 'all';
  const search = ((req.query.search as string) || '').toLowerCase();
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  let filtered = customers;

  if (filter === 'inactive_60') {
    filtered = filtered.filter(c => c.days_inactive > 60);
  } else if (filter === 'high_value_inactive') {
    filtered = filtered.filter(c => c.days_inactive > 60 && (c.is_high_value || c.total_spend >= 5000));
  } else if (filter === 'cross_sell') {
    filtered = filtered.slice(126, 269);
  } else if (filter === 'at_risk') {
    filtered = filtered.filter(c => c.status === 'at_risk');
  }

  if (search) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.customer_id.toLowerCase().includes(search)
    );
  }

  res.json({
    total_matching: filtered.length,
    customers: filtered.slice(0, limit)
  });
});

// 5. Transactions Explorer
app.get('/api/transactions', (req, res) => {
  const status = req.query.status as string;
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  let filtered = transactions;
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }

  res.json({
    total_matching: filtered.length,
    transactions: filtered.slice(0, limit)
  });
});

// 6. Products Catalogue
app.get('/api/products', (req, res) => {
  res.json(products);
});

// 7. Campaign Agent Proposal
app.post('/api/campaigns/propose', (req, res) => {
  try {
    const {
      opportunity_id,
      custom_audience_size,
      custom_discount_percent,
      custom_duration_days,
      custom_budget_limit,
      channel
    } = req.body;

    const opp = cachedOpportunities.find(o => o.id === opportunity_id) || cachedOpportunities[0] || {
      id: 'OPP-WINBACK-01',
      type: 'win_back',
      title: 'Win-Back Inactive Customers',
      priority: 'High',
      description: '126 customers inactive >60 days',
      inactive_customers: 126,
      potential_revenue: 84500,
      recommended_audience: 100,
      recommended_discount_percent: 10,
      confidence: 0.91,
      risk: 'LOW',
      evidence_summary: '126 customers inactive >60 days',
      evidence_points: ['126 customers inactive >60 days']
    };

    const proposal = runCampaignAgent({
      opportunity: opp as Opportunity,
      custom_audience_size: custom_audience_size ? Number(custom_audience_size) : undefined,
      custom_discount_percent: custom_discount_percent ? Number(custom_discount_percent) : undefined,
      custom_duration_days: custom_duration_days ? Number(custom_duration_days) : undefined,
      custom_budget_limit: custom_budget_limit ? Number(custom_budget_limit) : undefined,
      channel
    });

    activeProposals.set(proposal.id, proposal);
    res.json(proposal);
  } catch (err: any) {
    console.error('Error generating campaign proposal:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Verifier Agent Verification Check
app.post('/api/campaigns/verify', (req, res) => {
  try {
    const { proposal_id, proposal_override } = req.body;
    let proposal: CampaignProposal | undefined = activeProposals.get(proposal_id);

    if (proposal_override) {
      proposal = proposal_override;
      if (proposal) activeProposals.set(proposal.id, proposal);
    }

    if (!proposal) {
      return res.status(404).json({ error: 'Campaign proposal not found' });
    }

    const opp = cachedOpportunities.find(o => o.id === proposal!.opportunity_id) || cachedOpportunities[0];
    const verifierResult = runVerifierAgent(proposal, opp, customers, transactions, activeMerchantPolicy);
    activeVerifications.set(proposal.id, verifierResult);

    // Also evaluate deterministic policy
    const policyResult = evaluatePolicy(proposal, activeMerchantPolicy);
    activePolicyResults.set(proposal.id, policyResult);

    res.json({
      proposal,
      verifierResult,
      policyResult
    });
  } catch (err: any) {
    console.error('Error in Verifier Agent:', err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Merchant Approval Decision
app.post('/api/campaigns/approve', (req, res) => {
  try {
    const { campaign_id, decision, notes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be APPROVED or REJECTED' });
    }

    const proposal = activeProposals.get(campaign_id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    activeApprovals.set(campaign_id, decision);

    // If rejected, log rejection to audit trail right away
    if (decision === 'REJECTED') {
      const verifierResult = activeVerifications.get(campaign_id) || runVerifierAgent(
        proposal,
        cachedOpportunities[0],
        customers,
        transactions,
        activeMerchantPolicy
      );
      const policyResult = activePolicyResults.get(campaign_id) || evaluatePolicy(proposal, activeMerchantPolicy);

      const auditEntry = logAuditEntry({
        proposal,
        verifierResult,
        policyResult,
        merchantApproval: 'REJECTED'
      });

      return res.json({
        campaign_id,
        decision: 'REJECTED',
        notes: notes || 'Declined by merchant',
        audit_entry: auditEntry
      });
    }

    res.json({
      campaign_id,
      decision: 'APPROVED',
      approved_at: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error processing approval:', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Execute Campaign in Razorpay Test Mode
app.post('/api/campaigns/execute', async (req, res) => {
  try {
    const { campaign_id, simulate_failure = false } = req.body;
    const proposal = activeProposals.get(campaign_id);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const approvalStatus = activeApprovals.get(campaign_id);
    if (approvalStatus !== 'APPROVED') {
      return res.status(403).json({
        error: 'Approval Gate: Campaign cannot execute without merchant authorization.',
        current_status: approvalStatus || 'PENDING'
      });
    }

    const executionRecord = await executeCampaignInRazorpayTestMode({
      proposal,
      isMerchantApproved: true,
      simulateFailure: Boolean(simulate_failure)
    });

    activeExecutions.set(campaign_id, executionRecord);

    const verifierResult = activeVerifications.get(campaign_id) || runVerifierAgent(
      proposal,
      cachedOpportunities[0],
      customers,
      transactions,
      activeMerchantPolicy
    );
    const policyResult = activePolicyResults.get(campaign_id) || evaluatePolicy(proposal, activeMerchantPolicy);

    // Record immutable audit entry
    const auditEntry = logAuditEntry({
      proposal,
      verifierResult,
      policyResult,
      merchantApproval: 'APPROVED',
      executionRecord
    });

    res.json({
      execution: executionRecord,
      audit: auditEntry
    });
  } catch (err: any) {
    console.error('Error executing campaign in Razorpay Test Mode:', err);
    res.status(500).json({ error: err.message });
  }
});

// 11. Audit Trail Endpoint
app.get('/api/audit-trail', (req, res) => {
  res.json({
    entries: getAuditEntries()
  });
});

// 12. Policy Engine Configuration
app.get('/api/policies', (req, res) => {
  res.json({
    policy: activeMerchantPolicy,
    razorpay_key_preview: razorpayTestClient.getKeyIdPreview(),
    is_live_test_credentials: razorpayTestClient.isLiveCredentialsConfigured(),
    has_gemini: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post('/api/policies', (req, res) => {
  try {
    const updated = updateMerchantPolicy(req.body);
    res.json({
      message: 'Merchant policy limits updated successfully',
      policy: updated
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Vite middleware or Static files
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampaignPilot AI server running on port ${PORT}`);
  });
}

start();
