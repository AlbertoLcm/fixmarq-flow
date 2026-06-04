export interface Budget {
  id: string;
  project_name: string;
  client_name: string;
  created_at: string;
  items: BudgetItem[];
  total_amount: number;
  paid_amount: number;
  payments: Payment[];
  status: 'pending' | 'completed';
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
}