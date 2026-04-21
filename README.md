# SocialV - Gamer Social Network

SocialV is a modern, high-performance social networking platform tailored for gamers. It features a sleek "dark mode" aesthetic, real-time interactions, and AI-driven enhancements.

## 🚀 Features

- **Gamer-Centric UI**: A premium dark-themed interface with dynamic backgrounds (Hexagon and Starsfalls).
- **Real-time Feed**: Instant updates for posts and interactions using WebSockets.
- **AI Integration**: Powered by Google Generative AI for enhanced content experiences.
- **Authentication**: Secure JWT-based authentication with Passport and Argon2.
- **Responsive Design**: Fully optimized for various screen sizes using Next.js and Tailwind CSS.
- **Dynamic Animations**: Smooth transitions and effects powered by Framer Motion and AOS.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [AOS](https://michalsnik.github.io/aos/)
- **Real-time**: [Socket.io-client](https://socket.io/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Security**: [Passport.js](https://www.passportjs.org/), JWT, Argon2
- **Real-time**: [Socket.io](https://socket.io/)
- **AI**: [@google/generative-ai](https://ai.google.dev/)
- **Mailing**: [Nodemailer](https://nodemailer.com/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)

## 📂 Project Structure

```text
social-v/
├── frontend/    # Next.js frontend application
└── backend/     # NestJS backend API
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL (for Prisma)
- API Keys (Google AI, etc.)

### Setup Backend
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Configure `.env` file with database and AI secrets.
4. Run migrations: `npx prisma migrate dev`
5. Start server: `npm run start:dev`

### Setup Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## 📄 License
This project is UNLICENSED.
