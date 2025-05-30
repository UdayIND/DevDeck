"use client";
import Footer from "@/components/ui/footer";
import { ChevronDown } from "@/components/ui/ChevronDown";
import {
  Button,
  Card,
  CardFooter,
  Image,
  Link
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ImDeviantart, ImDownload, ImHammer, ImNewspaper } from "react-icons/im";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackToTop from "../src/components/BackToTop/BackToTop";
import Preloader from "../src/components/Preloader";
import Progressbar from "../src/components/progressbar/progressbar";
import Review from '../src/components/ui/review';
import NavbarComponent from "./front-navbar";
import ThemeProvider from "./provider";
import { useUser } from "@/context/UserContext";
import Hero from "../src/components/landing/Hero";


export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
 
  const icons = {
    chevron: <ChevronDown fill="currentColor" size={16} className="some-class-name" height={undefined} width={undefined} />,
    hammer: <ImHammer />,
    dev: <ImDeviantart />,
    slide: <ImNewspaper />,
    download: <ImDownload />,
  };

  const menuItems = [
    "Profile",
    "Dashboard",
    "WorkSpace",
    "System",
    "My Settings",
    "Help & Feedback",
    "Log Out",
  ];

  const { systemTheme, theme } = useTheme();
  useEffect(() => {
    setDarkMode((theme === "dark" ? systemTheme : theme) === "dark");
  }, [systemTheme, theme]);

  return (
    <ThemeProvider>
      <Progressbar />
      <NavbarComponent isLoggedIn={isLoggedIn} setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <Preloader />

      <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-gradient-to-r from-gray-300 via-white to-gray-200 text-black"} font-sans`}>
        <Hero />
        <div className={`py-0 hidden md:block md:py-4 ${darkMode ? "bg-black" : "bg-gradient-to-r from-gray-300 via-white to-gray-200 text-black"}`}>
          <div className="flex justify-around items-center">
            {menuItems.map((item, index) => (
              <Link key={index} className="text-lg" href={`/${item.toLowerCase().replace(" ", "-")}`}>
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="py-20 mx-10">
          <div className="w-auto flex justify-center font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent text-6xl m-4 pb-14">Features</div>
          <div className="max-w-8xl max-h-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { imgSrc: "five.webp", text: "Live Collaboration", onClick: () => toast("Live Collaboration notify me") },
              { imgSrc: "four.webp", text: "Real-Time Updates", onClick: () => toast("Real-Time updates notify me") },
              { imgSrc: "two.webp", text: "Text Addition", onClick: () => toast("Text addition notify me") },
            ].map((feature, i) => (
              <Card key={i} isFooterBlurred radius="lg" className="border-none shadow-2xl rounded-lg text-center bg-none">
                <Image alt={feature.text} className="object-cover w-full h-full" height={370} src={feature.imgSrc} width={500} />
                <CardFooter className="absolute bottom-1 w-[93%] mb-2 right-2 py-1 shadow-small mr-2 z-10 transition-all duration-300 ease-in-out bg-white/10 rounded-xl hover:bg-black/50 hover:scale-105 text-white font-medium">
                  <p>{feature.text}</p>
                  <Button onClick={feature.onClick} variant="flat" color="default" radius="lg" size="sm">Notify Me</Button>
                </CardFooter>
                <ToastContainer />
              </Card>
            ))}
          </div>
        </div>

        <div className={`${darkMode ? "bg-black text-white" : "bg-gradient-to-r from-gray-300 via-white to-gray-200 text-black"} py-20 px-10 my-40`}>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="text-yellow-700 text-9xl font-extrabold mr-6">&#8220;</div>
              <div className="text-3xl lg:text-5xl font-medium leading-snug max-w-lg">
                Nearly everything that designers and developers need is available in DesignDesk.
              </div>
            </div>
            <div className="flex items-center mt-10 lg:mt-0">
              <div className="text-right mr-4">
                <div className="text-2xl font-semibold">GitHub</div>
                <div className="flex items-center mt-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 p-8 m-3"></div>
                  <div>
                    <div className="text-lg text-gray-600">Diana Mounter</div>
                    <div className="text-lg text-gray-600">Head of Design</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-auto flex justify-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-6xl m-4 pb-8">Testimonials</div>
        <Review/>
        <Footer />
      </div>
      <BackToTop />
    </ThemeProvider>
  );
}
