import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import FinancialDashboardView from './FinancialDashboardView.jsx';
import { MainDashboard as LegacyMainDashboard } from '@/components/dashboard/MainDashboard.tsx';
import ContentDashboard from '@/components/dashboard/ContentDashboard.jsx';
import CustomersView from './CustomersView.jsx';
import ConversationsTab from '@/components/dashboard/ConversationsTab.jsx';

const TAB_CONFIG = [
  { id: 'overview', label: 'Overview', component: LegacyMainDashboard },
  { id: 'finances', label: 'Finances', component: FinancialDashboardView },
  { id: 'content', label: 'Content', component: ContentDashboard },
  { id: 'customers', label: 'Customers', component: CustomersView },
  { id: 'conversations', label: 'Conversations', component: ConversationsTab },
];

const validTab = (value) => TAB_CONFIG.some(t => t.id === value);

const BusinessDashboardView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const initialTab = validTab(params?.tab) ? params.tab : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (!validTab(params?.tab)) {
      navigate('/dashboard/finances', { replace: true });
    } else if (params?.tab !== activeTab) {
      setActiveTab(params.tab);
    }
  }, [params?.tab]);

  const ActiveComponent = useMemo(() => {
    const found = TAB_CONFIG.find(t => t.id === activeTab) || TAB_CONFIG[0];
    return found.component;
  }, [activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(`/dashboard/${tab.id}`)}
                className={`px-4 py-2.5 text-sm sm:text-base rounded-lg ${activeTab===tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <ActiveComponent />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardView;


