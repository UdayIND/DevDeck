# DevDeck - Collaborative Developer Platform

DevDeck is a comprehensive collaborative platform for developers featuring real-time whiteboard collaboration, presentation tools, project management, and more.

## 🚀 Features

### Core Tools
- **Design-Desk-Jam**: Real-time collaborative whiteboard with drawing tools, shapes, text, and live cursors
- **Design-Desk-Slides**: Collaborative presentation editor with slide management and real-time editing
- **DevHub**: Project management with file editing, issue tracking, and team collaboration
- **Workspace**: Advanced canvas workspace with comprehensive design tools

### Platform Features
- **Real-time Collaboration**: Powered by Liveblocks for seamless team collaboration
- **Authentication**: Secure user management with Clerk
- **Responsive Design**: Modern UI with dark theme and space aesthetics
- **Export Functionality**: Export whiteboards and presentations
- **Live Chat**: Team communication within collaborative tools

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Real-time**: Liveblocks
- **Authentication**: Clerk
- **Canvas**: Fabric.js
- **Code Editor**: Monaco Editor
- **Database**: Prisma (configured)

## 📁 Project Structure

```
DevDeck/
├── app/                          # Next.js 14 App Router
│   ├── (dashboard)/             # Dashboard routes (protected)
│   │   ├── dashboard/           # Main dashboard
│   │   ├── devhub/             # Project management
│   │   ├── system/             # System settings
│   │   └── workspace/          # Advanced workspace
│   ├── (tools)/                # Collaborative tools
│   │   ├── design-desk-jam/    # Whiteboard tool
│   │   ├── design-desk-slides/ # Presentation tool
│   │   └── dev-mode/           # Development mode
│   ├── (marketing)/            # Marketing pages
│   │   ├── blogs/              # Blog pages
│   │   ├── contact/            # Contact page
│   │   ├── contributors/       # Contributors page
│   │   ├── faq/               # FAQ page
│   │   └── pricing/           # Pricing page
│   ├── (legal)/               # Legal pages
│   │   ├── privacy_policy/    # Privacy policy
│   │   └── terms_of_use/      # Terms of use
│   ├── api/                   # API routes
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   └── support/               # Support page
├── components/                # Reusable components
│   ├── ui/                   # UI components
│   ├── landing/              # Landing page components
│   ├── comments/             # Comment system
│   └── ...                   # Other components
├── lib/                      # Utilities and configurations
│   ├── liveblocks.config.ts  # Liveblocks configuration
│   ├── canvas.ts             # Canvas utilities
│   └── ...                   # Other utilities
├── types/                    # TypeScript type definitions
├── prisma/                   # Database schema and migrations
└── public/                   # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Liveblocks account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevDeck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Liveblocks (Required for real-time collaboration)
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_key_here
   
   # Clerk Authentication (Required for user management)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting API Keys

#### Liveblocks Setup
1. Go to [Liveblocks Dashboard](https://liveblocks.io/dashboard)
2. Create a new project
3. Copy your public key to `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`

#### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy your secret key to `CLERK_SECRET_KEY`

## 🎯 Usage

### Design-Desk-Jam (Whiteboard)
- Access via `/design-desk-jam`
- Real-time collaborative drawing
- Multiple tools: pen, shapes, text, arrows
- Live cursors and user presence
- Export functionality

### Design-Desk-Slides (Presentations)
- Access via `/design-desk-slides`
- Create and manage slides
- Real-time collaborative editing
- Presentation mode
- Export presentations

### DevHub (Project Management)
- Access via `/devhub`
- Create and manage projects
- File editing with Monaco Editor
- Issue tracking
- Team collaboration

### Workspace (Advanced Canvas)
- Access via `/workspace`
- Advanced design tools
- Real-time collaboration
- Comprehensive canvas operations

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

### Linting
```bash
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Configure build command as `npm run build`
- **Railway**: Add environment variables and deploy
- **Docker**: Use the included Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/help-and-feedback` page
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord community

## 🌟 Features in Development

- [ ] Advanced project templates
- [ ] Enhanced export options
- [ ] Mobile app support
- [ ] Advanced analytics
- [ ] Plugin system

---

Built with ❤️ by the DevDeck team
