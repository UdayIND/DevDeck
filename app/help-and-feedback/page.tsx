"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

export default function HelpAndFeedbackPage() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: "general", label: "General Question", icon: "❓" },
    { id: "bug", label: "Report Bug", icon: "🐛" },
    { id: "feature", label: "Feature Request", icon: "💡" },
    { id: "collaboration", label: "Collaboration Help", icon: "👥" },
  ];

  const faqs = [
    {
      question: "How do I invite team members to collaborate?",
      answer: "In any design tool (whiteboard or slides), click the 'Share' button in the top navigation and enter their email addresses. They'll receive an invitation to join your session.",
    },
    {
      question: "Can I export my whiteboard designs?",
      answer: "Yes! You can export your whiteboard as PNG or PDF by clicking the export button in the toolbar. All objects and drawings will be included.",
    },
    {
      question: "How do I switch between presentation modes?",
      answer: "In the slides editor, click the 'Present' button to enter full-screen presentation mode. Use arrow keys to navigate between slides.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security with Clerk authentication and encrypted data transmission. Your projects are private by default.",
    },
    {
      question: "How do I manage my projects?",
      answer: "Visit the DevHub to create, organize, and manage all your projects. You can also see collaboration activity and project timelines.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to your feedback API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Help & Feedback
          </h1>
          <p className="text-gray-400">Get help or share your thoughts to improve DevDeck</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
                📚 Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="cursor-pointer p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                      <span className="text-white font-medium">{faq.question}</span>
                    </summary>
                    <div className="mt-2 p-4 bg-gray-800/50 rounded-lg text-gray-300 text-sm">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Quick Help</h3>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="/design-desk-jam"
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="text-white font-medium">Whiteboard Tutorial</div>
                    <div className="text-gray-400 text-sm">Learn collaborative drawing</div>
                  </div>
                </a>
                <a
                  href="/design-desk-slides"
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="text-white font-medium">Presentation Guide</div>
                    <div className="text-gray-400 text-sm">Create amazing slides</div>
                  </div>
                </a>
                <a
                  href="/devhub"
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="text-white font-medium">Project Management</div>
                    <div className="text-gray-400 text-sm">Organize your work</div>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Feedback Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
                💬 Send Feedback
              </h2>
              
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-gray-400">
                    We appreciate your input and will review it soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedCategory === category.id
                              ? 'bg-cyan-400 text-black border-cyan-400'
                              : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span className="text-sm font-medium">{category.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us about your experience, report a bug, or suggest a feature..."
                      rows={6}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!feedbackText.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-medium rounded-lg hover:from-cyan-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send Feedback
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-gray-400">support@devdeck.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-xl">💬</span>
                  <div>
                    <div className="font-medium">Community Discord</div>
                    <div className="text-sm text-gray-400">Join our community chat</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="text-xl">📱</span>
                  <div>
                    <div className="font-medium">Status Page</div>
                    <div className="text-sm text-gray-400">Check system status</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 