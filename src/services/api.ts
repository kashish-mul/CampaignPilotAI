import {
  MerchantStats,
  Opportunity,
  Customer,
  Transaction,
  CampaignProposal,
  VerifierResult,
  PolicyResult,
  PolicyConfig,
  ExecutionRecord,
  AuditEntry
} from '../types.js';

export async function fetchHealth(): Promise<any> {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchStats(): Promise<MerchantStats> {
  const res = await fetch('/api/stats');
  return res.json();
}

export async function fetchOpportunities(refresh = false): Promise<{
  opportunities: Opportunity[];
  detected_count: number;
  analyzed_customers: number;
  analyzed_transactions: number;
}> {
  const res = await fetch(`/api/opportunities?refresh=${refresh}`);
  return res.json();
}

export async function fetchCustomers(filter = 'all', search = '', limit = 100): Promise<{
  total_matching: number;
  customers: Customer[];
}> {
  const params = new URLSearchParams({ filter, search, limit: String(limit) });
  const res = await fetch(`/api/customers?${params.toString()}`);
  return res.json();
}

export async function fetchTransactions(status = '', limit = 100): Promise<{
  total_matching: number;
  transactions: Transaction[];
}> {
  const params = new URLSearchParams({ status, limit: String(limit) });
  const res = await fetch(`/api/transactions?${params.toString()}`);
  return res.json();
}

export async function createCampaignProposal(payload: {
  opportunity_id: string;
  custom_audience_size?: number;
  custom_discount_percent?: number;
  custom_duration_days?: number;
  custom_budget_limit?: number;
  channel?: 'email_sms' | 'razorpay_checkout_offer';
}): Promise<CampaignProposal> {
  const res = await fetch('/api/campaigns/propose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function verifyCampaign(payload: {
  proposal_id: string;
  proposal_override?: CampaignProposal;
}): Promise<{
  proposal: CampaignProposal;
  verifierResult: VerifierResult;
  policyResult: PolicyResult;
}> {
  const res = await fetch('/api/campaigns/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function submitMerchantApproval(payload: {
  campaign_id: string;
  decision: 'APPROVED' | 'REJECTED';
  notes?: string;
}): Promise<{
  campaign_id: string;
  decision: 'APPROVED' | 'REJECTED';
  approved_at?: string;
  audit_entry?: AuditEntry;
}> {
  const res = await fetch('/api/campaigns/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function executeCampaign(payload: {
  campaign_id: string;
  simulate_failure?: boolean;
}): Promise<{
  execution: ExecutionRecord;
  audit: AuditEntry;
}> {
  const res = await fetch('/api/campaigns/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Execution failed');
  }
  return res.json();
}

export async function fetchAuditTrail(): Promise<{ entries: AuditEntry[] }> {
  const res = await fetch('/api/audit-trail');
  return res.json();
}

export async function fetchPolicies(): Promise<{
  policy: PolicyConfig;
  razorpay_key_preview: string;
  is_live_test_credentials: boolean;
  has_gemini: boolean;
}> {
  const res = await fetch('/api/policies');
  return res.json();
}

export async function updatePolicies(newPolicy: Partial<PolicyConfig>): Promise<{
  message: string;
  policy: PolicyConfig;
}> {
  const res = await fetch('/api/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPolicy)
  });
  return res.json();
}
