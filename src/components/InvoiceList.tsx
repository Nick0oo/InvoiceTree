import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Pencil, Trash2, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import InvoiceForm from './InvoiceForm';

interface Invoice {
  id: string;
  number: string;
  company: { name: string };
  client: { name: string };
  issue_date: string;
  due_date: string;
  total: number;
  status: string;
}

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          company:companies(name),
          client:clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice. Please try again.');
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      // Here you would generate the PDF and trigger the download
      // For now, we'll just show an alert
      alert('PDF download functionality coming soon!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice. Please try again.');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'overdue':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (showForm) {
    return <InvoiceForm 
      invoice={selectedInvoice}
      onClose={() => {
        setShowForm(false);
        setSelectedInvoice(null);
        fetchInvoices();
      }} 
    />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
        </button>
      </div>

      <div className="bg-[#111111] rounded-lg border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">Number</th>
                <th className="text-left p-4 text-gray-400 font-medium">Company</th>
                <th className="text-left p-4 text-gray-400 font-medium">Client</th>
                <th className="text-left p-4 text-gray-400 font-medium">Issue Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Due Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-white">{invoice.number}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{invoice.company?.name}</td>
                  <td className="p-4 text-white">{invoice.client?.name}</td>
                  <td className="p-4 text-gray-400">{formatDate(invoice.issue_date)}</td>
                  <td className="p-4 text-gray-400">{formatDate(invoice.due_date)}</td>
                  <td className="p-4 text-white">{formatCurrency(invoice.total)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleView(invoice)}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(invoice)}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(invoice)}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
                        title="Edit Invoice"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDeleteModal(true);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-lg p-6 w-full max-w-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Invoice Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedInvoice(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Invoice Number</p>
                  <p className="text-white font-medium">{selectedInvoice.number}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400">Company</p>
                  <p className="text-white font-medium">{selectedInvoice.company?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Client</p>
                  <p className="text-white font-medium">{selectedInvoice.client?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Issue Date</p>
                  <p className="text-white font-medium">{formatDate(selectedInvoice.issue_date)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Due Date</p>
                  <p className="text-white font-medium">{formatDate(selectedInvoice.due_date)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-800 pt-4">
                <p className="text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(selectedInvoice.total)}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => handleDownload(selectedInvoice)}
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedInvoice);
                }}
                className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Delete Invoice</h2>
            <p className="text-gray-400">
              Are you sure you want to delete invoice <span className="text-white font-medium">{selectedInvoice.number}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;