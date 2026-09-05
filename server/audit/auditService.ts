import { AuditEntry, CampaignProposal, VerifierResult, PolicyResult, ExecutionRecord } from '../../src/types.js';

let auditRecords: AuditEntry[] = [
  {
    id: 'ACT-00042',
    timestamp: '2026-09-05 08:34:12',
    agent: 'Campaign Agent',
    opportunity: 'Win-Back Inactive Customers',
    evidence: '126 customers inactive >60 days (32 high-value historical buyers)',
    audience: 100,
    budget: 5000,
    max_discount: 10,
    verifier: 'PASSED',
    policy: 'PASSED',
    merchant_approval: 'APPROVED',
    execution: 'SUCCESS',
    razorpay_reference: 'order_test_9X8B27A1',
    trace_steps: [
      {
        step: '1. Opportunity Discovery',
        agent_or_system: 'Data Analyst Agent',
        status: 'success',
        details: 'Identified 126 customer accounts inactive for >60 days. Estimated potential revenue: ₹84,500.',
        timestamp: '2026-09-05 08:31:02'
      },
      {
        step: '2. Campaign Proposal Generation',
        agent_or_system: 'Campaign Agent',
        status: 'success',
        details: 'Formulated bounded proposal: 100 target accounts, 10% maximum discount, 7-day window, ₹5,000 budget.',
        timestamp: '2026-09-05 08:31:45'
      },
      {
        step: '3. Multi-point Verification',
        agent_or_system: 'Verifier Agent ⭐',
        status: 'success',
        details: 'Checked data evidence (126 matches), audience bounds (100 <= 126), discount limit (10% <= 10%), financial bounds (₹5,000 <= ₹10,000), rationale consistency. VERDICT: PASSED.',
        timestamp: '2026-09-05 08:32:15'
      },
      {
        step: '4. Deterministic Policy Gate',
        agent_or_system: 'Policy Engine 🔐',
        status: 'success',
        details: 'Deterministic policy validation passed 4/4 rules without manual bypass.',
        timestamp: '2026-09-05 08:32:16'
      },
      {
        step: '5. Human Merchant Authorization',
        agent_or_system: 'Approval Gate 👤',
        status: 'success',
        details: 'Merchant reviewed evidence and explicitly authorized execution.',
        timestamp: '2026-09-05 08:33:50'
      },
      {
        step: '6. Razorpay Test Mode Order Creation',
        agent_or_system: 'Action Executor 💳',
        status: 'success',
        details: 'Created Razorpay Test Order order_test_9X8B27A1 with notes and discount line item in Test Mode.',
        timestamp: '2026-09-05 08:34:12'
      }
    ]
  },
  {
    id: 'ACT-00041',
    timestamp: '2026-09-04 14:15:30',
    agent: 'Verifier Agent',
    opportunity: 'Specialty Tea Flash Sale',
    evidence: 'Attempted promo discount of 18% on slow-moving inventory',
    audience: 150,
    budget: 12000,
    max_discount: 18,
    verifier: 'FAILED',
    policy: 'FAILED',
    merchant_approval: 'REJECTED',
    execution: 'NOT_EXECUTED',
    trace_steps: [
      {
        step: '1. Opportunity Discovery',
        agent_or_system: 'Data Analyst Agent',
        status: 'success',
        details: 'Flagged 160 units of slow-moving Organic Cascara Tea.',
        timestamp: '2026-09-04 14:10:00'
      },
      {
        step: '2. Campaign Proposal Generation',
        agent_or_system: 'Campaign Agent',
        status: 'warning',
        details: 'Generated aggressive clearance campaign with 18% discount and ₹12,000 budget.',
        timestamp: '2026-09-04 14:12:10'
      },
      {
        step: '3. Verification & Policy Interception',
        agent_or_system: 'Verifier Agent & Policy Engine 🔐',
        status: 'error',
        details: 'VERIFICATION FAILED: Requested discount 18% > Merchant max 10%. Budget ₹12,000 > Merchant ceiling ₹10,000. Audience 150 > max 100. Halting workflow immediately.',
        timestamp: '2026-09-04 14:12:12'
      },
      {
        step: '4. Safe Rejection',
        agent_or_system: 'Approval Gate',
        status: 'error',
        details: 'Proposal flagged as non-compliant. No API call made to Razorpay.',
        timestamp: '2026-09-04 14:15:30'
      }
    ]
  }
];

