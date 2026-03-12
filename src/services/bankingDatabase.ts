// In-memory simulated banking database service
import {
  UserProfile,
  CIF,
  BankAccount,
  Ledger,
  VirtualCard,
  Transaction,
  AdminActionLog,
  UserStatus,
} from '../types/banking';

/**
 * In-memory database for prototype.
 * In production: replace with actual database (PostgreSQL, MongoDB, etc.)
 */
class BankingDatabase {
  private users: Map<string, UserProfile> = new Map();
  private cifs: Map<string, CIF> = new Map();
  private accounts: Map<string, BankAccount> = new Map();
  private ledgers: Map<string, Ledger> = new Map();
  private virtualCards: Map<string, VirtualCard> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private adminLogs: AdminActionLog[] = [];

  private userIdCounter = 1000;
  private cifCounter = 1000;
  private accountCounter = 1000;
  private ledgerCounter = 1000;
  private cardCounter = 1000;
  private txnCounter = 1000;
  private logCounter = 1000;

  // ========== USER OPERATIONS ==========
  createUser(
    email: string,
    phone: string | undefined,
    name: string,
    password: string,
    nationality?: string,
    primaryAccountType?: 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET',
    currency?: string
  ): UserProfile {
    const userId = `USER-${this.userIdCounter++}`;
    const user: UserProfile = {
      id: userId,
      email,
      phone,
      name,
      role: 'user',
      status: 'UNREGISTERED',
      nationality,
      primaryAccountType,
      additionalAccountTypes: [],
      currency: currency || 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(userId, user);
    // In production: hash and store password separately
    return user;
  }

  upsertUser(user: Partial<UserProfile> & { id: string }): UserProfile {
    const existing = this.users.get(user.id);
    const now = new Date().toISOString();
    const merged: UserProfile = {
      id: user.id,
      email: user.email || existing?.email || '',
      phone: user.phone || existing?.phone,
      name: user.name || existing?.name || 'User',
      role: user.role || existing?.role || 'user',
      status: user.status || existing?.status || 'UNREGISTERED',
      nationality: user.nationality || existing?.nationality,
      primaryAccountType: user.primaryAccountType || existing?.primaryAccountType,
      additionalAccountTypes: user.additionalAccountTypes || existing?.additionalAccountTypes || [],
      currency: user.currency || existing?.currency || 'USD',
      avatar: user.avatar || existing?.avatar,
      cifId: user.cifId || existing?.cifId,
      accountNumber: user.accountNumber || existing?.accountNumber,
      routingNumber: user.routingNumber || existing?.routingNumber,
      balance: user.balance ?? existing?.balance,
      firstName: user.firstName || existing?.firstName,
      lastName: user.lastName || existing?.lastName,
      middleName: user.middleName || existing?.middleName,
      gender: user.gender || existing?.gender,
      dateOfBirth: user.dateOfBirth || existing?.dateOfBirth,
      houseAddress: user.houseAddress || existing?.houseAddress,
      occupation: user.occupation || existing?.occupation,
      salaryRange: user.salaryRange || existing?.salaryRange,
      pin: user.pin || existing?.pin,
      photoUrl: user.photoUrl || existing?.photoUrl,
      createdAt: existing?.createdAt || user.createdAt || now,
      updatedAt: now,
    };
    this.users.set(user.id, merged);
    return merged;
  }

    getAllUsers(): UserProfile[] {
      return Array.from(this.users.values());
    }

  getUser(userId: string): UserProfile | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): UserProfile | undefined {
    const users = Array.from(this.users.values());
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  updateUserStatus(userId: string, status: UserStatus): UserProfile | undefined {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        status,
        updatedAt: new Date().toISOString(),
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return user;
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const user = this.users.get(userId);
    if (user) {
      // Prevent changing primaryAccountType once set
      let finalUpdates = { ...updates };
      if (updates.primaryAccountType && user.primaryAccountType && updates.primaryAccountType !== user.primaryAccountType) {
        const { primaryAccountType, ...rest } = finalUpdates as any;
        finalUpdates = rest;
      }
      
      // Prevent changing preferred currency once set on profile
      if (updates.currency && user.currency && updates.currency !== user.currency) {
        // ignore attempted currency overwrite to keep all account/transactions in the selected currency
        finalUpdates = { ...finalUpdates };
        delete (finalUpdates as any).currency;
      }
      
      const updatedUser = {
        ...user,
        ...finalUpdates,
        updatedAt: new Date().toISOString(),
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return user;
  }

  // Allow users to apply for additional account types (recorded as requests)
  private accountTypeRequests: Map<string, ('CHECKING' | 'SAVINGS' | 'MONEY_MARKET')[]> = new Map();

  requestAdditionalAccountType(userId: string, accountType: 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET'): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    // Don't allow requesting the same as primary
    if (user.primaryAccountType === accountType) return false;
    const existing = this.accountTypeRequests.get(userId) || [];
    if (!existing.includes(accountType)) {
      existing.push(accountType);
      this.accountTypeRequests.set(userId, existing);
      return true;
    }
    return false;
  }

  getAccountTypeRequests(userId: string): ('CHECKING' | 'SAVINGS' | 'MONEY_MARKET')[] {
    return this.accountTypeRequests.get(userId) || [];
  }

  // ========== ACCOUNT CREATION COMPLETION ==========
  completeAccountCreation(userId: string, formData: {
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    nationality: string;
    houseAddress: string;
    occupation: string;
    salaryRange: string;
    accountType: 'CHECKING' | 'SAVINGS';
    currency: string;
    pin: string;
    photoUrl?: string;
  }): { user: UserProfile; account: BankAccount; routingNumber: string; accountNumber: string } | null {
    const user = this.users.get(userId);
    if (!user || user.status !== 'UNREGISTERED') return null;

    // Step 1: Generate routing and account numbers
    const routingNumber = this.generateRoutingNumber();
    const accountNumber = this.generateAccountNumber11Digit();

    // Step 2: Create CIF
    const cif = this.createCIF(userId);

    // Step 3: Update user profile with all form data and generated numbers
    const updatedUser = this.updateUserProfile(userId, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      houseAddress: formData.houseAddress,
      occupation: formData.occupation,
      salaryRange: formData.salaryRange,
      primaryAccountType: formData.accountType,
      currency: formData.currency,
      pin: formData.pin, // In production: hash this
      photoUrl: formData.photoUrl,
      avatar: formData.photoUrl, // Use photo as avatar
      routingNumber,
      accountNumber,
      status: 'ACTIVE',
    });

    if (!updatedUser) return null;

    // Step 4: Create bank account with generated numbers
    const account: BankAccount = {
      id: `ACC-${String(this.accountCounter++).padStart(8, '0')}`,
      cifId: cif.id,
      userId,
      accountNumber,
      routingNumber,
      accountType: formData.accountType,
      status: 'ACTIVE',
      currency: formData.currency || 'USD',
      createdAt: new Date().toISOString(),
    };
    this.accounts.set(account.id, account);

    // Step 5: Create ledger with $10 welcome bonus
    const initialBalance = 10.00; // $10 welcome bonus
    const ledger = this.createLedger(account.id, initialBalance, formData.currency);

    // Step 6: Create a virtual card for the account
    this.createVirtualCard(account.id);

    return {
      user: updatedUser,
      account,
      routingNumber,
      accountNumber,
    };
  }

  private generateRoutingNumber(): string {
    // Generate 9-digit routing number
    return String(Math.floor(Math.random() * 900000000) + 100000000);
  }

  private generateAccountNumber11Digit(): string {
    // Generate 11-digit account number
    return String(Math.floor(Math.random() * 99999999999) + 10000000000).slice(0, 11);
  }

  // ========== CIF OPERATIONS ==========
  createCIF(userId: string): CIF {
    const cifId = `CIF-2026-${String(this.cifCounter++).padStart(6, '0')}`;
    const cif: CIF = {
      id: cifId,
      userId,
      createdAt: new Date().toISOString(),
    };
    this.cifs.set(cifId, cif);
    // Update user with CIF
    this.updateUserProfile(userId, { cifId });
    return cif;
  }

  getCIF(cifId: string): CIF | undefined {
    return this.cifs.get(cifId);
  }

  getCIFByUserId(userId: string): CIF | undefined {
    for (const cif of this.cifs.values()) {
      if (cif.userId === userId) return cif;
    }
    return undefined;
  }

  // ========== BANK ACCOUNT OPERATIONS ==========
  createBankAccount(
    cifId: string,
    userId: string,
    accountType: 'CHECKING' | 'SAVINGS'
  ): BankAccount {
    const accountId = `ACC-${String(this.accountCounter++).padStart(8, '0')}`;
    const accountNumber = this.generateAccountNumber();
    const routingNumber = '123456789'; // Static for prototype

    // Use user's preferred currency for the account when available
    const user = this.users.get(userId);
    const accountCurrency = user?.currency || 'USD';

    const account: BankAccount = {
      id: accountId,
      cifId,
      userId,
      accountNumber,
      routingNumber,
      accountType,
      status: 'ACTIVE',
      currency: accountCurrency,
      createdAt: new Date().toISOString(),
    };
    this.accounts.set(accountId, account);
    return account;
  }

  getAccount(accountId: string): BankAccount | undefined {
    return this.accounts.get(accountId);
  }

  getAccountsByUserId(userId: string): BankAccount[] {
    const result: BankAccount[] = [];
    for (const account of this.accounts.values()) {
      if (account.userId === userId) result.push(account);
    }
    return result;
  }

  private generateAccountNumber(): string {
    return String(Math.floor(Math.random() * 10000000000))
      .padStart(10, '0');
  }

  // ========== LEDGER OPERATIONS ==========
  createLedger(accountId: string, initialBalance: number = 0, currency?: string): Ledger {
    const ledgerId = `LDG-${String(this.ledgerCounter++).padStart(8, '0')}`;
    // Determine currency: explicit param -> account.currency -> USD
    const account = this.getAccount(accountId);
    const ledgerCurrency = currency || account?.currency || 'USD';

    const ledger: Ledger = {
      id: ledgerId,
      accountId,
      balance: initialBalance,
      currency: ledgerCurrency,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.ledgers.set(ledgerId, ledger);
    return ledger;
  }

  getLedgerByAccountId(accountId: string): Ledger | undefined {
    for (const ledger of this.ledgers.values()) {
      if (ledger.accountId === accountId) return ledger;
    }
    return undefined;
  }

  updateLedgerBalance(ledgerId: string, newBalance: number): Ledger | undefined {
    const ledger = this.ledgers.get(ledgerId);
    if (ledger) {
      const updatedLedger = {
        ...ledger,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      };
      this.ledgers.set(ledgerId, updatedLedger);
      return updatedLedger;
    }
    return ledger;
  }

  // ========== VIRTUAL CARD OPERATIONS ==========
  createVirtualCard(accountId: string): VirtualCard {
    const cardId = `CRD-${String(this.cardCounter++).padStart(8, '0')}`;
    const cardNumber = this.generateCardNumber();
    const expiryDate = this.generateExpiryDate();
    const cvv = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    const card: VirtualCard = {
      id: cardId,
      accountId,
      cardNumber,
      expiryDate,
      cvv,
      status: 'ACTIVE',
      issuedAt: new Date().toISOString(),
    };
    this.virtualCards.set(cardId, card);
    return card;
  }

  getVirtualCard(cardId: string): VirtualCard | undefined {
    return this.virtualCards.get(cardId);
  }

  getVirtualCardsByAccountId(accountId: string): VirtualCard[] {
    const result: VirtualCard[] = [];
    for (const card of this.virtualCards.values()) {
      if (card.accountId === accountId) result.push(card);
    }
    return result;
  }

  updateCardStatus(cardId: string, status: 'ACTIVE' | 'FROZEN' | 'CLOSED'): VirtualCard | undefined {
    const card = this.virtualCards.get(cardId);
    if (card) {
      const updatedCard = {
        ...card,
        status,
      };
      this.virtualCards.set(cardId, updatedCard);
      return updatedCard;
    }
    return card;
  }

  private generateCardNumber(): string {
    const digits = String(Math.floor(Math.random() * 10000000000000)).padStart(16, '0');
    return digits;
  }

  private generateExpiryDate(): string {
    const now = new Date();
    const year = now.getFullYear() + 5;
    const month = String((now.getMonth() + 1) % 12 || 12).padStart(2, '0');
    return `${month}/${year.toString().slice(-2)}`;
  }

  // ========== TRANSACTION OPERATIONS ==========
  recordTransaction(
    accountId: string,
    amount: number,
    type: 'debit' | 'credit',
    description: string,
    currency?: string
  ): Transaction {
    const txnId = `TXN-${String(this.txnCounter++).padStart(10, '0')}`;
    // Resolve currency: explicit param -> ledger.currency -> account.currency -> user's currency -> USD
    const ledger = this.getLedgerByAccountId(accountId);
    const account = this.getAccount(accountId);
    const user = account ? this.getUser(account.userId) : undefined;
    const resolvedCurrency = currency || ledger?.currency || account?.currency || user?.currency || 'USD';

    const transaction: Transaction = {
      id: txnId,
      accountId,
      amount,
      type,
      description,
      timestamp: new Date().toISOString(),
      currency: resolvedCurrency,
    };
    this.transactions.set(txnId, transaction);
    return transaction;
  }

  getTransactionsByAccountId(accountId: string, limit: number = 20): Transaction[] {
    const result: Transaction[] = [];
    for (const txn of this.transactions.values()) {
      if (txn.accountId === accountId) result.push(txn);
    }
    // Sort by timestamp descending and limit
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }

  // ========== AUDIT LOG ==========
  logAdminAction(
    adminId: string,
    action: string,
    targetUserId: string,
    details: Record<string, any>
  ): AdminActionLog {
    const log: AdminActionLog = {
      id: `LOG-${String(this.logCounter++).padStart(8, '0')}`,
      adminId,
      action,
      targetUserId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.adminLogs.push(log);
    return log;
  }

  getAdminLogs(limit: number = 100): AdminActionLog[] {
    return this.adminLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

// Export singleton instance
export const bankingDb = new BankingDatabase();

