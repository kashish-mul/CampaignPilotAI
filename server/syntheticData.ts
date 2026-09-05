import { Customer, Transaction, Product, MerchantStats } from '../src/types.js';

export const products: Product[] = [
  { product_id: 'PRD-101', product_name: 'Artisan Espresso Roast 1kg', category: 'Coffee Beans', price: 1850, stock: 320 },
  { product_id: 'PRD-102', product_name: 'Barista Pour-Over Kit', category: 'Brew Equipment', price: 2900, stock: 140 },
  { product_id: 'PRD-103', product_name: 'Electric Burr Grinder Pro', category: 'Brew Equipment', price: 6500, stock: 85 },
  { product_id: 'PRD-104', product_name: 'Cold Brew Infusion Bottle', category: 'Accessories', price: 1250, stock: 210 },
  { product_id: 'PRD-105', product_name: 'Single Origin Ethiopia Yirgacheffe', category: 'Coffee Beans', price: 2200, stock: 180 },
  { product_id: 'PRD-106', product_name: 'Ceramic Cupping Mugs (Set of 4)', category: 'Accessories', price: 1400, stock: 95 },
  { product_id: 'PRD-107', product_name: 'Organic Cascara Tea 250g', category: 'Specialty Tea', price: 950, stock: 160 },
  { product_id: 'PRD-108', product_name: 'Stainless Steel Gooseneck Kettle', category: 'Brew Equipment', price: 3400, stock: 110 }
];

export const merchantStats: MerchantStats = {
  revenue: 482500,
  customersCount: 1248,
  transactionsCount: 2341,
  failedPaymentsCount: 87,
  atRiskCustomersCount: 126,
  highValueInactiveCount: 32,
  crossSellCandidatesCount: 143
};

// Generate deterministic realistic synthetic customers
function generateCustomers(): Customer[] {
  const list: Customer[] = [];
  const firstNames = ['Aarav', 'Diya', 'Rohan', 'Ananya', 'Vikram', 'Pooja', 'Karan', 'Sneha', 'Aditya', 'Meera', 'Rahul', 'Tanvi', 'Kabir', 'Rhea', 'Nikhil', 'Isha', 'Arjun', 'Shruti', 'Varun', 'Kavya'];
  const lastNames = ['Sharma', 'Patel', 'Verma', 'Iyer', 'Menon', 'Gupta', 'Rao', 'Deshmukh', 'Chopra', 'Kapoor', 'Nair', 'Singh', 'Reddy', 'Bose', 'Mehta', 'Kulkarni', 'Joshi', 'Aggarwal'];

  const now = new Date('2026-09-05T09:26:00Z');

  for (let i = 1; i <= 1248; i++) {
    const id = `CUST-${String(i).padStart(4, '0')}`;
    const fn = firstNames[(i * 7 + 3) % firstNames.length];
    const ln = lastNames[(i * 11 + 5) % lastNames.length];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;

    let daysInactive: number;
    let isHighValue: boolean;
    let totalOrders: number;
    let totalSpend: number;
    let status: 'active' | 'at_risk' | 'churned';

    // The first 126 customers are inactive > 60 days
    if (i <= 126) {
      status = 'at_risk';
      daysInactive = 62 + ((i * 3) % 45); // between 62 and 106 days
      if (i <= 32) {
        // High-value inactive
        isHighValue = true;
        totalOrders = 4 + (i % 6);
        totalSpend = 5400 + ((i * 410) % 6500);
      } else {
        isHighValue = false;
        totalOrders = 1 + (i % 3);
        totalSpend = 1400 + ((i * 180) % 2900);
      }
    } else if (i <= 269) {
      // 143 cross-sell candidates: bought beans, never bought brew equipment
      status = 'active';
      daysInactive = 12 + (i % 35);
      isHighValue = (i % 4 === 0);
      totalOrders = 2 + (i % 4);
      totalSpend = 3100 + ((i * 220) % 4000);
    } else {
      // Remaining active/normal customers
      status = (i % 15 === 0) ? 'churned' : 'active';
      daysInactive = 3 + (i % 55);
      isHighValue = (i % 7 === 0);
      totalOrders = 1 + (i % 7);
      totalSpend = 1200 + ((i * 310) % 5200);
    }

    const pastDate = new Date(now.getTime() - daysInactive * 24 * 60 * 60 * 1000);
    const avgOrder = Math.round(totalSpend / Math.max(1, totalOrders));
    const categories = ['Coffee Beans', 'Brew Equipment', 'Accessories', 'Specialty Tea'];
    const preferred_category = categories[i % categories.length];

    list.push({
      customer_id: id,
      name,
      email,
      total_orders: totalOrders,
      total_spend: totalSpend,
      average_order_value: avgOrder,
      last_purchase_date: pastDate.toISOString().split('T')[0],
      days_inactive: daysInactive,
      is_high_value: isHighValue,
      status,
      preferred_category
    });
  }

  return list;
}

export const customers: Customer[] = generateCustomers();

// Generate deterministic realistic synthetic transactions
function generateTransactions(custs: Customer[]): Transaction[] {
  const txs: Transaction[] = [];
  const methods: ('upi' | 'card' | 'netbanking')[] = ['upi', 'card', 'netbanking', 'upi'];
  const failureReasons = [
    'Card payment declined by issuing bank',
    'UPI PIN limit exceeded or timeout',
    'Insufficient funds in bank account',
    '3DS authentication timed out'
  ];

  let failedCount = 0;
  const targetFailed = 87;
  const now = new Date('2026-09-05T09:26:00Z');

  for (let i = 1; i <= 2341; i++) {
    const txId = `TXN-${String(100000 + i)}`;
    const cust = custs[(i * 13) % custs.length];
    const orderId = `order_test_${String(200000 + i)}`;
    const prod = products[i % products.length];
    const amount = prod.price;
    const method = methods[i % methods.length];

    let status: 'captured' | 'failed' | 'refunded' = 'captured';
    let failReason: string | undefined = undefined;

    // Allocate exactly 87 failed payments
    if (failedCount < targetFailed && (i % 26 === 0 || (i > 2200 && failedCount < targetFailed))) {
      status = 'failed';
      failReason = failureReasons[failedCount % failureReasons.length];
      failedCount++;
    } else if (i % 180 === 0) {
      status = 'refunded';
    }

    const daysAgo = (i % 90);
    const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    txs.push({
      transaction_id: txId,
      customer_id: cust.customer_id,
      customer_name: cust.name,
      order_id: orderId,
      amount,
      status,
      payment_method: method,
      product_id: prod.product_id,
      product_name: prod.product_name,
      created_at: txDate.toISOString(),
      failure_reason: failReason
    });
  }

  return txs;
}

export const transactions: Transaction[] = generateTransactions(customers);
