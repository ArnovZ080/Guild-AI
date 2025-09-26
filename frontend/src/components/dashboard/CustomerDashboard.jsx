import React, { useMemo } from 'react';
import CustomerDashboardMain from './CustomerDashboardMain.jsx';
import { useCustomerAnalysis, useCustomerProfiles, useCustomerSegments } from '../../services/customerIntelligence.js';

const CustomerDashboard = () => {
  const { analysis } = useCustomerAnalysis();
  const { profiles } = useCustomerProfiles('all', 50);
  const { segments } = useCustomerSegments();

  const data = useMemo(() => {
    const customer_analysis = analysis?.data || analysis || null;
    const customer_profiles = profiles || [];
    const customer_segments = segments || [];
    const cross_agent_meta_kpis = null;
    return { customer_analysis, customer_profiles, customer_segments, cross_agent_meta_kpis };
  }, [analysis, profiles, segments]);

  return (
    <div className="space-y-6">
      <CustomerDashboardMain data={data} onCustomerAction={() => {}} onSegmentAction={() => {}} />
    </div>
  );
};

export default CustomerDashboard;
