import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CreditCard, DollarSign, Receipt, Save, Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';

const BillingSettings = () => {
  const { currentTheme } = useTheme();
  const [billingSettings, setBillingSettings] = useState({
    subscription: {
      plan: 'free',
      status: 'active',
      nextBillingDate: '2024-04-01'
    },
    paymentMethods: [
      {
        id: '1',
        type: 'visa',
        last4: '4242',
        expiry: '12/25',
        isDefault: true
      }
    ],
    billingHistory: [
      {
        id: '1',
        date: '2024-03-01',
        amount: '$9.99',
        status: 'paid',
        description: 'Monthly Subscription'
      }
    ]
  });

  const handlePlanChange = (plan) => {
    setBillingSettings(prev => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        plan
      }
    }));
  };

  const handleAddPaymentMethod = () => {
    // TODO: Implement payment method addition
    console.log('Adding new payment method');
  };

  const handleRemovePaymentMethod = (id) => {
    // TODO: Implement payment method removal
    console.log('Removing payment method:', id);
  };

  const handleSetDefaultPaymentMethod = (id) => {
    setBillingSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving billing settings:', billingSettings);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: currentTheme.colors.text }}
        >
          Billing Settings
        </h2>
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Subscription Plan */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <DollarSign size={20} />
            <span>Subscription Plan</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handlePlanChange('free')}
              className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                billingSettings.subscription.plan === 'free'
                  ? 'bg-opacity-10 bg-current'
                  : 'hover:bg-opacity-5 hover:bg-current'
              }`}

              style={{ 
                backgroundColor: billingSettings.subscription.plan === 'free' ? currentTheme.colors.primary : 'transparent',
                color: billingSettings.subscription.plan === 'free' ? currentTheme.colors.background : currentTheme.colors.text
              }}
            >
              <span className="text-xl font-semibold">Free</span>
              <span className="text-sm">$0/month</span>
            </button>
            <button
              onClick={() => handlePlanChange('pro')}
              className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                billingSettings.subscription.plan === 'pro'
                  ? 'bg-opacity-10 bg-current'
                  : 'hover:bg-opacity-5 hover:bg-current'
              }`}

              style={{ 
                backgroundColor: billingSettings.subscription.plan === 'pro' ? currentTheme.colors.primary : 'transparent',
                color: billingSettings.subscription.plan === 'pro' ? currentTheme.colors.background : currentTheme.colors.text
              }}
              >
              <span className="text-xl font-semibold">Pro</span>
              <span className="text-sm">$9.99/month</span>
            </button>
            <button
              onClick={() => handlePlanChange('enterprise')}
              className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
                billingSettings.subscription.plan === 'enterprise'
                  ? 'bg-opacity-10 bg-current'
                  : 'hover:bg-opacity-5 hover:bg-current'
              }`}
              
              style={{ 
                backgroundColor: billingSettings.subscription.plan === 'enterprise' ? currentTheme.colors.primary : 'transparent',
                color: billingSettings.subscription.plan === 'enterprise' ? currentTheme.colors.background : currentTheme.colors.text
              }}
            >
              <span className="text-xl font-semibold">Enterprise</span>
              <span className="text-sm">Contact Sales</span>
            </button>
          </div>
          <div className="mt-4 text-sm" style={{ color: currentTheme.colors.text }}>
            <p>Current Plan: {billingSettings.subscription.plan}</p>
            <p>Status: {billingSettings.subscription.status}</p>
            <p>Next Billing Date: {billingSettings.subscription.nextBillingDate}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-lg font-medium flex items-center space-x-2"
              style={{ color: currentTheme.colors.text }}
            >
              <CreditCard size={20} />
              <span>Payment Methods</span>
            </h3>
            <Button
              onClick={handleAddPaymentMethod}
              className="flex items-center space-x-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Plus size={16} />
              <span>Add Payment Method</span>
            </Button>
          </div>
          <div className="space-y-4">
            {billingSettings.paymentMethods.map(method => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 rounded flex items-center justify-center bg-gray-100">
                    <span className="text-sm font-medium">{method.type.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                      •••• {method.last4}
                    </p>
                    <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                      Expires {method.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {method.isDefault ? (
                    <span className="text-sm" style={{ color: currentTheme.colors.primary }}>
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      className="text-sm hover:underline"
                      style={{ color: currentTheme.colors.primary }}
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <h3 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            style={{ color: currentTheme.colors.text }}
          >
            <Receipt size={20} />
            <span>Billing History</span>
          </h3>
          <div className="space-y-4">
            {billingSettings.billingHistory.map(record => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                    {record.description}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                    {record.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                    {record.amount}
                  </p>
                  <p 
                    className={`text-sm ${
                      record.status === 'paid' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {record.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings; 