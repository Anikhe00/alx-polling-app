# Polling App

A modern polling application built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

- **User Authentication**: Login and registration system
- **Poll Management**: Create, view, and manage polls
- **Voting System**: Vote on polls with immediate results (real-time via WebSockets planned)
- **User Profiles**: Manage user information and preferences
- **Dashboard**: Overview of polls and statistics
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
polling-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── layout.tsx           # Auth layout
│   │   ├── login/page.tsx       # Login page
│   │   └── register/page.tsx    # Registration page
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── dashboard/page.tsx   # Main dashboard
│   ├── polls/                   # Polls routes
│   │   ├── page.tsx             # Polls listing
│   │   ├── create/page.tsx      # Create poll
│   │   └── [id]/page.tsx        # Individual poll view
│   ├── profile/page.tsx         # User profile
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to dashboard)
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── auth/                    # Authentication components
│   ├── polls/                   # Poll-related components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── auth/                    # Authentication utilities
│   ├── db/                      # Database utilities
│   ├── types/                   # TypeScript type definitions
│   └── utils.ts                 # General utilities
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   └── use-polls.ts            # Polls data management hook
└── public/                      # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd polling-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React hooks
- **Authentication**: Custom auth system (mock/stub for demonstration; ready for real integration)

## Key Features Implemented

### Authentication System
> Note: Current authentication flows are a mock/stub for demonstration and are ready to be replaced with a real provider (e.g., NextAuth.js, Auth0) during integration.

- Login and registration pages with form validation (UI only)
- Mock session management via placeholder utilities
- Protected routes wired to mock auth state
- User profile management (reads from mock data)

### Poll Management
- Create new polls with multiple options
- View poll listings with search and filtering
- Individual poll pages with voting functionality
- Results update immediately after voting (live updates via WebSockets planned)
- Poll settings (anonymous voting, multiple votes, etc.)

### Dashboard
- Overview statistics
- Recent polls
- Quick actions
- User activity summary

### User Profile
- Personal information management
- Poll history
- Voting history
- Account settings
- Notification preferences

## Next Steps

The application is scaffolded with placeholder data and mock functions. To make it production-ready, you'll need to:

1. **Database Integration**: Replace mock functions with actual database queries
2. **Authentication**: Implement real authentication (NextAuth.js, Auth0, etc.)
3. **Planned Real-time Features**: Add WebSocket support for live poll updates
4. **File Upload**: Add image upload for user avatars and poll images
5. **Email Notifications**: Implement email notifications for poll updates
6. **Analytics**: Add poll analytics and insights
7. **Social Features**: Add sharing, following, and commenting
8. **Mobile App**: Consider building a mobile app with React Native

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
