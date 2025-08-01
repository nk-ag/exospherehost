# Workflow Orchestrator Dashboard

A futuristic dashboard for workflow orchestration and monitoring, built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Real-time metrics and performance monitoring
- **Workflows**: Workflow management and configuration
- **Workflow Builder**: Visual workflow editor with drag-and-drop functionality
- **Futuristic UI**: Modern, glass-morphism design with animated elements
- **Responsive**: Fully responsive design that works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **UI Components**: Custom shadcn/ui inspired components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workflow-orchestrator-dashboard
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

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── ui/                # UI components
│   ├── DashboardPage.tsx  # Dashboard component
│   ├── WorkflowsPage.tsx  # Workflows component
│   └── ...                # Other components
├── styles/                # Additional styles
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Design System

The application uses a custom design system with:

- **Color Palette**: Dark theme with cyan/blue accents
- **Typography**: Inter font family
- **Components**: Glass-morphism cards with subtle glows
- **Animations**: Smooth transitions and hover effects

## Conversion Notes

This project was converted from a React application to Next.js 14 with the following changes:

1. **App Router**: Migrated to Next.js 14 App Router
2. **File Structure**: Reorganized for Next.js conventions
3. **Client Components**: Added 'use client' directives where needed
4. **Styling**: Updated CSS imports for Next.js
5. **Configuration**: Added Next.js specific config files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 