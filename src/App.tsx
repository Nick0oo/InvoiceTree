import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import InvoiceList from './components/InvoiceList';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CompanyForm from './components/CompanyForm';
import CompanyList from './components/CompanyList';
import ClientList from './components/ClientList';
import Settings from './components/Settings';
import { LayoutDashboard, FileText, Users, Building2, Settings as SettingsIcon, LogOut, PlusCircle } from 'lucide-react';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [hasCompany, setHasCompany] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'clients' | 'companies' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkCompany(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkCompany(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkCompany = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId);

      if (error) throw error;
      setHasCompany(data && data.length > 0);
    } catch (error) {
      console.error('Error checking company:', error);
      setHasCompany(false);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <Auth />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!hasCompany) {
    return <CompanyForm />;
  }

  const menuItems = [
    { icon: <PlusCircle className="w-5 h-5" />, label: 'New Invoice', onClick: () => setCurrentView('invoices') },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', view: 'dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Invoices', view: 'invoices' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Companies', view: 'companies' },
    { icon: <Users className="w-5 h-5" />, label: 'Clients', view: 'clients' },
    { icon: <SettingsIcon className="w-5 h-5" />, label: 'Settings', view: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-64 bg-[#111111] border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-emerald-500" />
            <h1 className="text-xl font-bold text-white">InvoiceTree</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.view ? setCurrentView(item.view as any) : item.onClick?.()}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors
                ${index === 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 
                item.view === currentView ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center space-x-3 w-full p-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'invoices' && <InvoiceList />}
        {currentView === 'companies' && <CompanyList />}
        {currentView === 'clients' && <ClientList />}
        {currentView === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default App;