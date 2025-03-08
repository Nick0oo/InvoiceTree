import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Save, FileDown, Printer, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type { Invoice, InvoiceItem, Company, Client } from '../types/invoice';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onClose?: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onClose }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Invoice>({
    defaultValues: invoice || {
      id: uuidv4(),
      number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      items: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    fetchUserCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyClients(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchUserCompanies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchCompanyClients = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const onSubmit = async (data: Invoice) => {
    setLoading(true);
    try {
      // Calculate totals
      const items = data.items.map(item => {
        const subtotal = item.quantity * item.unitPrice;
        const taxAmount = subtotal * (item.tax / 100);
        const discountAmount = subtotal * (item.discount / 100);
        const total = subtotal + taxAmount - discountAmount;
        
        return {
          ...item,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total
        };
      });

      const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      const taxTotal = items.reduce((acc, item) => acc + item.tax_amount, 0);
      const discountTotal = items.reduce((acc, item) => acc + item.discount_amount, 0);
      const total = subtotal + taxTotal - discountTotal;

      const invoiceData = {
        company_id: selectedCompany,
        client_id: data.client?.id,
        number: data.number,
        issue_date: data.issueDate,
        due_date: data.dueDate,
        notes: data.notes,
        terms: data.terms,
        payment_terms: data.paymentTerms,
        status: invoice ? invoice.status : 'draft',
        subtotal,
        tax_total: taxTotal,
        discount_total: discountTotal,
        total
      };

      if (invoice) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);

        if (invoiceError) throw invoiceError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id);

        if (deleteError) throw deleteError;

        // Insert new items
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            items.map(item => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              tax_rate: item.tax,
              discount_rate: item.discount,
              subtotal: item.subtotal,
              tax_amount: item.tax_amount,
              discount_amount: item.discount_amount,
              total: item.total
            }))
          );

        if (itemsError) throw itemsError;
      } else {
        // Create new invoice
        const { data: newInvoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([invoiceData])
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Create invoice items
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            items.map(item => ({
              invoice_id: newInvoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              tax_rate: item.tax,
              discount_rate: item.discount,
              subtotal: item.subtotal,
              tax_amount: item.tax_amount,
              discount_amount: item.discount_amount,
              total: item.total
            }))
          );

        if (itemsError) throw itemsError;
      }

      alert(invoice ? 'Invoice updated successfully!' : 'Invoice created successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = (items: InvoiceItem[] = []) => {
    return items.reduce((acc, item) => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      return acc + amount;
    }, 0);
  };

  const calculateTotal = (items: InvoiceItem[] = []) => {
    return items.reduce((acc, item) => {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      const taxAmount = subtotal * ((item.tax || 0) / 100);
      const discountAmount = subtotal * ((item.discount || 0) / 100);
      return acc + subtotal + taxAmount - discountAmount;
    }, 0);
  };

  const items = watch('items') || [];

  return (
    <div className="p-8">
      <div className="bg-[#111111] rounded-lg p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Company Selection */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Select Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                >
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Select Client</label>
                <select
                  {...register('client.id')}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Invoice Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Invoice Number</label>
                <input
                  type="text"
                  {...register('number')}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Issue Date</label>
                <input
                  type="date"
                  {...register('issueDate')}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Due Date</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                />
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Invoice Items</h2>
              <button
                type="button"
                onClick={() => append({ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, tax: 0, discount: 0 })}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div className="grid grid-cols-12 gap-6 px-4 text-sm font-medium text-gray-300">
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-right">Tax %</div>
                <div className="col-span-2 text-right">Discount %</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="grid grid-cols-12 gap-6 items-start bg-black/50 p-6 rounded-lg border border-gray-800/50 hover:border-gray-800 transition-colors"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      {...register(`items.${index}.description`)}
                      placeholder="Item description"
                      className="w-full bg-black border border-gray-700 rounded-md shadow-sm py-2.5 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register(`items.${index}.quantity`)}
                      placeholder="0"
                      className="w-full bg-black border border-gray-700 rounded-md shadow-sm py-2.5 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-right"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`)}
                      placeholder="0.00"
                      className="w-full bg-black border border-gray-700 rounded-md shadow-sm py-2.5 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-right"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register(`items.${index}.tax`)}
                      placeholder="0"
                      className="w-full bg-black border border-gray-700 rounded-md shadow-sm py-2.5 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-right"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register(`items.${index}.discount`)}
                      placeholder="0"
                      className="w-full bg-black border border-gray-700 rounded-md shadow-sm py-2.5 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-right"
                    />
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center p-2 border border-red-500/20 rounded-md text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Item total - Optional */}
                  <div className="col-span-12 pt-3 mt-3 border-t border-gray-800/50">
                    <div className="flex justify-end text-sm text-gray-400">
                      <span>Subtotal: ${((items[index]?.quantity || 0) * (items[index]?.unitPrice || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Information */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Additional Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Terms</label>
                <textarea
                  {...register('terms')}
                  rows={3}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                  placeholder="Invoice terms..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Payment Terms</label>
                <textarea
                  {...register('paymentTerms')}
                  rows={2}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                  placeholder="Payment terms..."
                />
              </div>
            </div>
          </section>

          {/* Totals */}
          <section className="space-y-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal(items).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal(items).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Save Invoice')}
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              <FileDown className="h-5 w-5 mr-2" />
              Download PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              <Printer className="h-5 w-5 mr-2" />
              Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;