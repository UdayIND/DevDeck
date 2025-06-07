"use client";
import Footer from "@/components/ui/footer";
import {
  Button,
  Card,
  CardFooter,
  Image,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import BackToTop from "@/components/BackToTop/BackToTop";
import Hero from "@/components/landing/Hero";
import Review from '@/components/ui/review';
import { useUser } from "@clerk/nextjs";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  const { systemTheme, theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
    setDarkMode((theme === "dark" ? systemTheme : theme) === "dark");
  }, [systemTheme, theme]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-gradient-to-r from-gray-300 via-white to-gray-200 text-black"} font-sans`}>
      <Hero />

      <div className="py-20 mx-10">
        <div className="w-auto flex justify-center font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent text-6xl m-4 pb-14">
          Real Features, Real Collaboration
        </div>
        <div className="max-w-8xl max-h-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              imgSrc: "/five.webp", 
              text: "Collaborative Whiteboard", 
              description: "Real-time design collaboration with drawing tools, shapes, and live chat",
              href: "/design-desk-jam"
            },
            { 
              imgSrc: "/four.webp", 
              text: "Interactive Presentations", 
              description: "Create and present slides with live collaboration and real-time editing",
              href: "/design-desk-slides"
            },
            { 
              imgSrc: "/two.webp", 
              text: "DevHub Projects", 
              description: "Manage development projects with real team collaboration",
              href: "/devhub"
            },
          ].map((feature, i) => (
            <Card key={i} isFooterBlurred radius="lg" className="border-none shadow-2xl rounded-lg text-center bg-none hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Image alt={feature.text} className="object-cover w-full h-full" height={370} src={feature.imgSrc} width={500} />
              <CardFooter className="absolute bottom-1 w-[93%] mb-2 right-2 py-3 shadow-small mr-2 z-10 transition-all duration-300 ease-in-out bg-white/10 rounded-xl hover:bg-black/50 text-white font-medium">
                <div className="w-full text-left">
                  <h3 className="text-lg font-bold mb-1">{feature.text}</h3>
                  <p className="text-sm opacity-90 mb-2">{feature.description}</p>
                  <Button 
                    as="a"
                    href={feature.href}
                    variant="flat" 
                    color="primary" 
                    radius="lg" 
                    size="sm" 
                    className="w-full"
                  >
                    Try Now
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Production Features Grid */}
        <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            {
              icon: "🎨",
              title: "Real-time Drawing",
              description: "Multiple users can draw and edit simultaneously with live synchronization",
              link: "/design-desk-jam"
            },
            {
              icon: "💬",
              title: "Live Team Chat",
              description: "Built-in chat system with real-time messaging across all tools",
              link: "/design-desk-jam"
            },
            {
              icon: "👥",
              title: "Live User Presence",
              description: "See team members online with live cursor tracking and presence indicators",
              link: "/workspace"
            },
            {
              icon: "📊",
              title: "Project Management",
              description: "Comprehensive project organization with real collaboration features",
              link: "/devhub"
            },
            {
              icon: "🔐",
              title: "Secure Authentication",
              description: "Enterprise-grade security with Clerk authentication platform",
              link: user ? "/dashboard" : "/"
            },
            {
              icon: "⚡",
              title: "High Performance",
              description: "Optimized for real-time collaboration with sub-second response times",
              link: "/"
            },
            {
              icon: "📱",
              title: "Responsive Design",
              description: "Full functionality across desktop, tablet, and mobile devices",
              link: "/"
            },
            {
              icon: "🚀",
              title: "Production Ready",
              description: "Deployed and ready for real-world team collaboration",
              link: user ? "/workspace" : "/"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-gray-900 border-gray-700 hover:border-cyan-400' : 'bg-white border-gray-200 hover:border-blue-400'} transition-all duration-300 hover:shadow-lg cursor-pointer`}
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.href = item.link}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={`${darkMode ? "bg-black text-white" : "bg-gradient-to-r from-gray-300 via-white to-gray-200 text-black"} py-20 px-10 my-40`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="text-cyan-400 text-9xl font-extrabold mr-6">&#8220;</div>
            <div className="text-3xl lg:text-5xl font-medium leading-snug max-w-lg">
              A complete collaboration platform for modern development teams.
            </div>
          </div>
          <div className="flex items-center mt-10 lg:mt-0">
            <div className="text-right mr-4">
              <div className="text-2xl font-semibold">DevDeck</div>
              <div className="flex items-center mt-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-8 m-3"></div>
                <div>
                  <div className="text-lg text-gray-600">Real Collaboration</div>
                  <div className="text-lg text-gray-600">Real Results</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Review />
      <BackToTop />
      <Footer />
    </div>
  );
}
