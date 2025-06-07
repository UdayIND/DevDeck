"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [workspaceStats, setWorkspaceStats] = useState({
    totalProjects: 0,
    activeCollaborations: 0,
    recentBoards: 0,
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) redirect("/");
    
    // Fetch user's actual activity and stats
    fetchUserActivity();
    fetchWorkspaceStats();
  }, [user, isLoaded]);

  const fetchUserActivity = async () => {
    // In a real app, this would fetch from your API
    // For now, we'll keep it empty until real data is available
    setRecentActivity([]);
  };

  const fetchWorkspaceStats = async () => {
    // In a real app, this would fetch from your API
    // For now, we'll keep it at 0 until real data is available
    setWorkspaceStats({
      totalProjects: 0,
      activeCollaborations: 0,
      recentBoards: 0,
    });
  };

  const quickActions = [
    {
      label: "New Whiteboard",
      href: "/design-desk-jam",
      icon: "🎨",
      description: "Start collaborative whiteboarding",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "New Presentation",
      href: "/design-desk-slides",
      icon: "📊",
      description: "Create presentation slides",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Workspace",
      href: "/workspace",
      icon: "🏢",
      description: "Manage your workspace",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "DevHub",
      href: "/devhub",
      icon: "⚡",
      description: "Development tools",
      color: "from-orange-500 to-red-500",
    },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Welcome back, {user.firstName || user.username}!
          </h1>
          <p className="text-gray-400 mt-2">
            Ready to create something amazing today?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📁 Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">
                {workspaceStats.totalProjects}
              </div>
              <p className="text-gray-400 text-sm">Total projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                👥 Collaborations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {workspaceStats.activeCollaborations}
              </div>
              <p className="text-gray-400 text-sm">Active collaborations</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🎨 Boards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {workspaceStats.recentBoards}
              </div>
              <p className="text-gray-400 text-sm">Recent boards</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                        {action.label}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest actions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm">{activity.text}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-gray-400">No recent activity yet</p>
                  <p className="text-gray-500 text-sm">
                    Start creating to see your activity here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Getting Started</CardTitle>
              <CardDescription className="text-gray-400">
                Tips to make the most of DevDeck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-cyan-400 font-medium">🎨 Create Your First Board</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Start with a whiteboard to brainstorm ideas with your team
                  </p>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="text-purple-400 font-medium">📊 Build Presentations</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Create stunning presentations with our collaborative editor
                  </p>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-400 font-medium">👥 Invite Team Members</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Collaborate in real-time with your team members
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 