export function getAuditEntries(): AuditEntry[] {
  return [...auditRecords];
}

export function logAuditEntry(params: {
  proposal: CampaignProposal;
  verifierResult: VerifierResult;
  policyResult: PolicyResult;
  merchantApproval: 'APPROVED' | 'REJECTED';
  executionRecord?: ExecutionRecord;
}): AuditEntry {
  const { proposal, verifierResult, policyResult, merchantApproval, executionRecord } = params;

  const id = `ACT-${String(auditRecords.length + 42).padStart(5, '0')}`;
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

  let execStatus: 'SUCCESS' | 'FAILED' | 'NOT_EXECUTED' = 'NOT_EXECUTED';
  if (executionRecord) {
    execStatus = executionRecord.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
  }

  const trace_steps = [
    {
      step: '1. Opportunity Discovery',
      agent_or_system: 'Data Analyst Agent',
      status: 'success' as const,
      details: `Analyzed customer inactivity patterns and verified target segment for ${proposal.campaign_name}.`,
      timestamp: dateStr
    },
    {
      step: '2. Campaign Proposal',
      agent_or_system: 'Campaign Agent',
      status: 'success' as const,
      details: `Audience: ${proposal.audience_size}, Discount: ${proposal.max_discount_percent}%, Budget: ₹${proposal.budget_limit.toLocaleString('en-IN')}, Duration: ${proposal.duration_days}d.`,
      timestamp: dateStr
    },
    {
      step: '3. Verifier Agent Audit',
      agent_or_system: 'Verifier Agent ⭐',
      status: (verifierResult.verdict === 'PASSED' ? 'success' : 'error') as 'success' | 'error',
      details: `Verdict: ${verifierResult.verdict}. ${verifierResult.explanation}`,
      timestamp: dateStr
    },
    {
      step: '4. Policy Engine Evaluation',
      agent_or_system: 'Policy Engine 🔐',
      status: (policyResult.passed ? 'success' : 'error') as 'success' | 'error',
      details: policyResult.passed ? 'Deterministic policy rules evaluated: All rules compliant.' : `Policy violations: ${policyResult.violations.join(' ')}`,
      timestamp: dateStr
    },
    {
      step: '5. Merchant Approval Gate',
      agent_or_system: 'Approval Gate 👤',
      status: (merchantApproval === 'APPROVED' ? 'success' : 'error') as 'success' | 'error',
      details: `Merchant decision: ${merchantApproval}. Authorization token logged.`,
      timestamp: dateStr
    }
  ];

  if (executionRecord) {
    trace_steps.push({
      step: '6. Razorpay Test Execution & Circuit Breaker',
      agent_or_system: 'Action Executor 💳',
      status: (executionRecord.status === 'SUCCESS' ? 'success' : 'error') as 'success' | 'error',
      details: executionRecord.status === 'SUCCESS'
        ? `Razorpay Test Mode Order created successfully: ${executionRecord.razorpay_reference}`
        : `Execution halted safely after ${executionRecord.attempts} attempts. Circuit breaker tripped: ${executionRecord.circuit_breaker_tripped ? 'YES' : 'NO'}. ${executionRecord.error_message}`,
      timestamp: executionRecord.executed_at.replace('T', ' ').substring(0, 19)
    });
  }

  const newEntry: AuditEntry = {
    id,
    timestamp: dateStr,
    agent: 'Campaign Agent',
    opportunity: proposal.campaign_name,
    evidence: proposal.reason,
    audience: proposal.audience_size,
    budget: proposal.budget_limit,
    max_discount: proposal.max_discount_percent,
    verifier: verifierResult.verdict,
    policy: policyResult.passed ? 'PASSED' : 'FAILED',
    merchant_approval: merchantApproval,
    execution: execStatus,
    razorpay_reference: executionRecord?.razorpay_reference,
    trace_steps
  };

  auditRecords.unshift(newEntry);
  return newEntry;
}
