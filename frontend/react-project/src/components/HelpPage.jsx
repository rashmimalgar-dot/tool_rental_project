// src/components/HelpPage.jsx
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiInfo, FiHelpCircle, FiPhone } from "react-icons/fi";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    //{ q: "How do I reset my password?", a: "Go to Settings → Change Password and enter your new password." },
    { q: "Can I edit or delete a tool I listed?", a: "Yes, go to My List, select your tool, and edit or delete it." },
    { q: "What if I don’t return a tool on time?", a: "Please contact the lender directly to request an extension." },
    { q: "Is my phone number visible to other users?", a: "Your phone number is only visible to confirmed borrowers for safety." },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Help & Support</h1>

      {/* About Section */}
      <Card icon={<FiInfo />} title="About">
        <p className="text-gray-700 leading-relaxed">
          ToolShare helps neighbors borrow and lend tools easily. List your tools, borrow from others, and track your history in one place.
        </p>
      </Card>

      {/* How to Use */}
      <Card icon={<FiHelpCircle />} title="How to Use">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><b>Lend:</b> Add a tool you want to share with neighbors.</li>
          <li><b>Borrow:</b> Browse tools and request to borrow.</li>
          <li><b>My List:</b> Track your borrowed and lent tools.</li>
          <li><b>Profile:</b> Update your personal information.</li>
          <li><b>Settings:</b> Manage preferences.</li>
        </ul>
      </Card>

      {/* FAQ Section */}
      <Card icon={<FiHelpCircle />} title="Frequently Asked Questions">
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                className="w-full flex justify-between items-center p-4 bg-gray-50 font-medium text-gray-800"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.q}
                {openIndex === index ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {openIndex === index && (
                <div className="p-4 text-gray-700 bg-white border-t border-gray-200 transition-all duration-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Contact Support */}
      <Card icon={<FiPhone />} title="Contact Support">
        <p>Email: <a href="mailto:support@toolshare.com" className="text-blue-600 hover:underline">support@toolshare.com</a></p>
        <p>Phone: +91-9876543210</p>
      </Card>

      {/* Safety & Guidelines */}
      <Card icon={<FiInfo />} title="Safety & Guidelines">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Return borrowed tools in good condition.</li>
          <li>Respect time limits agreed with lenders.</li>
          <li>Report suspicious activity immediately.</li>
        </ul>
      </Card>
    </div>
  );
}

// Reusable Card component
function Card({ icon, title, children }) {
  return (
    <div className="border rounded-xl p-6 shadow-md bg-white space-y-3 hover:shadow-lg transition-shadow duration-300">
      <h3 className="flex items-center text-2xl font-semibold space-x-3 text-gray-800 mb-2">
        {icon} <span>{title}</span>
      </h3>
      <div>{children}</div>
    </div>
  );
}
