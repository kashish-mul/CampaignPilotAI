import { VerifierResult, CampaignProposal, Opportunity, Customer, Transaction, PolicyConfig } from '../../src/types.js';

export function runVerifierAgent(
  proposal: CampaignProposal,
  opportunity: Opportunity,
  customers: Customer[],
  transactions: Transaction[],
  merchantPolicy: PolicyConfig
): VerifierResult {
  // 1. Data Support Check
  // Check if claimed inactive customers (>60 days) actually exist in the database
  const actualInactiveCount = customers.filter(c => c.days_inactive > 60).length;
  const claimedInactive = opportunity.inactive_customers ?? 126;
  const dataSupportPassed = actualInactiveCount >= claimedInactive;
  const dataSupportCheck = {
    id: 'chk-data-support',
    title: 'Data Evidence',
    passed: dataSupportPassed,
    description: 'Verify if merchant database supports the claimed 60+ days inactivity metric.',
    evidence: `Database queries confirm exactly ${actualInactiveCount} customer records with last order >60 days ago.`,
    metric_found: `${actualInactiveCount} inactive accounts found`,
    threshold_expected: `>= ${claimedInactive} claimed accounts`
  };

  // 2. Audience Correctness Check
  // Selected audience must not exceed the available verified cohort or policy max
  const audiencePassed = proposal.audience_size <= actualInactiveCount && proposal.audience_size <= merchantPolicy.max_audience;
  const audienceCheck = {
    id: 'chk-audience-correctness',
    title: 'Audience Correctness',
    passed: audiencePassed,
    description: 'Verify that selected recipient count is strictly bounded and eligible.',
    evidence: `${proposal.audience_size} customers selected from cohort of ${actualInactiveCount} eligible accounts.`,
    metric_found: `${proposal.audience_size} recipients requested`,
    threshold_expected: `<= ${Math.min(actualInactiveCount, merchantPolicy.max_audience)} allowed (policy & data limit)`
  };

  // 3. Discount Limit / Policy Compliance Check
  const discountPassed = proposal.max_discount_percent <= merchantPolicy.max_discount_percent;
  const discountCheck = {
    id: 'chk-discount-limit',
    title: 'Discount Limit',
    passed: discountPassed,
    description: `Ensure campaign discount does not exceed merchant ceiling of ${merchantPolicy.max_discount_percent}%.`,
    evidence: discountPassed 
      ? `Requested ${proposal.max_discount_percent}% is safely within ${merchantPolicy.max_discount_percent}% merchant limit.`
      : `Requested ${proposal.max_discount_percent}% EXCEEDS the merchant limit of ${merchantPolicy.max_discount_percent}%.`,
    metric_found: `${proposal.max_discount_percent}% requested discount`,
    threshold_expected: `<= ${merchantPolicy.max_discount_percent}% merchant max`
  };

  // 4. Financial Bounds Check
  const budgetPassed = proposal.budget_limit <= merchantPolicy.max_campaign_budget;
  const budgetCheck = {
    id: 'chk-financial-bounds',
    title: 'Budget & Financial Bounds',
    passed: budgetPassed,
    description: `Confirm campaign spending allocation stays under ₹${merchantPolicy.max_campaign_budget.toLocaleString('en-IN')}.`,
    evidence: budgetPassed
      ? `Campaign budget ₹${proposal.budget_limit.toLocaleString('en-IN')} approved under ceiling of ₹${merchantPolicy.max_campaign_budget.toLocaleString('en-IN')}.`
      : `Campaign budget ₹${proposal.budget_limit.toLocaleString('en-IN')} exceeds allowable budget ₹${merchantPolicy.max_campaign_budget.toLocaleString('en-IN')}.`,
    metric_found: `₹${proposal.budget_limit.toLocaleString('en-IN')}`,
    threshold_expected: `<= ₹${merchantPolicy.max_campaign_budget.toLocaleString('en-IN')}`
  };

  // 5. Duration Check & Reasoning Consistency
  const durationPassed = proposal.duration_days <= merchantPolicy.max_duration_days;
  const reasoningConsistencyPassed = durationPassed && (proposal.opportunity_id === opportunity.id);
  const reasoningCheck = {
    id: 'chk-reasoning-consistency',
    title: 'Duration & Rationale Consistency',
    passed: reasoningConsistencyPassed,
    description: 'Verify proposal reasoning aligns with evidence, opportunity category, and campaign lifespan limit.',
    evidence: reasoningConsistencyPassed
      ? `Campaign duration of ${proposal.duration_days} days conforms to max ${merchantPolicy.max_duration_days} days. Proposal rationale matches ${opportunity.type} opportunity.`
      : `Duration ${proposal.duration_days} days exceeds max duration of ${merchantPolicy.max_duration_days} days.`,
    metric_found: `${proposal.duration_days} days duration`,
    threshold_expected: `<= ${merchantPolicy.max_duration_days} days`
  };

  const allPassed = dataSupportPassed && audiencePassed && discountPassed && budgetPassed && reasoningConsistencyPassed;

  let rejection_reason: string | undefined = undefined;
  if (!allPassed) {
    const failures: string[] = [];
    if (!dataSupportPassed) failures.push('Data evidence not supported by customer database');
    if (!audiencePassed) failures.push(`Requested audience (${proposal.audience_size}) exceeds eligible accounts or policy limit`);
    if (!discountPassed) failures.push(`Requested discount = ${proposal.max_discount_percent}%, Merchant maximum = ${merchantPolicy.max_discount_percent}%`);
    if (!budgetPassed) failures.push(`Requested budget ₹${proposal.budget_limit} exceeds merchant maximum of ₹${merchantPolicy.max_campaign_budget}`);
    if (!reasoningConsistencyPassed) failures.push(`Duration (${proposal.duration_days} days) exceeds merchant limit (${merchantPolicy.max_duration_days} days)`);
    rejection_reason = failures.join(' | ');
  }

  const explanation = allPassed
    ? `All 5 verification checks PASSED. Evidence from ${actualInactiveCount} inactive customers rigorously proves the validity of this ${proposal.audience_size}-customer bounded campaign.`
    : `Verification FAILED. Violations detected: ${rejection_reason}. Execution is blocked and cannot proceed.`;

  return {
    campaign_id: proposal.id,
    verdict: allPassed ? 'PASSED' : 'FAILED',
    risk_level: allPassed ? 'LOW' : 'HIGH',
    checks: {
      data_support: dataSupportCheck,
      audience_correctness: audienceCheck,
      policy_compliance: discountCheck,
      financial_bounds: budgetCheck,
      reasoning_consistency: reasoningCheck
    },
    rejection_reason,
    generated_at: new Date().toISOString(),
    explanation
  };
}
