import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultCurrency: 'USD',
    defaultPaymentTerms: 'Net 30',
    defaultNotes: '',
    defaultTerms: '',
    emailNotifications: true,
    darkMode: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Here you would typically save the settings to your database
      // For now, we'll just show a success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="bg-[#111111] rounded-lg p-6 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Default Currency</label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="COP">COP ($)</option>
                </select>
              </div>

              {/* Default Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-300">Default Payment Terms</label>
                <select
                  value={settings.defaultPaymentTerms}
                  onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 7">Net 7</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>

              {/* Default Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Default Invoice Notes</label>
                <textarea
                  value={settings.defaultNotes}
                  onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                  placeholder="These notes will appear on all new invoices by default"
                />
              </div>

              {/* Default Terms */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Default Terms & Conditions</label>
                <textarea
                  value={settings.defaultTerms}
                  onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                  placeholder="These terms will appear on all new invoices by default"
                />
              </div>

              {/* Notifications */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-700 bg-black text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-300">Email Notifications</span>
                </label>
                <p className="mt-1 text-sm text-gray-400">Receive email notifications for new invoices and payments</p>
              </div>

              {/* Dark Mode */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-700 bg-black text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-300">Dark Mode</span>
                </label>
                <p className="mt-1 text-sm text-gray-400">Use dark theme throughout the application</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;