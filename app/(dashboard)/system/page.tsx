"use client";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SystemPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            System Settings
          </h1>
          <p className="text-gray-400">Customize your DevDeck experience</p>
        </motion.div>

        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <div className="bg-gray-800 rounded p-3 text-gray-300">
                  {user?.firstName} {user?.lastName}
                </div>
                <p className="text-xs text-gray-500 mt-1">Managed by Clerk authentication</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="bg-gray-800 rounded p-3 text-gray-300">
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
                <p className="text-xs text-gray-500 mt-1">Managed by Clerk authentication</p>
              </div>
            </div>
          </motion.div>

          {/* Appearance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'light' 
                        ? 'bg-cyan-400 text-black border-cyan-400' 
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                    } transition-all`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-cyan-400 text-black border-cyan-400' 
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                    } transition-all`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'system' 
                        ? 'bg-cyan-400 text-black border-cyan-400' 
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                    } transition-all`}
                  >
                    System
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Push Notifications</h3>
                  <p className="text-gray-400 text-sm">Receive notifications for collaboration updates</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Email Updates</h3>
                  <p className="text-gray-400 text-sm">Receive project updates via email</p>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailUpdates ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm">Managed through your Clerk account</p>
                </div>
                <a
                  href="/user-profile"
                  className="px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-500 transition-colors"
                >
                  Configure
                </a>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Password & Security</h3>
                  <p className="text-gray-400 text-sm">Update password and security settings</p>
                </div>
                <a
                  href="/user-profile"
                  className="px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-500 transition-colors"
                >
                  Manage
                </a>
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">About DevDeck</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-white font-medium mb-2">Version</h3>
                <p className="text-gray-400">1.0.0</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Last Updated</h3>
                <p className="text-gray-400">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Support</h3>
                <a href="/support" className="text-cyan-400 hover:text-cyan-300">Contact Support</a>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Documentation</h3>
                <a href="/help-and-feedback" className="text-cyan-400 hover:text-cyan-300">View Docs</a>
              </div>
            </div>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Advanced Settings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Data Management</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition-all">
                    Export Data
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                    Clear Cache
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Export your workspace data or clear local cache</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Performance</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition-all">
                    Optimize Storage
                  </button>
                  <button className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition-all">
                    Reset Preferences
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optimize local storage and reset all preferences to defaults</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 