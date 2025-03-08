import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Building2, Mail, Phone, FileText } from 'lucide-react';

interface CompanyFormData {
  name: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
}

const CompanyForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanyFormData>();

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('companies')
        .insert([
          {
            ...data,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      // Refresh the page to show the dashboard
      window.location.reload();
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2">
            <FileText className="h-12 w-12 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">InvoiceTree</h1>
          </div>
          <p className="mt-2 text-gray-400">Set up your company profile to get started</p>
        </div>

        <div className="bg-[#111111] rounded-lg p-6 border border-gray-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Company Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('name', { required: 'Company name is required' })}
                  className="block w-full pl-10 bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Your Company Name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Tax ID</label>
              <input
                type="text"
                {...register('tax_id')}
                className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Tax ID / VAT Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Address</label>
              <textarea
                {...register('address')}
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
                  {...register('phone')}
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
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="block w-full pl-10 bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="company@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Company Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;