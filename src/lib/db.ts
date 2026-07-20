import { promises as fs } from "fs";
import path from "path";
import { detectNetwork, normalizePhone } from "./phone";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "savings" | "current" | "business";
  currency: "GHS" | "USD" | "EUR";
  number: string;
  balance: number;
};

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  type: "credit" | "debit";
  category: string;
  description: string;
  amount: number;
  counterparty: string;
  createdAt: string;
  status: "completed" | "pending" | "failed";
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

export type Database = {
  users: UserRecord[];
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  billPayees: BillPayee[];
  momoWallets: MomoWallet[];
  livePayments?: LivePayment[];
};

export type LivePayment = {
  id: string;
  userId: string;
  accountId: string;
  phone: string;
  amount: number;
  reference: string;
  provider: string;
  network: string;
  type: "charge" | "transfer";
  status: string;
  displayText: string;
  createdAt: string;
  recipientName?: string;
  transferCode?: string;
};

const DATA_PATH =
  process.env.VERCEL ||
  process.env.RENDER ||
  process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "arkjoy-bank.json")
    : path.join(process.cwd(), "data", "bank.json");

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

async function seed(): Promise<Database> {
  return {
    users: [],
    accounts: [],
    transactions: [],
    cards: [],
    billPayees: [
      { id: "bill_ecg", name: "ECG", category: "Utilities" },
      { id: "bill_gwcl", name: "Ghana Water", category: "Utilities" },
      { id: "bill_mtn", name: "MTN", category: "Telecom" },
      { id: "bill_vodafone", name: "Telecel", category: "Telecom" },
      { id: "bill_dstv", name: "DStv", category: "Entertainment" },
      { id: "bill_nhia", name: "NHIA", category: "Health" },
    ],
    momoWallets: [],
    livePayments: [],
  };
}

async function ensureDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const db = JSON.parse(raw) as Database;
    return await migrateDb(db);
  } catch {
    const db = await seed();
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

async function migrateDb(db: Database): Promise<Database> {
  let changed = false;
  if (!db.momoWallets) {
    db.momoWallets = [];
    changed = true;
  }
  if (!db.livePayments) {
    db.livePayments = [];
    changed = true;
  }

  // Remove legacy demo account — users must register.
  const demoIds = new Set(
    db.users
      .filter(
        (u) =>
          u.id === "usr_demo_ama" ||
          u.email === "ama@arkjoy.bank"
      )
      .map((u) => u.id)
  );
  if (demoIds.size) {
    db.users = db.users.filter((u) => !demoIds.has(u.id));
    db.accounts = db.accounts.filter((a) => !demoIds.has(a.userId));
    db.transactions = db.transactions.filter((t) => !demoIds.has(t.userId));
    db.cards = db.cards.filter((c) => !demoIds.has(c.userId));
    db.momoWallets = db.momoWallets.filter((w) => !demoIds.has(w.userId));
    if (db.livePayments) {
      db.livePayments = db.livePayments.filter((p) => !demoIds.has(p.userId));
    }
    changed = true;
  }

  for (const user of db.users) {
    const phone = normalizePhone(user.phone || "");
    if (!phone) continue;
    const existing = db.momoWallets.find(
      (w) => w.userId === user.id || normalizePhone(w.phone) === phone
    );
    if (!existing) {
      db.momoWallets.push({
        id: id("momo"),
        userId: user.id,
        phone,
        network: detectNetwork(phone),
        balance: 0,
        notifications: [],
      });
      changed = true;
    }
  }

  if (changed) await writeDb(db);
  return db;
}

export function ensureWalletForUser(
  db: Database,
  userId: string,
  phone: string
): MomoWallet {
  const normalized = normalizePhone(phone);
  let wallet = db.momoWallets.find(
    (w) => w.userId === userId || normalizePhone(w.phone) === normalized
  );
  if (!wallet) {
    wallet = {
      id: id("momo"),
      userId,
      phone: normalized || `pending_${userId}`,
      network: detectNetwork(normalized),
      balance: 0,
      notifications: [],
    };
    db.momoWallets.push(wallet);
  }
  return wallet;
}

/** Wallet for any Ghana number (recipient may not be an arkJoy user). */
export function ensureWalletByPhone(db: Database, phone: string): MomoWallet {
  const normalized = normalizePhone(phone);
  let wallet = db.momoWallets.find((w) => normalizePhone(w.phone) === normalized);
  if (!wallet) {
    wallet = {
      id: id("momo"),
      userId: `ext_${normalized}`,
      phone: normalized,
      network: detectNetwork(normalized),
      balance: 0,
      notifications: [],
    };
    db.momoWallets.push(wallet);
  }
  return wallet;
}

export function creditMomoWallet(
  wallet: MomoWallet,
  amount: number,
  fromLabel: string,
  reference?: string
) {
  wallet.balance = Math.round((wallet.balance + amount) * 100) / 100;
  const ref = reference ? ` Ref ${reference}.` : "";
  const notification: MomoNotification = {
    id: id("sms"),
    title: "Payment received",
    body: `GHS ${amount.toFixed(2)} from ${fromLabel}.${ref} New MoMo bal: GHS ${wallet.balance.toFixed(2)}`,
    amount,
    balance: wallet.balance,
    createdAt: new Date().toISOString(),
    read: false,
  };
  wallet.notifications.unshift(notification);
  wallet.notifications = wallet.notifications.slice(0, 20);
  return notification;
}

export function debitMomoWallet(
  wallet: MomoWallet,
  amount: number,
  toLabel: string,
  reference?: string
) {
  if (wallet.balance < amount) {
    return null;
  }
  wallet.balance = Math.round((wallet.balance - amount) * 100) / 100;
  const ref = reference ? ` Ref ${reference}.` : "";
  const notification: MomoNotification = {
    id: id("sms"),
    title: "Payment sent",
    body: `GHS ${amount.toFixed(2)} to ${toLabel}.${ref} New MoMo bal: GHS ${wallet.balance.toFixed(2)}`,
    amount: -amount,
    balance: wallet.balance,
    createdAt: new Date().toISOString(),
    read: false,
  };
  wallet.notifications.unshift(notification);
  wallet.notifications = wallet.notifications.slice(0, 20);
  return notification;
}

export async function readDb() {
  return ensureDb();
}

export async function writeDb(db: Database) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function newId(prefix: string) {
  return id(prefix);
}

export { formatMoney } from "./money";
