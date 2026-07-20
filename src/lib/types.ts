export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "savings" | "current" | "business";
  currency: "GHS" | "USD" | "EUR";
  number: string;
  balance: number;
};

export type Card = {
  id: string;
  userId: string;
  accountId: string;
  label: string;
  brand: "Visa" | "Mastercard";
  last4: string;
  expiry: string;
  status: "active" | "frozen";
  spendingLimit: number;
};

export type BillPayee = {
  id: string;
  name: string;
  category: string;
};

export type MomoNotification = {
  id: string;
  title: string;
  body: string;
  amount: number;
  balance: number;
  createdAt: string;
  read: boolean;
};

export type MomoWallet = {
  id: string;
  userId: string;
  phone: string;
  network: "MTN" | "Telecel" | "AirtelTigo" | "Other";
  balance: number;
  notifications: MomoNotification[];
};
