import React, { useState, useEffect } from 'react';
import { fetchSubscriptionStatus, TenantSubscription } from '../services/subscriptionService';
import PaymentPage from './PaymentPage';

interface Props {
  tenantId: string;
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<Props> = ({ tenantId, children }) => {
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus(tenantId).then(sub => {
      setSubscription(sub);
      setLoading(false);
    });
  }, [tenantId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If no subscription or inactive/expired, show PaymentPage
  if (!subscription || (subscription.status !== 'Active' && subscription.status !== 'Trial') || new Date(subscription.endDate) < new Date()) {
    return <PaymentPage />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
