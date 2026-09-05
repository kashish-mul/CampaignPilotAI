import { CampaignProposal, Opportunity } from '../../src/types.js';

export interface CampaignProposalParams {
  opportunity: Opportunity;
  custom_audience_size?: number;
  custom_discount_percent?: number;
  custom_duration_days?: number;
  custom_budget_limit?: number;
  channel?: 'email_sms' | 'razorpay_checkout_offer';
}

export function runCampaignAgent(params: CampaignProposalParams): CampaignProposal {
  const {
    opportunity,
    custom_audience_size,
    custom_discount_percent,
    custom_duration_days,
    custom_budget_limit,
    channel = 'razorpay_checkout_offer'
  } = params;

  const audience_size = custom_audience_size ?? opportunity.recommended_audience ?? 100;
  const max_discount_percent = custom_discount_percent ?? opportunity.recommended_discount_percent ?? 10;
  const duration_days = custom_duration_days ?? 7;
  const budget_limit = custom_budget_limit ?? 5000;

  const campaignId = `CAMP-${Date.now().toString().slice(-6)}`;
  const promo_code = `WINBACK${max_discount_percent}`;

  let reason = 'Target customers inactive for more than 60 days with a high-margin reactivation voucher';
  let target_criteria = 'Days since last purchase > 60 AND Total previous orders >= 1';

  if (opportunity.type === 'cross_sell') {
    reason = 'Promote brew hardware to recurring whole-bean buyers';
    target_criteria = 'Orders with Coffee Beans >= 2 AND Brew Equipment = 0';
  } else if (opportunity.type === 'payment_recovery') {
    reason = 'Send auto-recovery Razorpay test checkout links to drop-off users';
    target_criteria = 'Transaction status = FAILED in last 30 days';
  }

  return {
    id: campaignId,
    opportunity_id: opportunity.id,
    campaign_name: `${opportunity.title} Campaign`,
    campaign_type: opportunity.type,
    audience_size,
    max_discount_percent,
    duration_days,
    budget_limit,
    promo_code,
    channel,
    reason,
    target_criteria,
    created_at: new Date().toISOString()
  };
}
