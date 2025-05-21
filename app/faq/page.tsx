'use client'
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { FiChevronDown, FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi';
import NavbarComponent from '../front-navbar';
import Footer from '@/components/ui/footer';
import Image from 'next/image';
import PaintIcon from "../../public/assets/lineicons/regular-free-icon-svgs/paint-bucket.svg";
import RocketIcon from "../../public/assets/lineicons/regular-free-icon-svgs/star-fat.svg";
import BoltIcon from "../../public/assets/lineicons/regular-free-icon-svgs/bolt-2.svg";
import HandshakeIcon from "../../public/assets/lineicons/regular-free-icon-svgs/hand-taking-user.svg";
import BookIcon from "../../public/assets/lineicons/regular-free-icon-svgs/comment-1.svg";
import UsersIcon from "../../public/assets/lineicons/regular-free-icon-svgs/comment-1.svg";
import GearIcon from "../../public/assets/lineicons/regular-free-icon-svgs/gears-3.svg";
import UploadIcon from "../../public/assets/lineicons/regular-free-icon-svgs/cloud-upload.svg";
import KeyboardIcon from "../../public/assets/lineicons/regular-free-icon-svgs/menu-hamburger-1.svg";
import MailIcon from "../../public/assets/lineicons/regular-free-icon-svgs/message-2-question.svg";
import PhoneIcon from "../../public/assets/lineicons/regular-free-icon-svgs/phone.svg";
import LayersIcon from "../../public/assets/lineicons/regular-free-icon-svgs/layers-1.svg";
import TextIcon from "../../public/assets/lineicons/regular-free-icon-svgs/align-text-left.svg";
import MonitorIcon from "../../public/assets/lineicons/regular-free-icon-svgs/monitor.svg";

interface Faq {
  question: string;
  answer: string;
  icon: JSX.Element;
  category: string;
}

interface ContactMethod {
  icon: JSX.Element;
  title: string;
  description: string;
  contact: string;
  action: string;
}

// Categorized FAQs with appropriate icons
const faqs: Faq[] = [
  {
    category: "About the App",
    question: "What is Dev Deck Space?",
    answer: "Dev Deck Space is a next-generation collaborative design platform inspired by space and neon themes. It enables real-time teamwork, creative design, and seamless sharing, all in your browser.",
    icon: <Image src={PaintIcon} width={24} height={24} alt="About" />
  },
  {
    category: "About the App",
    question: "What are the main features of Dev Deck Space?",
    answer: "Key features include real-time collaboration, multi-platform support, advanced canvas tools, shape and layer management, export/share options, and a beautiful, interactive UI.",
    icon: <Image src={BoltIcon} width={24} height={24} alt="Features" />
  },
  {
    category: "About the App",
    question: "Which platforms are supported?",
    answer: "Dev Deck Space works on all modern browsers on Windows, macOS, and Linux. No installation required—just open your browser and start designing!",
    icon: <Image src={MonitorIcon} width={24} height={24} alt="Platforms" />
  },
  {
    category: "About the App",
    question: "How does real-time collaboration work?",
    answer: "Multiple users can join the same workspace, see each other's changes live, and communicate through built-in tools. All updates are synced instantly.",
    icon: <Image src={UsersIcon} width={24} height={24} alt="Collaboration" />
  },
  {
    category: "About the App",
    question: "How do I get started?",
    answer: "Simply sign up, create a new workspace, and invite your team. You can start designing right away with our intuitive tools and templates.",
    icon: <Image src={RocketIcon} width={24} height={24} alt="Get Started" />
  },
  {
    category: "General Shortcuts",
    question: "What are the most important keyboard shortcuts for Dev Deck Space?",
    answer: `Common shortcuts include:\n- Undo: Cmd+Z (Mac), Ctrl+Z (Windows)\n- Redo: Cmd+Shift+Z (Mac), Ctrl+Y (Windows)\n- Copy: Cmd+C (Mac), Ctrl+C (Windows)\n- Paste: Cmd+V (Mac), Ctrl+V (Windows)\n- Save: Cmd+S (Mac), Ctrl+S (Windows)`,
    icon: <Image src={BoltIcon} width={24} height={24} alt="Shortcuts" />
  },
  {
    category: "Navigation",
    question: "How do I quickly navigate between tools and panels?",
    answer: `- Switch Tool: Tab (both)\n- Move between panels: Cmd+1/2/3 (Mac), Ctrl+1/2/3 (Windows)\n- Open Command Palette: Cmd+K (Mac), Ctrl+K (Windows)`,
    icon: <Image src={KeyboardIcon} width={24} height={24} alt="Keyboard" />
  },
  {
    category: "Canvas Actions",
    question: "What are the canvas manipulation shortcuts?",
    answer: `- Zoom In/Out: Cmd+Plus/Minus (Mac), Ctrl+Plus/Minus (Windows)\n- Fit to Screen: Cmd+0 (Mac), Ctrl+0 (Windows)\n- Pan: Spacebar + Drag (both)`,
    icon: <Image src={PaintIcon} width={24} height={24} alt="Canvas" />
  },
  {
    category: "Shapes & Layers",
    question: "How do I work with shapes and layers?",
    answer: `- Duplicate: Option+Drag (Mac), Alt+Drag (Windows)\n- Bring Forward: Cmd+] (Mac), Ctrl+] (Windows)\n- Send Backward: Cmd+[ (Mac), Ctrl+[ (Windows)\n- Group: Cmd+G (Mac), Ctrl+G (Windows)\n- Ungroup: Cmd+Shift+G (Mac), Ctrl+Shift+G (Windows)`,
    icon: <Image src={LayersIcon} width={24} height={24} alt="Layers" />
  },
  {
    category: "Text Editing",
    question: "What are the text editing shortcuts?",
    answer: `- Bold: Cmd+B (Mac), Ctrl+B (Windows)\n- Italic: Cmd+I (Mac), Ctrl+I (Windows)\n- Underline: Cmd+U (Mac), Ctrl+U (Windows)`,
    icon: <Image src={TextIcon} width={24} height={24} alt="Text" />
  },
  {
    category: "Export & Share",
    question: "How do I export or share my work?",
    answer: `- Export: Cmd+E (Mac), Ctrl+E (Windows)\n- Share: Cmd+Shift+S (Mac), Ctrl+Shift+S (Windows)`,
    icon: <Image src={UploadIcon} width={24} height={24} alt="Export" />
  },
  {
    category: "Help",
    question: "Where can I find a full list of shortcuts?",
    answer: `You can access the full shortcut list anytime by pressing Cmd+/ (Mac) or Ctrl+/ (Windows) in the app, or by visiting the Help section in the sidebar menu.`,
    icon: <Image src={MailIcon} width={24} height={24} alt="Help" />
  },
];

const contactMethods: ContactMethod[] = [
  {
    icon: <Image src={MailIcon} width={24} height={24} alt="Mail" />,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@devdeck.com",
    action: "mailto:support@devdeck.com"
  },
  {
    icon: <Image src={PhoneIcon} width={24} height={24} alt="Phone" />,
    title: "Phone Support",
    description: "Call us directly",
    contact: "+1 (555) 123-4567",
    action: "tel:+15551234567"
  }
];

interface FaqItemProps {
  faq: Faq;
  isOpen: boolean;
  onToggle: () => void;
  theme: string | undefined;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, isOpen, onToggle, theme }) => (
  <div
    className={`rounded-xl overflow-hidden transition-all duration-300 ${
      theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-md'
    }`}
  >
    <button onClick={onToggle} className="w-full flex items-center justify-between p-6 text-left font-medium">
      <span className="flex items-center gap-3">
        <span className="text-2xl">{faq.icon}</span>
        <span className="text-lg">{faq.question}</span>
      </span>
      <FiChevronDown
        className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
      />
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
      <div className={`p-6 pt-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {faq.answer}
      </div>
    </div>
  </div>
);

interface ContactSupportProps {
  methods: ContactMethod[];
  theme: string | undefined;
}

const ContactSupport: React.FC<ContactSupportProps> = ({ methods, theme }) => {
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);

  return (
    <div
      className={`p-6 rounded-xl transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-md'
      }`}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {methods.map((method, index) => (
          <button
            key={index}
            className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
              selectedMethodIndex === index
                ? theme === 'dark' ? 'bg-purple-400 text-white' : 'bg-purple-600 text-white'
                : theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMethodIndex(index)}
          >
            {method.title}
          </button>
        ))}
      </div>
      <div className="flex items-start space-x-4">
        <div className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
          {methods[selectedMethodIndex].icon}
        </div>
        <div>
          <h3 className="font-semibold mb-1">{methods[selectedMethodIndex].title}</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {methods[selectedMethodIndex].description}
          </p>
          <a
            href={methods[selectedMethodIndex].action}
            className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} font-medium hover:underline`}
          >
            {methods[selectedMethodIndex].contact}
          </a>
        </div>
      </div>
    </div>
  );
};

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { theme } = useTheme();

  const categories = ["all", ...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <header className="w-full">
      <NavbarComponent isLoggedIn={isLoggedIn} setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      </header>

      <section className="w-full py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}
          >
            Frequently Asked Questions
          </h1>
          <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything you need to know about Dev Deck's collaborative developer platform
          </p>
          
          

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? theme === 'dark' ? 'bg-purple-400 text-white' : 'bg-purple-600 text-white'
                    : theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <aside className="flex flex-col space-y-4">
            <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Need More Help?
            </h2>
            <ContactSupport methods={contactMethods} theme={theme} />
          </aside>

          <section className="lg:col-span-2 space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No FAQs found matching your search criteria.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <FaqItem
                  key={index}
                  faq={faq}
                  isOpen={openIndex === index}
                  onToggle={() => toggleFaq(index)}
                  theme={theme}
                />
              ))
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;