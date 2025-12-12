import { useState } from 'react';
import { Header } from '../components/Header';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does SimpleCryptoMonitor work?',
    answer: 'We monitor your wallet addresses on supported blockchain networks and send you instant notifications when transactions occur. You only provide watch-only addresses, no private keys required.'
  },
  {
    question: 'Is it safe to add my wallet address?',
    answer: 'Yes, completely safe. We only need your public wallet address to monitor transactions. We never ask for or store private keys, seed phrases, or any information that could access your funds.'
  },
  {
    question: 'Which networks and tokens are supported?',
    answer: 'Currently we support USDT on Ethereum (ERC20), Tron (TRC20), and BNB Smart Chain (BEP20). Support for Bitcoin, Ethereum native, USDC, and more networks is coming soon.'
  },
  {
    question: 'How fast are the notifications?',
    answer: 'Free plan users get notifications within 1-2 minutes. Pro plan users get priority monitoring with alerts typically within 30 seconds of transaction confirmation.'
  },
  {
    question: 'Can I monitor multiple wallets?',
    answer: 'Yes! Free plan includes 2 wallets. Pro plan ($4.99/month) allows up to 30 wallets. Need more? Contact us for enterprise pricing.'
  },
  {
    question: 'How do I connect Telegram notifications?',
    answer: 'After adding a wallet, go to your notification settings and connect your Telegram account. You\'ll receive a bot link to complete the connection.'
  },
  {
    question: 'Can I pause monitoring for a wallet?',
    answer: 'Yes, you can pause and resume monitoring for any wallet at any time from your wallet settings.'
  },
  {
    question: 'What happens if I reach my wallet limit?',
    answer: 'If you reach your plan limit, you\'ll need to either upgrade to Pro or delete an existing wallet before adding a new one.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from the Billing page. Your Pro features will remain active until the end of your billing period.'
  }
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-start justify-between text-left"
      >
        <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="FAQ" showBack />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find answers to common questions</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {FAQS.map((faq, index) => (
              <FAQAccordion key={index} item={faq} />
            ))}
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Still have questions?</h3>
            <p className="text-sm text-blue-800 mb-3">
              We're here to help! Reach out to our support team.
            </p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
