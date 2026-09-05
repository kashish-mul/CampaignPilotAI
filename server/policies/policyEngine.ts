import { CampaignProposal, PolicyConfig, PolicyResult } from '../../src/types.js';

// Default deterministic merchant policy bounds
export let activeMerchantPolicy: PolicyConfig = {
  max_campaign_budget: 10000,
  max_audience: 100,
  max_discount_percent: 10,
  max_duration_days: 7,
  require_merchant_approval: true,
  max_retry_attempts: 2
};

export function updateMerchantPolicy(newPolicy: Partial<PolicyConfig>): PolicyConfig {
  activeMerchantPolicy = {
    ...activeMerchantPolicy,
    ...newPolicy
  };
  return activeMerchantPolicy;
}

export function evaluatePolicy(proposal: CampaignProposal, policy: PolicyConfig = activeMerchantPolicy): PolicyResult {
  const violations: string[] = [];

  const evaluated_rules = [
    {
      rule: 'MAX_CAMPAIGN_BUDGET',
      allowed: `₹${policy.max_campaign_budget.toLocaleString('en-IN')}`,
      requested: `₹${proposal.budget_limit.toLocaleString('en-IN')}`,
      passed: proposal.budget_limit <= policy.max_campaign_budget
    },
    {
      rule: 'MAX_AUDIENCE',
      allowed: `${policy.max_audience} customers`,
      requested: `${proposal.audience_size} customers`,
      passed: proposal.audience_size <= policy.max_audience
    },
    {
      rule: 'MAX_DISCOUNT',
      allowed: `${policy.max_discount_percent}%`,
      requested: `${proposal.max_discount_percent}%`,
      passed: proposal.max_discount_percent <= policy.max_discount_percent
    },
    {
      rule: 'MAX_DURATION',
      allowed: `${policy.max_duration_days} days`,
      requested: `${proposal.duration_days} days`,
      passed: proposal.duration_days <= policy.max_duration_days
    }
  ];

  for (const rule of evaluated_rules) {
    if (!rule.passed) {
      violations.push(`Violation: ${rule.rule} limit exceeded. Requested: ${rule.requested}, Allowed ceiling: ${rule.allowed}.`);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    evaluated_rules
  };
}
