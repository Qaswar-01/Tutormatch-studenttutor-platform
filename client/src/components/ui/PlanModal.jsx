import React from 'react';
import { X, Check, CreditCard, Calendar } from 'lucide-react';
import './PlanModal.css';

const PlanModal = ({ isOpen, onClose, plan, billingCycle, onConfirm, isProcessing }) => {
  if (!isOpen || !plan) return null;

  const getPrice = () => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = () => {
    if (billingCycle === 'yearly') {
      const monthlyCost = plan.monthlyPrice * 12;
      const yearlyCost = plan.yearlyPrice;
      return monthlyCost - yearlyCost;
    }
    return 0;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Your Plan Selection</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="plan-summary">
            <div className="plan-badge">
              {plan.popular && <span className="popular-tag">Most Popular</span>}
              <h3>{plan.name} Plan</h3>
            </div>
            
            <div className="plan-price">
              <span className="currency">$</span>
              <span className="amount">{getPrice()}</span>
              <span className="period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            
            {billingCycle === 'yearly' && getSavings() > 0 && (
              <div className="savings-info">
                <span className="savings-badge">Save ${getSavings()} per year</span>
              </div>
            )}
          </div>

          <div className="plan-features-summary">
            <h4>What's included:</h4>
            <ul>
              {plan.features.slice(0, 5).map((feature, index) => (
                <li key={index}>
                  <Check size={16} className="check-icon" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 5 && (
                <li className="more-features">
                  + {plan.features.length - 5} more features
                </li>
              )}
            </ul>
          </div>

          <div className="billing-info">
            <div className="billing-item">
              <Calendar className="billing-icon" />
              <span>Billing: {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
            </div>
            <div className="billing-item">
              <CreditCard className="billing-icon" />
              <span>7-day free trial included</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
