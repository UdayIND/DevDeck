"use client"
import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  useUser,
  SignedIn,
  SignedOut 
} from "@clerk/nextjs";
import { motion } from "framer-motion";

interface NavbarComponentProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const NavbarComponent: React.FC<NavbarComponentProps> = ({
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  const menuItems = [
    { label: "Workspace", href: "/workspace" },
    { label: "DevHub", href: "/devhub" },
    { label: "Whiteboard", href: "/design-desk-jam" },
    { label: "Presentations", href: "/design-desk-slides" },
    { label: "Projects", href: "/devhub/projects" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="bg-black/80 backdrop-blur-md border-b border-gray-800"
      maxWidth="2xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-white"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-2xl"
            >
              🚀
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              DevDeck
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              href={item.href}
              className="text-white hover:text-cyan-400 transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="text-white hover:text-cyan-400"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>
        </NavbarItem>
        
        <SignedOut>
          <NavbarItem>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                className="text-white hover:text-cyan-400 border border-gray-600 hover:border-cyan-400"
              >
                Sign In
              </Button>
            </SignInButton>
          </NavbarItem>
          <NavbarItem>
            <SignUpButton mode="modal">
              <Button
                className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 text-white font-medium"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </NavbarItem>
        </SignedOut>

        <SignedIn>
          <NavbarItem className="flex items-center gap-2">
            <span className="text-sm text-gray-300 hidden sm:inline">
              Welcome, {user?.firstName || user?.username}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-gray-900 border border-gray-700",
                  userButtonPopoverActions: "bg-gray-900",
                  userButtonPopoverActionButton: "text-white hover:bg-gray-800",
                  userButtonPopoverFooter: "bg-gray-900 border-t border-gray-700",
                },
              }}
              afterSignOutUrl="/"
            />
          </NavbarItem>
        </SignedIn>
      </NavbarContent>

      <NavbarMenu className="bg-black/95 backdrop-blur-md border-r border-gray-800">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              href={item.href}
              className="w-full text-white hover:text-cyan-400 transition-colors py-2"
              size="lg"
              onPress={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        
        <div className="border-t border-gray-800 pt-4 mt-4">
          <SignedOut>
            <div className="flex flex-col gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="w-full text-white hover:text-cyan-400 border border-gray-600"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="flex items-center gap-3 p-2">
              <UserButton afterSignOutUrl="/" />
              <span className="text-white">
                {user?.firstName || user?.username}
              </span>
            </div>
          </SignedIn>
        </div>
      </NavbarMenu>
    </Navbar>
  );
};

export default NavbarComponent;
