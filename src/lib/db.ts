import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "./auth";
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
  const passwordHash = await hashPassword("joybank123");
  const userId = "usr_demo_ama";
  const savingsId = "acc_savings_ama";
  const currentId = "acc_current_ama";

  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  return {
    users: [
      {
        id: userId,
        email: "ama@arkjoy.bank",
        name: "Ama Mensah",
        phone: "0244123456",
        passwordHash,
        createdAt: daysAgo(120),
      },
    ],
    accounts: [
      {
        id: savingsId,
        userId,
        name: "arkJoy Savings",
        type: "savings",
        currency: "GHS",
        number: "0012345678901",
        balance: 18450.75,
      },
      {
        id: currentId,
        userId,
        name: "arkJoy Current",
        type: "current",
        currency: "GHS",
        number: "0012345678902",
        balance: 5230.4,
      },
      {
        id: "acc_usd_ama",
        userId,
        name: "USD Foreign Currency",
        type: "savings",
        currency: "USD",
        number: "0012345678903",
        balance: 820.15,
      },
    ],
    transactions: [
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "credit",
        category: "Salary",
        description: "Salary — Golden Star Ltd",
        amount: 4500,
        counterparty: "Golden Star Ltd",
        createdAt: daysAgo(2),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "debit",
        category: "Transfer",
        description: "MoMo to Kwame Asante",
        amount: 250,
        counterparty: "Kwame Asante",
        createdAt: daysAgo(2),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "debit",
        category: "Bills",
        description: "ECG prepaid — Accra East",
        amount: 180.5,
        counterparty: "ECG",
        createdAt: daysAgo(3),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: savingsId,
        type: "credit",
        category: "Interest",
        description: "Monthly savings interest",
        amount: 42.3,
        counterparty: "arkJoy",
        createdAt: daysAgo(5),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "debit",
        category: "Shopping",
        description: "Melcom Accra Mall",
        amount: 315.2,
        counterparty: "Melcom",
        createdAt: daysAgo(6),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "debit",
        category: "Transfer",
        description: "School fees — Lincoln Community",
        amount: 1200,
        counterparty: "Lincoln Community School",
        createdAt: daysAgo(8),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "credit",
        category: "Transfer",
        description: "From Kofi Boateng",
        amount: 500,
        counterparty: "Kofi Boateng",
        createdAt: daysAgo(10),
        status: "completed",
      },
      {
        id: id("txn"),
        userId,
        accountId: currentId,
        type: "debit",
        category: "Bills",
        description: "MTN Airtime & Data",
        amount: 55,
        counterparty: "MTN",
        createdAt: daysAgo(11),
        status: "completed",
      },
    ],
    cards: [
      {
        id: "card_visa_ama",
        userId,
        accountId: currentId,
        label: "arkJoy Debit",
        brand: "Visa",
        last4: "4821",
        expiry: "09/28",
        status: "active",
        spendingLimit: 10000,
      },
      {
        id: "card_mc_ama",
        userId,
        accountId: savingsId,
        label: "Travel Card",
        brand: "Mastercard",
        last4: "7710",
        expiry: "03/27",
        status: "active",
        spendingLimit: 5000,
      },
    ],
    billPayees: [
      { id: "bill_ecg", name: "ECG", category: "Utilities" },
      { id: "bill_gwcl", name: "Ghana Water", category: "Utilities" },
      { id: "bill_mtn", name: "MTN", category: "Telecom" },
      { id: "bill_vodafone", name: "Telecel", category: "Telecom" },
      { id: "bill_dstv", name: "DStv", category: "Entertainment" },
      { id: "bill_nhia", name: "NHIA", category: "Health" },
    ],
    momoWallets: [
      {
        id: "momo_ama",
        userId,
        phone: normalizePhone("0244123456"),
        network: "MTN",
        balance: 340.5,
        notifications: [
          {
            id: id("sms"),
            title: "Payment received",
            body: "Current MoMo balance: GHS 340.50",
            amount: 50,
            balance: 340.5,
            createdAt: daysAgo(1),
            read: true,
          },
        ],
      },
    ],
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
        balance: user.id === "usr_demo_ama" ? 340.5 : 0,
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
