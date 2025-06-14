"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@nextui-org/react";
import Footer from "@/components/ui/footer";
import NavbarComponent from "@/components/front-navbar";
import { useTheme } from "next-themes";
import Image from "next/image";
import { FaUser, FaEnvelope } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [buttonText, setButtonText] = useState("Send Message");
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? "dark" : theme;
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(currentTheme === "dark");
  }, [currentTheme]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setButtonText("Sending...");

    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSuccess(true);
    setButtonText("Message Sent!");
    setName("");
    setEmail("");
    setMessage("");

    setTimeout(() => {
      setButtonText("Send Message");
      setSuccess(false);
    }, 3000);
  };

  return (
    <>
              <NavbarComponent
          setIsMenuOpen={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
        />
      <div
        className={`${
          darkMode ? "bg-black text-white" : "bg-gray-50 text-gray-800"
        } min-h-screen flex flex-col items-center justify-center px-8 py-20`}
      >
        <h1 className="text-5xl font-semibold mb-6 text-center tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg mb-10 max-w-2xl text-center font-light leading-relaxed">
          We'd love to hear from you! Fill out the form below, and we'll get
          back to you shortly.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-6xl">
          {/* Illustration */}
          <div
            className="w-full md:w-1/2 flex justify-center"
            style={{ marginTop: "-20px" }}
          >
            <Image
              src="/assets/lineicons/regular-free-icon-svgs/nasa.svg"
              alt="Contact Us Illustration"
              width={400}
              height={400}
            />
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className={`${
              darkMode ? "bg-neutral-900 text-white" : "bg-white text-gray-800"
            } flex flex-col w-full md:w-1/2 gap-5 p-8 shadow-xl rounded-xl`}
            style={{
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Input
              isClearable
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <Input
              isClearable
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <Textarea
              label="Message"
              placeholder="Write your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              rows={4}
            />
            {error && <p className="text-red-500">{error}</p>}
            <Button
              type="submit"
              className="bg-[#b089ee] hover:bg-indigo-700 text-white rounded-lg py-3 px-6 transition-transform transform hover:scale-105"
            >
              {buttonText}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;
