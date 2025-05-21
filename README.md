# Karzo Agent - AI-Powered Candidate Pre-screening Platform

Karzo Agent is a modern web application that uses conversational AI to conduct automated video interviews with candidates, saving time and improving the hiring process.

## Features

- **AI-Powered Interviews**: Automated video interviews with conversational AI
- **Candidate Dashboard**: Schedule and manage interviews
- **Admin Dashboard**: Review candidate performance and make hiring decisions
- **Detailed Analytics**: Get insights into candidate performance
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Custom auth system (can be replaced with NextAuth.js)
- **Styling**: Tailwind CSS with custom theming
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/karzo-agent.git
   cd karzo-agent
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Docker

1. Build and run the Docker container:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
karzo-agent/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin dashboard pages
│   ├── dashboard/        # Candidate dashboard pages
│   ├── interview/        # Interview-related pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # UI components from shadcn/ui
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared code
├── public/               # Static assets
├── styles/               # Global styles
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation
\`\`\`

## Authentication

The application uses a custom authentication system with mock users for demonstration purposes. In a production environment, you should replace this with a proper authentication system like NextAuth.js or a custom solution with a secure backend.

### Mock Users

- **Candidate**: Email: `candidate@example.com`, Password: any
- **Admin**: Email: `admin@example.com`, Password: any

## Deployment

### Vercel

The easiest way to deploy the application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Deploy

### Docker

You can also deploy using Docker:

1. Build the Docker image:
   \`\`\`bash
   docker build -t karzo-agent .
   \`\`\`

2. Run the container:
   \`\`\`bash
   docker run -p 3000:3000 karzo-agent
   \`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
