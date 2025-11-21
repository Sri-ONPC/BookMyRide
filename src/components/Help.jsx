import React, { useState } from 'react';

const faqs = [
  {
    category: 'Booking',
    icon: '🎫',
    questions: [
      {
        q: 'How do I book a ticket?',
        a: 'Simply search for your route on the home page, select your preferred bus/train, choose your seats, fill in passenger details, and confirm your booking. No payment is required as bookings are stored directly in our system.'
      },
      {
        q: 'Can I book multiple seats at once?',
        a: 'Yes! You can select multiple seats in the seat selection screen. The total price will be automatically calculated based on the number of seats you choose.'
      },
      {
        q: 'How do I cancel or modify my booking?',
        a: 'Contact our admin team through the support email or phone number. Currently, self-service cancellation is being developed.'
      }
    ]
  },
  {
    category: 'Payment',
    icon: '💳',
    questions: [
      {
        q: 'Do I need to pay online?',
        a: 'No, this is a demo booking system. Your bookings are stored in Firebase without any payment processing. In a production system, payment would be collected at the counter or through integrated payment gateways.'
      },
      {
        q: 'Will I get a refund if I cancel?',
        a: 'Refund policies would be determined by the operator. Contact support for cancellation and refund requests.'
      }
    ]
  },
  {
    category: 'Journey',
    icon: '🚌',
    questions: [
      {
        q: 'When should I arrive at the boarding point?',
        a: 'Please arrive at least 15 minutes before the scheduled departure time. This allows time for ticket verification and boarding.'
      },
      {
        q: 'What documents do I need to carry?',
        a: 'Carry a valid government-issued ID proof (Aadhar Card, Driving License, Passport, etc.) and your booking confirmation/ticket.'
      },
      {
        q: 'Can I change my seat after booking?',
        a: 'Seat changes are subject to availability. Contact our support team with your booking ID to request a seat change.'
      }
    ]
  },
  {
    category: 'Account',
    icon: '👤',
    questions: [
      {
        q: 'Do I need an account to book?',
        a: 'Yes, you need to create an account to manage your bookings. This helps you track your journey history and receive updates.'
      },
      {
        q: 'I forgot my password. What should I do?',
        a: 'Click on "Forgot Password" on the login page. You will receive a password reset link via email. (Feature to be implemented with Firebase Auth)'
      },
      {
        q: 'How do I view my booking history?',
        a: 'After logging in, go to "My Bookings" from the navigation menu. You will see all your past and upcoming bookings there.'
      }
    ]
  }
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFaq = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  // Filter FAQs based on search
  const filteredFaqs = searchTerm ? faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0) : faqs;

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{
        marginBottom: 32,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        textAlign: 'center',
        padding: 48
      }}>
        <div style={{fontSize: 64, marginBottom: 16}}>❓</div>
        <h1 style={{margin: '0 0 12px 0', fontSize: 36, color: 'white'}}>
          Help Center
        </h1>
        <p style={{margin: 0, fontSize: 16, opacity: 0.9}}>
          Find answers to commonly asked questions
        </p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{marginBottom: 32}}>
        <div style={{position: 'relative'}}>
          <span style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 20
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 52px',
              fontSize: 16,
              borderRadius: 12,
              border: '2px solid #e5e7eb'
            }}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        <div className="card" style={{
          textAlign: 'center',
          cursor: 'pointer',
          borderTop: '4px solid #3b82f6'
        }}>
          <div style={{fontSize: 40, marginBottom: 12}}>📞</div>
          <div style={{fontWeight: 'bold', marginBottom: 4}}>Call Us</div>
          <div style={{fontSize: 14, color: '#3b82f6', fontWeight: '600'}}>
            1800-XXX-XXXX
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          cursor: 'pointer',
          borderTop: '4px solid #22c55e'
        }}>
          <div style={{fontSize: 40, marginBottom: 12}}>📧</div>
          <div style={{fontWeight: 'bold', marginBottom: 4}}>Email Us</div>
          <div style={{fontSize: 14, color: '#22c55e', fontWeight: '600'}}>
            support@bookmyride.com
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          cursor: 'pointer',
          borderTop: '4px solid #f59e0b'
        }}>
          <div style={{fontSize: 40, marginBottom: 12}}>💬</div>
          <div style={{fontWeight: 'bold', marginBottom: 4}}>Live Chat</div>
          <div style={{fontSize: 14, color: '#f59e0b', fontWeight: '600'}}>
            Available 24/7
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      {filteredFaqs.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: 60}}>
          <div style={{fontSize: 64, marginBottom: 16}}>🔍</div>
          <h3>No results found</h3>
          <p className="muted">Try a different search term</p>
        </div>
      ) : (
        filteredFaqs.map((category, catIdx) => (
          <div key={catIdx} style={{marginBottom: 32}}>
            <h2 style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              fontSize: 24
            }}>
              <span style={{fontSize: 32}}>{category.icon}</span>
              {category.category}
            </h2>

            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              {category.questions.map((faq, qIdx) => {
                const isOpen = openIndex === `${catIdx}-${qIdx}`;
                return (
                  <div
                    key={qIdx}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: isOpen ? '2px solid #f59e0b' : '2px solid transparent'
                    }}
                    onClick={() => toggleFaq(catIdx, qIdx)}>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16
                    }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: 16,
                        color: '#5B3924',
                        flex: 1
                      }}>
                        {faq.q}
                      </div>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isOpen ? '#f59e0b' : '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        transition: 'all 0.3s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        {isOpen ? '−' : '+'}
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: '2px solid #f3f4f6',
                        color: '#6b7280',
                        lineHeight: 1.8,
                        animation: 'fadeIn 0.3s ease'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Still Need Help */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        textAlign: 'center',
        padding: 48
      }}>
        <div style={{fontSize: 48, marginBottom: 16}}>🤝</div>
        <h3 style={{margin: '0 0 12px 0', color: '#1e3a8a'}}>
          Still need help?
        </h3>
        <p style={{color: '#1e40af', marginBottom: 24}}>
          Our support team is available 24/7 to assist you
        </p>
        <div style={{display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap'}}>
          <button className="btn" style={{padding: '12px 32px'}}>
            📞 Call Support
          </button>
          <button style={{
            padding: '12px 32px',
            background: 'white',
            border: '2px solid #3b82f6',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: '600',
            color: '#1e40af',
            fontSize: 15
          }}>
            📧 Email Support
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}