import { PLAN_CONFIG, ADDON_CONFIG } from '../constants';

export interface TenantSubscription {
  planId: string;
  addons: string[];
}

export const checkFeatureAccess = (subscription: TenantSubscription, featureKey: string) => {
  // 1. Check if the plan is valid
  const plan = Object.values(PLAN_CONFIG).find(p => p.id === subscription.planId);
  if (!plan) return false;

  // 2. Check Plan Level Features
  if (featureKey === 'ai_chat') {
     // FLASH, PRO, ENTERPRISE have AI Chat
     return ['flash', 'pro', 'enterprise'].includes(plan.id);
  }
  
  if (featureKey === 'posyandu') {
     // Check if it's explicitly in plan features or is an addon
     // Based on constants, it seems it might be an addon, but let's check
  }

  if (featureKey === 'custom_logo') {
     // FLASH, PRO, PREMIUM, ENTERPRISE have custom logo
     // Basically everything except STARTER (Free Trial)
     return ['flash', 'pro', 'premium', 'enterprise', 'gov'].includes(plan.id);
  }

  if (featureKey === 'complaint') {
    // Complaint is free for all
    return true;
  }

  if (featureKey === 'booking') {
    // Booking is free for FLASH and above
    return ['flash', 'pro', 'premium', 'enterprise', 'gov'].includes(plan.id);
  }

  // 3. Check Addons
  const hasAddon = subscription.addons.some(addonId => {
    const addon = Object.values(ADDON_CONFIG).find(a => a.id === addonId);
    return addon?.featureKey === featureKey;
  });

  return hasAddon;
};
