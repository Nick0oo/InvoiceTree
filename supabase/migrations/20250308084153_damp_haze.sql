/*
  # Initial Invoice System Schema

  1. New Tables
    - `companies`
      - Company profiles for invoice issuers
      - Stores business details and branding preferences
    
    - `clients`
      - Client information for invoice recipients
      - Stores contact and billing details
    
    - `invoices`
      - Main invoice records
      - Links companies, clients, and items
    
    - `invoice_items`
      - Individual line items for each invoice
      - Stores product/service details and pricing

  2. Security
    - Enable RLS on all tables
    - Policies to ensure users can only access their own data
    - Companies and invoices are linked to auth.users
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tax_id text,
  address text,
  phone text,
  email text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  tax_id text,
  address text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  number text NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  notes text,
  terms text,
  payment_terms text,
  status text DEFAULT 'draft',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_total numeric(10,2) NOT NULL DEFAULT 0,
  discount_total numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  discount_rate numeric(5,2) DEFAULT 0,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can manage their own companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Clients policies
CREATE POLICY "Users can manage clients through their companies"
  ON clients
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = clients.company_id
    AND companies.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = clients.company_id
    AND companies.user_id = auth.uid()
  ));

-- Invoices policies
CREATE POLICY "Users can manage invoices through their companies"
  ON invoices
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = invoices.company_id
    AND companies.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = invoices.company_id
    AND companies.user_id = auth.uid()
  ));

-- Invoice items policies
CREATE POLICY "Users can manage invoice items through their invoices"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM invoices
    JOIN companies ON companies.id = invoices.company_id
    WHERE invoice_items.invoice_id = invoices.id
    AND companies.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM invoices
    JOIN companies ON companies.id = invoices.company_id
    WHERE invoice_items.invoice_id = invoices.id
    AND companies.user_id = auth.uid()
  ));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);