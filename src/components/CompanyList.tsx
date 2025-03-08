import React, { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Company {
  id: string;
  name: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
}

const CompanyList = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('companies')
        .insert([
          {
            ...formData,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      setShowForm(false);
      setFormData({});
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Companies</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Company
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-lg p-6 w-full max-w-2xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">New Company</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Company Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Tax ID</label>
                  <input
                    type="text"
                    value={formData.tax_id || ''}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Tax ID"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300">Address</label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Company Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Phone</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="block w-full pl-10 bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="company@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-[#111111] rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{company.name}</h3>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-white">
                  <Pencil className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            {company.tax_id && (
              <p className="text-gray-400 text-sm mb-2">Tax ID: {company.tax_id}</p>
            )}
            {company.address && (
              <p className="text-gray-400 text-sm mb-2">{company.address}</p>
            )}
            <div className="space-y-1">
              {company.phone && (
                <div className="flex items-center text-gray-400 text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  {company.phone}
                </div>
              )}
              {company.email && (
                <div className="flex items-center text-gray-400 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  {company.email}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyList;