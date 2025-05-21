"use client";
import Link from "next/link";

export default function HelpAndFeedback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-4 text-neon">Help & Feedback</h1>
      <p className="text-xl mb-8 text-gray-300">Get support, give feedback, and find answers.</p>
      <div className="w-full max-w-5xl bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-8">
        {/* FAQ & Docs */}
        <div className="font-semibold text-accent-cyan mb-2">FAQ & Documentation</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Searchable FAQ, docs, tutorials ]</div>
        {/* Contact Support */}
        <div className="font-semibold text-accent-purple mb-2">Contact Support</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Email, chat, ticket form ]</div>
        {/* Feature Request & Bug Report */}
        <div className="font-semibold text-accent-cyan mb-2">Feature Request / Bug Report</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Submit feature requests, report bugs ]</div>
        {/* Community & Changelog */}
        <div className="font-semibold text-accent-purple mb-2">Community & Changelog</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300">[ TODO: Discord, forums, changelog, updates ]</div>
      </div>
      <Link href="/" className="btn-neon px-6 py-2 rounded-full font-semibold mt-8">Back to Home</Link>
    </div>
  );
} 