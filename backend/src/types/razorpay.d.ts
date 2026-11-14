declare module "razorpay" {
  export interface OrdersCreateOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string | number>;
    partial_payment?: boolean;
  }

  export interface RazorpayOrderObject {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt?: string;
    status: "created" | "attempted" | "paid";
    attempts: number;
    notes?: Record<string, any>;
    created_at: number;
  }

  export interface PaymentsFetchObject {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: "created" | "authorized" | "captured" | "refunded" | "failed";
    order_id: string;
    method?: string;
    bank?: string;
    wallet?: string;
    vpa?: string;
    email?: string;
    contact?: string;
    error_code?: string;
    error_description?: string;
    created_at: number;
  }

  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(options: OrdersCreateOptions): Promise<RazorpayOrderObject>;
      fetch(orderId: string): Promise<RazorpayOrderObject>;
    };
    payments: {
      fetch(paymentId: string): Promise<PaymentsFetchObject>;
    };
  }
}
