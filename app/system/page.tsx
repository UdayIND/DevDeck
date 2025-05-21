"use client";
import Link from "next/link";

export default function System() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-4 text-neon">System Settings</h1>
      <p className="text-xl mb-8 text-gray-300">Manage your account, preferences, and integrations.</p>
      <div className="w-full max-w-5xl bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-8">
        {/* Profile Settings */}
        <div className="font-semibold text-accent-cyan mb-2">Profile</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Edit name, email, password, avatar ]</div>
        {/* Theme & Accessibility */}
        <div className="font-semibold text-accent-purple mb-2">Theme & Accessibility</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Theme switcher, accessibility options ]</div>
        {/* Notifications */}
        <div className="font-semibold text-accent-cyan mb-2">Notifications</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Notification preferences ]</div>
        {/* Integrations */}
        <div className="font-semibold text-accent-purple mb-2">Integrations</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: Google Drive, Slack, GitHub, etc. ]</div>
        {/* API Keys & Security */}
        <div className="font-semibold text-accent-cyan mb-2">API Keys & Security</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300 mb-4">[ TODO: API keys, 2FA, device management ]</div>
        {/* Billing */}
        <div className="font-semibold text-accent-purple mb-2">Billing & Subscription</div>
        <div className="bg-gray-800 rounded p-2 text-gray-300">[ TODO: Billing info, subscription management ]</div>
      </div>
      <Link href="/" className="btn-neon px-6 py-2 rounded-full font-semibold mt-8">Back to Home</Link>
    </div>
  );
} 