"use client";
import Link from "next/link";

const mockUser = {
  name: "Jane Doe",
  avatar: "/assets/lineicons/regular-free-icon-svgs/user.svg",
  role: "Designer",
  email: "jane@designdeck.com",
};
const mockActivity = [
  { type: "edit", text: "Edited Slide 2 in Project X", time: "2m ago" },
  { type: "comment", text: "Commented on Jam Board", time: "10m ago" },
  { type: "create", text: "Created new Jam Board", time: "1h ago" },
];
const mockNotifications = [
  { type: "mention", text: "@you in Slides: 'Check this out!'", time: "5m ago", unread: true },
  { type: "invite", text: "Invited to Project Y", time: "30m ago", unread: false },
];
const mockLinks = [
  { label: "New Jam", href: "/design-desk-jam" },
  { label: "New Slides", href: "/design-desk-slides" },
  { label: "Workspace", href: "/workspace" },
  { label: "Settings", href: "/system" },
];
const mockAnnouncements = [
  { title: "🎉 New Feature: Presenter Mode!", desc: "Try collaborative presenting in Slides." },
  { title: "Tip: Use Cmd+E to export any board!", desc: "Quickly export your work as PNG or PDF." },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-8 text-neon">Dashboard</h1>
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left: User Overview & Quick Links */}
        <aside className="md:col-span-1 flex flex-col gap-8">
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center">
            <img src={mockUser.avatar} alt="avatar" className="w-20 h-20 rounded-full mb-4 bg-gray-800" />
            <div className="text-xl font-bold mb-1">{mockUser.name}</div>
            <div className="text-accent-cyan font-semibold mb-1">{mockUser.role}</div>
            <div className="text-gray-400 text-sm mb-2">{mockUser.email}</div>
            <Link href="/system" className="btn-neon px-4 py-1 rounded text-sm mt-2">Profile & Settings</Link>
          </div>
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="font-semibold text-accent-purple mb-2">Quick Links</div>
            <ul className="flex flex-col gap-2">
              {mockLinks.map(link => (
                <li key={link.href}><Link href={link.href} className="btn-neon w-full block text-center">{link.label}</Link></li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Center: Activity Feed */}
        <main className="md:col-span-2 flex flex-col gap-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="font-semibold text-accent-cyan mb-2 text-2xl">Activity Feed</div>
            <ul className="space-y-4">
              {mockActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full bg-accent-cyan inline-block"></span>
                  <span className="flex-1">{item.text}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
        {/* Right: Notifications & Announcements */}
        <aside className="md:col-span-1 flex flex-col gap-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="font-semibold text-accent-purple mb-2 text-2xl">Notifications</div>
            <ul className="space-y-4">
              {mockNotifications.map((n, i) => (
                <li key={i} className={`flex items-center gap-2 ${n.unread ? "font-bold text-accent-cyan" : "text-gray-300"}`}>
                  <span className="flex-1">{n.text}</span>
                  <span className="text-xs text-gray-400">{n.time}</span>
                  {n.unread && <span className="ml-2 w-2 h-2 rounded-full bg-accent-cyan inline-block"></span>}
                </li>
              ))}
            </ul>
            <button className="btn-neon mt-4 w-full">Clear All</button>
          </div>
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="font-semibold text-accent-cyan mb-2 text-2xl">Announcements</div>
            <ul className="space-y-2">
              {mockAnnouncements.map((a, i) => (
                <li key={i}>
                  <div className="font-bold text-accent-purple">{a.title}</div>
                  <div className="text-gray-300 text-sm">{a.desc}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
} 