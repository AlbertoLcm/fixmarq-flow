export interface Budget {
  id?: string;
  project_name: string;
  client_name: string;
  budget_date: string;
  items: BudgetItem[];
  total_amount: number;
  paid_amount: number;
  payments?: Payment[];
  status?: 'pending' | 'ongoing' | 'paid';
}

export interface BudgetItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  description: string;
  date: string;
}