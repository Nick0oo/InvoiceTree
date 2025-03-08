export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logo?: string;
}

export interface Client {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
}

export interface Invoice {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  company: Company;
  client: Client;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  paymentTerms: string;
}