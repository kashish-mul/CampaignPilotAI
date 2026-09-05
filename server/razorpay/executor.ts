import { CampaignProposal, ExecutionRecord } from '../../src/types.js';
import { razorpayTestClient } from './client.js';

export interface ExecuteCampaignOptions {
  proposal: CampaignProposal;
  isMerchantApproved: boolean;
  simulateFailure?: boolean;
}

export async function executeCampaignInRazorpayTestMode(
  options: ExecuteCampaignOptions
): Promise<ExecutionRecord> {
  const { proposal, isMerchantApproved, simulateFailure = false } = options;

  const executionId = `EXEC-${Date.now().toString().slice(-6)}`;

  if (!isMerchantApproved) {
    throw new Error('Approval Gate Violation: Campaign has not been approved by the merchant.');
  }

  // Handle controlled failure scenario (as detailed in the specifications)
  if (simulateFailure) {
    // Attempt 1 fails -> Retry #1 fails -> Circuit Breaker trips to OPEN -> Safe Stop
    console.warn(`[ActionExecutor] Controlled failure triggered for ${proposal.id}`);

    // Simulate first attempt failure
    const attempt1Error = 'Razorpay Test Gateway: 502 Bad Gateway / Upstream Timeout on /v1/orders';
    // Simulate retry backoff (short delay for demo speed)
    await new Promise(resolve => setTimeout(resolve, 350));

    // Simulate retry failure
    const attempt2Error = 'Razorpay Test Gateway: Retry #1 rejected - Issuing partner network unavailable';

    return {
      execution_id: executionId,
      campaign_id: proposal.id,
      status: 'STOPPED_SAFE',
      attempts: 2,
      circuit_breaker_tripped: true,
      error_message: `Controlled Failure: Attempt 1 (${attempt1Error}) and Retry #1 (${attempt2Error}) both failed. Circuit breaker tripped. Execution safely halted.`,
      executed_at: new Date().toISOString(),
      simulated_failure: true
    };
  }

  // Normal successful test execution
  try {
    // Average item amount e.g. ₹1,850 - 10% discount = ₹1,665 (166500 paise)
    const baseAmount = 1850;
    const discountedAmount = Math.round(baseAmount * (1 - proposal.max_discount_percent / 100));
    const amountInPaise = discountedAmount * 100;

    const receipt = `rcpt_${proposal.id.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const testOrder = await razorpayTestClient.createTestOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        campaign_id: proposal.id,
        campaign_name: proposal.campaign_name,
        promo_code: proposal.promo_code,
        discount_percent: `${proposal.max_discount_percent}%`,
        audience_size: String(proposal.audience_size),
        budget_limit: `INR ${proposal.budget_limit}`,
        channel: proposal.channel,
        environment: 'Razorpay Test Mode Sandbox'
      }
    });

    return {
      execution_id: executionId,
      campaign_id: proposal.id,
      status: 'SUCCESS',
      attempts: 1,
      circuit_breaker_tripped: false,
      razorpay_reference: testOrder.id,
      razorpay_order_id: testOrder.id,
      razorpay_payment_link: testOrder.payment_link,
      executed_at: new Date().toISOString(),
      simulated_failure: false
    };
  } catch (error: any) {
    // Catch real network/API errors if custom credentials fail
    return {
      execution_id: executionId,
      campaign_id: proposal.id,
      status: 'FAILED',
      attempts: 1,
      circuit_breaker_tripped: false,
      error_message: error.message || 'Unknown Razorpay Test API error',
      executed_at: new Date().toISOString(),
      simulated_failure: false
    };
  }
}
