import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center px-4" style={{
      background: 'radial-gradient(ellipse at center, #1a1446 0%, #0a0a23 100%)',
      backgroundImage: 'url(/assets/starfield-bg.jpg), radial-gradient(ellipse at center, #1a1446 0%, #0a0a23 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Logo Image */}
      <div className="z-10 animate-float mt-24 md:mt-32">
        <img
          src="/assets/dev-deck-space-logo.png"
          alt="Dev Deck Space Logo"
          className="w-[80vw] max-w-4xl h-auto mx-auto drop-shadow-neon"
        />
      </div>
      {/* Headline (hidden, since logo is text) */}
      {/* <h1 className="mt-48 md:mt-56 text-4xl md:text-6xl font-extrabold text-neon drop-shadow-lg">
        Dev Deck Space
      </h1> */}
      {/* Subheading */}
      <p className="mt-10 text-lg md:text-2xl text-cyan-200 max-w-2xl mx-auto animate-fadeIn font-mono drop-shadow-lg">
        The next-gen collaborative design platform. Real-time, space-inspired, and powered by creativity.
      </p>
      {/* Call to Action */}
      <a
        href="/signup"
        className="mt-10 inline-block px-8 py-4 rounded-full btn-neon text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-neon animate-glow"
      >
        Get Started
      </a>
      {/* Decorative Stars (CSS or SVG) */}
      <div className="absolute inset-0 pointer-events-none z-0" />
    </section>
  );
}

// Tailwind animation utilities (add to global CSS or tailwind.config if not present):
// .animate-float { animation: float 4s ease-in-out infinite; }
// @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
// .animate-fadeIn { animation: fadeIn 1.5s ease 0.5s both; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// .animate-glow { animation: glow 2s infinite alternate; }
// @keyframes glow { from { box-shadow: 0 0 16px var(--accent-neon); } to { box-shadow: 0 0 32px var(--accent-cyan); } }
// .drop-shadow-neon { filter: drop-shadow(0 0 16px var(--accent-neon)); } 