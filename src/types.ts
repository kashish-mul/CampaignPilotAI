export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  total_orders: number;
  total_spend: number;
  average_order_value: number;
  last_purchase_date: string;
  days_inactive: number;
  is_high_value: boolean;
  status: 'active' | 'at_risk' | 'churned';
  preferred_category: string;
}

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  order_id: string;
  amount: number;
  status: 'captured' | 'failed' | 'refunded';
  payment_method: 'upi' | 'card' | 'netbanking';
  product_id: string;
  product_name: string;
  created_at: string;
  failure_reason?: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  stock: number;
}

export interface MerchantStats {
  revenue: number;
  customersCount: number;
  transactionsCount: number;
  failedPaymentsCount: number;
  atRiskCustomersCount: number;
  highValueInactiveCount: number;
  crossSellCandidatesCount: number;
}

export type OpportunityType = 'win_back' | 'cross_sell' | 'payment_recovery';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  priority: 'High' | 'Medium';
  description: string;
  inactive_customers?: number;
  high_value_customers?: number;
  failed_payments?: number;
  cross_sell_candidates?: number;
  potential_revenue: number;
  recommended_audience: number;
  recommended_discount_percent: number;
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence_summary: string;
  evidence_points: string[];
}

export interface CampaignProposal {
  id: string;
  opportunity_id: string;
  campaign_name: string;
  campaign_type: OpportunityType;
  audience_size: number;
  max_discount_percent: number;
  duration_days: number;
  budget_limit: number;
  promo_code: string;
  channel: 'email_sms' | 'razorpay_checkout_offer';
  reason: string;
  target_criteria: string;
  created_at: string;
}

export interface VerificationCheckItem {
  id: string;
  title: string;
  passed: boolean;
  description: string;
  evidence: string;
  metric_found: string;
  threshold_expected: string;
}

export interface VerifierResult {
  campaign_id: string;
  verdict: 'PASSED' | 'FAILED';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  checks: {
    data_support: VerificationCheckItem;
    audience_correctness: VerificationCheckItem;
    policy_compliance: VerificationCheckItem;
    financial_bounds: VerificationCheckItem;
    reasoning_consistency: VerificationCheckItem;
  };
  rejection_reason?: string;
  generated_at: string;
  explanation: string;
}

export interface PolicyConfig {
  max_campaign_budget: number;
  max_audience: number;
  max_discount_percent: number;
  max_duration_days: number;
  require_merchant_approval: boolean;
  max_retry_attempts: number;
}

export interface PolicyResult {
  passed: boolean;
  violations: string[];
  evaluated_rules: {
    rule: string;
    allowed: string;
    requested: string;
    passed: boolean;
  }[];
}

export interface ApprovalRecord {
  campaign_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decided_by?: string;
  decided_at?: string;
  decision_notes?: string;
}

export interface ExecutionRecord {
  execution_id: string;
  campaign_id: string;
  status: 'SUCCESS' | 'FAILED' | 'STOPPED_SAFE';
  attempts: number;
  circuit_breaker_tripped: boolean;
  razorpay_reference?: string;
  razorpay_order_id?: string;
  razorpay_payment_link?: string;
  error_message?: string;
  executed_at: string;
  simulated_failure: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  opportunity: string;
  evidence: string;
  audience: number;
  budget: number;
  max_discount: number;
  verifier: 'PASSED' | 'FAILED';
  policy: 'PASSED' | 'FAILED';
  merchant_approval: 'APPROVED' | 'REJECTED' | 'PENDING';
  execution: 'SUCCESS' | 'FAILED' | 'NOT_EXECUTED';
  razorpay_reference?: string;
  trace_steps: {
    step: string;
    agent_or_system: string;
    status: 'success' | 'warning' | 'error';
    details: string;
    timestamp: string;
  }[];
}
