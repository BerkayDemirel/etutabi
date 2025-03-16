# EtutAI by HercAI

An interactive AI-powered educational application designed to help students prepare for tests through adaptive learning experiences. The application offers three main modes:

1. **Preparation Mode**: Step-by-step guidance with hints and explanations
2. **Topic Mode**: PDF-based learning with interactive Q&A
3. **Testing Mode**: Timed tests with performance analysis

## Features

- Interactive question-answering with step-by-step hints
- PDF document viewer with topic-specific explanations
- LaTeX support for mathematical expressions
- Responsive design for all device sizes
- OpenAI integration for intelligent tutoring

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- OpenAI API key

## Installation

### Option 1: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/etutai-by-hercai.git
   cd etutai-by-hercai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Docker Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/etutai-by-hercai.git
   cd etutai-by-hercai
   ```

2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Build and start the Docker container:
   ```bash
   docker-compose up -d
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
etutai-by-hercai/
├── public/            # Static assets
│   └── app/           # Next.js app router pages
├── src/
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utility functions and helpers
│   ├── data/          # Data models and schemas
│   ├── scripts/       # Build and setup scripts
│   └── services/      # External service integrations
├── question_bank/     # Question data files
├── .env.example       # Example environment variables
├── .gitignore         # Git ignore file
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Docker configuration
├── next.config.js     # Next.js configuration
└── package.json       # Project dependencies
```

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| OPENAI_API_KEY | Your OpenAI API key | Yes |
| OPENAI_MODEL | OpenAI model to use (defaults to gpt-4-turbo) | No |
| PORT | Port to run the application (defaults to 3000) | No |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This software is proprietary and confidential. All rights reserved.

Copyright (c) 2024 EtutAI by HercAI. Unauthorized use, reproduction, or distribution of this software or any portion of it is strictly prohibited.

See the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Shadcn UI for the beautiful components
- OpenAI for the powerful AI capabilities
