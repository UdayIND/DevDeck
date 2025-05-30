"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
// import MoonIcon from "public/assets/lineicons/regular-free-icon-svgs/moon.svg";
const MoonIcon = () => <img src="/assets/lineicons/regular-free-icon-svgs/star-fat.svg" alt="Moon" className="inline w-5 h-5" />;
import SunIcon from "public/assets/lineicons/regular-free-icon-svgs/bolt-2.svg";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const [darkMode, setDarkMode] = useState(currentTheme === "dark");

  useEffect(() => {
    setMounted(true);
    setDarkMode(currentTheme === "dark");
  }, [currentTheme]);

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setTheme(newTheme);
    setDarkMode(!darkMode);
  };

  if (!mounted) return null;

  return (
      <div
        className={`relative w-16 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
          darkMode ? "bg-gray-500" : "bg-yellow-400"
        }`}
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        <div
          className={`absolute top-0.5 left-0.5 w-7 h-7 rounded-full transition-all duration-300 flex items-center justify-center ${
            darkMode ? "translate-x-8 bg-gray-100" : "translate-x-0 bg-white"
          }`}
        >
          {darkMode ? (
            <MoonIcon />
          ) : (
            <Image src={SunIcon} alt="Sun" width={20} height={20} />
          )}
        </div>
      </div>
  );
};

export default ThemeSwitcher;
