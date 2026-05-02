// In-memory data store — no database needed
export type MemCountry = {
  id: number; name: string; code: string; flag: string; region: string;
  latitude: string; longitude: string; overallScore: number; crimeRate: number;
  healthcareScore: number; politicalStability: number; naturalDisasterRisk: number;
  advisoryLevel: "safe" | "moderate" | "high_risk" | "critical";
  travelAdvisory: string; updatedAt: Date;
};

export type MemAlert = {
  id: number; countryId: number; title: string; description: string;
  severity: "info" | "warning" | "critical"; alertType: string;
  effectiveDate: string | null; expiryDate: string | null; createdAt: Date;
};

export type MemExpense = {
  id: number; userId: number; amount: string; currency: string; category: string;
  description: string | null; paymentMethod: string | null; merchant: string | null;
  status: "completed" | "pending"; expenseDate: string;
  createdAt: Date; updatedAt: Date;
};

export type MemBudget = {
  id: number; userId: number; category: string; amount: string;
  period: "monthly" | "weekly" | "yearly"; startDate: string;
  endDate: string | null; alertThreshold: number;
  createdAt: Date; updatedAt: Date;
};

let nextExpenseId = 1;
let nextBudgetId = 1;

class Store {
  countries: MemCountry[] = [];
  alerts: MemAlert[] = [];
  expenses: MemExpense[] = [];
  budgets: MemBudget[] = [];

  addExpense(data: Omit<MemExpense, "id" | "createdAt" | "updatedAt">): MemExpense {
    const e: MemExpense = { ...data, id: nextExpenseId++, createdAt: new Date(), updatedAt: new Date() };
    this.expenses.push(e);
    return e;
  }

  updateExpense(id: number, data: Partial<MemExpense>): boolean {
    const idx = this.expenses.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.expenses[idx] = { ...this.expenses[idx], ...data, updatedAt: new Date() };
    return true;
  }

  deleteExpense(id: number): boolean {
    const len = this.expenses.length;
    this.expenses = this.expenses.filter(e => e.id !== id);
    return this.expenses.length < len;
  }

  addBudget(data: Omit<MemBudget, "id" | "createdAt" | "updatedAt">): MemBudget {
    const b: MemBudget = { ...data, id: nextBudgetId++, createdAt: new Date(), updatedAt: new Date() };
    this.budgets.push(b);
    return b;
  }

  updateBudget(id: number, data: Partial<MemBudget>): boolean {
    const idx = this.budgets.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.budgets[idx] = { ...this.budgets[idx], ...data, updatedAt: new Date() };
    return true;
  }

  deleteBudget(id: number): boolean {
    const len = this.budgets.length;
    this.budgets = this.budgets.filter(b => b.id !== id);
    return this.budgets.length < len;
  }
}

export const store = new Store();
