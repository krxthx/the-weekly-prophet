# The Weekly Prophet 📰

> A private, lightweight web app for logging weekly updates including daily office status tracking, TODO management, and quick notes.

<br>

## ✨ Features

**Core Functionality**
- **Daily Status Tracking** — Log whether you're in office, WFH, or on leave
- **Weekly TODOs** — Add, update, and mark tasks as complete  
- **Quick Notes** — One-liner notes for each day
- **Weekly Navigation** — Browse past and future weeks

**Smart Features**
- **Basic Statistics** — Days in office this week, tasks completed
- **Multi-user Support** — Each user keeps their own private log
- **Google SSO** — Simple and secure authentication

<br>

## 🛠️ Tech Stack

**Frontend**
- Next.js 15 with App Router & TypeScript
- Tailwind CSS v4 + shadcn/ui components  
- TanStack React Query for data fetching
- lucide-react icons

**Backend**
- Firebase Authentication (Google SSO only)
- Firestore (per-user collections)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd theweeklyprophet
   npm install
   ```

2. **Configure Firebase**:
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication with Google provider
   - Enable Firestore database
   - Copy your Firebase config

3. **Environment setup**:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

1. **Sign in** with your Google account
2. **Log daily status** - Office, WFH, or Leave
3. **Add notes** for each day (optional)
4. **Manage TODOs** for the current week
5. **Navigate weeks** using the week picker
6. **View statistics** for each week

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions and Firebase config
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## 🔒 Data Structure

Firestore collections are organized per-user:

```
users/{userId}/
├── days/                  # Daily entries
└── todos/                 # Weekly todos
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design Philosophy

The Weekly Prophet embraces minimalism with a "magical" feel:
- Clean, gradient-based UI with soft shadows
- Intuitive navigation and interactions
- Focus on essential features only
- Beautiful typography and spacing

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use this for your own weekly logging needs.
