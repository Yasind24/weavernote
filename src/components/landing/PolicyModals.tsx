import React from 'react';
import { X } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

function PolicyModal({ isOpen, onClose, title, content }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none overflow-y-auto max-h-[70vh] prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:text-yellow-700">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PolicyModals() {
  const [openModal, setOpenModal] = React.useState<'faq' | 'privacy' | 'terms' | null>(null);

  const faqContent = (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-2">What is Weavernote?</h4>
        <p>Weavernote is a microSaaS platform designed to help users create, organize, and visualize notes efficiently. It features tools for AI-driven summarization, flashcard generation, and quiz creation, catering to students, professionals, and productivity enthusiasts.</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Is Weavernote free?</h4>
        <p>Currently, Weavernote offers only a Lifetime Access Plan. In the future, we plan to introduce subscriptions with additional options.</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">How secure is my data?</h4>
        <p>Weavernote does not encrypt data but ensures responsible handling of user information. Since the platform leverages AI tools, users should avoid sharing sensitive or confidential data.</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Can I upgrade my plan later?</h4>
        <p>As of now, there is only one Lifetime Access Plan available.</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">What platforms is Weavernote available on?</h4>
        <p>The Weavernote web app is fully mobile-compatible. In the future, we plan to develop a Progressive Web App (PWA) for enhanced accessibility.</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">How do I contact support?</h4>
        <p>Weavernote is run by a solo founder. You can directly reach out for support via email at <a href="mailto:connect@weavernote.com" className="text-yellow-600 hover:text-yellow-700">connect@weavernote.com</a>.</p>
      </div>
    </div>
  );

  const privacyContent = (
    <div>
      <h4>Introduction</h4>
      <p>Weavernote is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our services.</p>

      <h4>Information We Collect</h4>
      <ul>
        <li><strong>Account Information:</strong> Email address, name, and password.</li>
        <li><strong>Usage Data:</strong> Interactions with the app, including note creations, visualizations, and AI tool usage.</li>
        <li><strong>Payment Information:</strong> Processed securely through third-party payment gateways (e.g., Lemonsqueezy).</li>
      </ul>

      <h4>How We Use Your Information</h4>
      <ul>
        <li>To provide and improve our services.</li>
        <li>To process transactions and communicate updates.</li>
        <li>For analytics to enhance user experience.</li>
      </ul>

      <h4>Data Sharing</h4>
      <p>We do not sell or share your data with third parties unless required for legal purposes or service provision (e.g., payment processing).</p>

      <h4>Data Retention</h4>
      <p>We retain your data for as long as you have an active account. You can request deletion at any time by contacting <a href="mailto:connect@weavernote.com">connect@weavernote.com</a>.</p>

      <h4>Your Rights</h4>
      <ul>
        <li>Access your data.</li>
        <li>Request data deletion.</li>
        <li>Opt-out of promotional communications.</li>
      </ul>

      <h4>Updates to This Policy</h4>
      <p>We may update this Privacy Policy periodically. Changes will be communicated via email or app notifications.</p>
    </div>
  );

  const termsContent = (
    <div>
      <h4>Introduction</h4>
      <p>By using Weavernote, you agree to the following terms and conditions. Please read them carefully before accessing our services.</p>

      <h4>Account Registration</h4>
      <ul>
        <li>Users must provide accurate and complete information during registration.</li>
        <li>You are responsible for maintaining the confidentiality of your account.</li>
      </ul>

      <h4>Acceptable Use</h4>
      <ul>
        <li>Do not use Weavernote for unlawful activities.</li>
        <li>Do not attempt to access or disrupt the service's infrastructure.</li>
      </ul>

      <h4>Payments</h4>
      <ul>
        <li>All purchases are non-refundable unless specified otherwise.</li>
        <li>Payments are processed securely through third-party services.</li>
      </ul>

      <h4>Intellectual Property</h4>
      <ul>
        <li>Weavernote owns all rights to its branding, interface, and features.</li>
        <li>Content you create remains yours; however, you grant Weavernote a license to store and process it for service functionality.</li>
      </ul>

      <h4>Liability</h4>
      <ul>
        <li>Weavernote is provided "as is" without warranties of any kind.</li>
        <li>We are not liable for any data loss or service interruption.</li>
      </ul>

      <h4>Termination</h4>
      <p>We reserve the right to suspend or terminate accounts for violations of these terms.</p>

      <h4>Changes to Terms</h4>
      <p>We may update these Terms & Conditions from time to time. Continued use of Weavernote constitutes acceptance of the revised terms.</p>
    </div>
  );

  return (
    <>
      <div className="flex justify-center space-x-4 text-sm">
        <button
          onClick={() => setOpenModal('faq')}
          className="text-gray-600 hover:text-yellow-600 transition-colors"
        >
          FAQ
        </button>
        <button
          onClick={() => setOpenModal('privacy')}
          className="text-gray-600 hover:text-yellow-600 transition-colors"
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setOpenModal('terms')}
          className="text-gray-600 hover:text-yellow-600 transition-colors"
        >
          Terms & Conditions
        </button>
      </div>

      <PolicyModal
        isOpen={openModal === 'faq'}
        onClose={() => setOpenModal(null)}
        title="Frequently Asked Questions"
        content={faqContent}
      />
      <PolicyModal
        isOpen={openModal === 'privacy'}
        onClose={() => setOpenModal(null)}
        title="Privacy Policy"
        content={privacyContent}
      />
      <PolicyModal
        isOpen={openModal === 'terms'}
        onClose={() => setOpenModal(null)}
        title="Terms & Conditions"
        content={termsContent}
      />
    </>
  );
} 