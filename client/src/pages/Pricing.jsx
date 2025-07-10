import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Check, Star, Users, Clock, MessageCircle, Video, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PlanModal from '../components/ui/PlanModal';
import './Pricing.css';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for occasional learning',
      monthlyPrice: 29,
      yearlyPrice: 290,
      popular: false,
      features: [
        'Up to 4 sessions per month',
        'Access to verified tutors',
        'Basic chat support',
        'Session recordings',
        'Mobile app access',
        'Email support'
      ],
      limitations: [
        'No priority booking',
        'Standard video quality',
        'Limited tutor selection'
      ]
    },
    {
      name: 'Pro',
      description: 'Most popular for regular learners',
      monthlyPrice: 59,
      yearlyPrice: 590,
      popular: true,
      features: [
        'Up to 12 sessions per month',
        'Access to all tutors',
        'Priority booking',
        'HD video sessions',
        'Real-time chat',
        'Session recordings',
        'Mobile app access',
        'Priority support',
        'Progress tracking',
        'Study materials'
      ],
      limitations: []
    },
    {
      name: 'Premium',
      description: 'For intensive learning goals',
      monthlyPrice: 99,
      yearlyPrice: 990,
      popular: false,
      features: [
        'Unlimited sessions',
        'Access to premium tutors',
        'Instant booking',
        '4K video sessions',
        'Real-time chat',
        'Session recordings',
        'Mobile app access',
        '24/7 priority support',
        'Advanced progress tracking',
        'Personalized study plans',
        'Group session access',
        'Dedicated account manager'
      ],
      limitations: []
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Tutors',
      description: 'All tutors are background-checked and credential-verified'
    },
    {
      icon: Video,
      title: 'HD Video Sessions',
      description: 'Crystal clear video and audio for the best learning experience'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Communicate with tutors before, during, and after sessions'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: '24/7 availability with easy booking and rescheduling'
    }
  ];

  const getPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return monthlyCost - yearlyCost;
  };

  const handleChoosePlan = (plan) => {
    if (isProcessing) return;

    if (!isAuthenticated) {
      // Redirect to register with plan info
      toast.info('Please sign up to choose a plan');
      navigate(`/register?plan=${plan.name.toLowerCase()}&billing=${billingCycle}`);
      return;
    }

    // Show confirmation modal
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      // Simulate plan selection process
      toast.loading('Processing your plan selection...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful plan selection
      toast.dismiss();
      toast.success(`🎉 Successfully selected ${selectedPlan.name} plan!`);

      // Close modal and redirect
      setShowModal(false);
      setSelectedPlan(null);
      navigate('/dashboard?newPlan=true');

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to select plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartFreeTrial = async (plan) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (!isAuthenticated) {
        toast.info('Please sign up to start your free trial');
        navigate(`/register?trial=${plan.name.toLowerCase()}&billing=${billingCycle}`);
        return;
      }

      toast.loading('Starting your free trial...');

      // Simulate free trial setup
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.dismiss();
      toast.success(`🎉 Your 7-day free trial for ${plan.name} plan has started!`);

      // Redirect to dashboard with trial info
      navigate('/dashboard?trial=started');

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to start free trial. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactSales = () => {
    // Open contact form or redirect to contact page
    toast.info('Redirecting to sales team...');

    // In a real app, this could open a chat widget or contact form
    setTimeout(() => {
      navigate('/contact?inquiry=sales');
    }, 1000);
  };

  return (
    <div className="pricing-page">
      <div className="container">
        {/* Hero Section */}
        <div className="pricing-hero">
          <h1>Choose Your Learning Plan</h1>
          <p>Flexible pricing options to fit your learning goals and budget. Start with a free trial and upgrade anytime.</p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <button 
              className="toggle-switch"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            >
              <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : ''}`}></div>
            </button>
            <span className={billingCycle === 'yearly' ? 'active' : ''}>
              Yearly <span className="savings-badge">Save up to 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <section className="pricing-section">
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">{getPrice(plan)}</span>
                    <span className="period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="savings">Save ${getSavings(plan)} per year</div>
                  )}
                </div>

                <div className="plan-features">
                  <ul>
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check size={16} className="check-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`plan-button ${plan.popular ? 'primary' : 'outline'}`}
                  onClick={() => plan.popular ? handleStartFreeTrial(plan) : handleChoosePlan(plan)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    plan.popular ? 'Starting Trial...' : 'Processing...'
                  ) : (
                    plan.popular ? 'Start Free Trial' : 'Choose Plan'
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>What's Included in All Plans</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <feature.icon className="feature-icon" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I change my plan anytime?</h4>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="faq-item">
              <h4>Is there a free trial?</h4>
              <p>Yes, all plans come with a 7-day free trial. No credit card required to start.</p>
            </div>
            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards, PayPal, and bank transfers for yearly plans.</p>
            </div>
            <div className="faq-item">
              <h4>Can I cancel anytime?</h4>
              <p>Yes, you can cancel your subscription at any time. No cancellation fees or long-term commitments.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pricing-cta">
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of students who have achieved their goals with TutorMatch.</p>
          <div className="cta-buttons">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleStartFreeTrial(plans[1])} // Pro plan for free trial
              disabled={isProcessing}
            >
              {isProcessing ? 'Starting Trial...' : 'Start Free Trial'}
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={handleContactSales}
            >
              Contact Sales
            </button>
          </div>
        </section>

        {/* Plan Selection Modal */}
        <PlanModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          billingCycle={billingCycle}
          onConfirm={handleConfirmPlan}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default Pricing;
