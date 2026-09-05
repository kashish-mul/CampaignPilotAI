export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
  payment_link?: string;
}

export class RazorpayTestClient {
  private keyId?: string;
  private keySecret?: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;
  }

  public isLiveCredentialsConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret && !this.keyId.includes('sampleKeyId'));
  }

  public getKeyIdPreview(): string {
    if (!this.keyId) return 'rzp_test_SANDBOX_SIMULATOR';
    return `${this.keyId.substring(0, 8)}••••••••`;
  }

  public async createTestOrder(payload: {
    amount: number; // in paise (1 INR = 100 paise)
    currency: string;
    receipt: string;
    notes: Record<string, string>;
  }): Promise<RazorpayOrderResponse> {
    // If real Razorpay test keys are present in env, call official Razorpay Test API
    if (this.isLiveCredentialsConfigured()) {
      const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Razorpay Test API returned ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as RazorpayOrderResponse;
      data.payment_link = `https://rzp.io/i/test_${data.id.replace('order_', '')}`;
      return data;
    }

    // Otherwise, simulate a native Razorpay Test Mode Order
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    const orderId = `order_test_${randomSuffix}`;

    return {
      id: orderId,
      entity: 'order',
      amount: payload.amount,
      amount_paid: 0,
      amount_due: payload.amount,
      currency: payload.currency || 'INR',
      receipt: payload.receipt,
      offer_id: null,
      status: 'created',
      attempts: 0,
      notes: payload.notes,
      created_at: Math.floor(Date.now() / 1000),
      payment_link: `https://rzp.io/i/test_${randomSuffix}`
    };
  }
}

export const razorpayTestClient = new RazorpayTestClient();
