import React, { useEffect, useState } from 'react';
import { DollarSign, Users, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  activeClients: number;
}

const DashboardCard = ({ title, value, subtitle, icon: Icon, isRevenue = false }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<any>;
  isRevenue?: boolean;
}) => (
  <div className="bg-[#111111] rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors">
    <div className="flex items-start justify-between mb-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <Icon className={`w-6 h-6 ${isRevenue ? 'text-emerald-500' : 'text-gray-400'}`} />
    </div>
    <div>
      <p className={`text-4xl font-bold tracking-tight ${isRevenue ? 'text-emerald-500' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    activeClients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all invoices for the user's companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (!companies?.length) {
        setLoading(false);
        return;
      }

      const companyIds = companies.map(c => c.id);

      // Get invoices stats with their items
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          total,
          status,
          invoice_items (
            total
          )
        `)
        .in('company_id', companyIds);

      if (invoicesError) throw invoicesError;

      // Get active clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .in('company_id', companyIds);

      if (clientsError) throw clientsError;

      // Calculate statistics
      const totalInvoices = invoices?.length || 0;
      const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;
      const totalRevenue = invoices?.reduce((acc, inv) => {
        if (inv.status === 'paid') {
          return acc + (parseFloat(inv.total) || 0);
        }
        return acc;
      }, 0) || 0;

      setStats({
        totalInvoices,
        pendingInvoices,
        totalRevenue,
        activeClients: clientsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111111] rounded-lg p-8 border border-gray-800">
              <div className="animate-pulse">
                <div className="h-6 w-24 bg-gray-800 rounded mb-6"></div>
                <div className="h-10 w-32 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Invoices"
          value={stats.totalInvoices.toLocaleString()}
          subtitle={`${stats.pendingInvoices} pending`}
          icon={Clock}
        />
        <DashboardCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Total earnings"
          icon={DollarSign}
          isRevenue
        />
        <DashboardCard
          title="Clients"
          value={stats.activeClients.toLocaleString()}
          subtitle="Active clients"
          icon={Users}
        />
      </div>
    </div>
  );
};

export default Dashboard;