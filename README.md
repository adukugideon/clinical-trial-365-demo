# Clinical Trial Review Add-in for Microsoft Word

## Overview
AI-powered Word add-in for generating clinical trial reviews directly within Microsoft Word using DeepSeek.

## Features
- AI-generated clinical trial reviews
- Multiple output formats (comprehensive, methods-focused, statistical)
- Secure document processing
- Word document integration

## Prerequisites
- Node.js v18+
- npm v9+
- Microsoft Word 2016+
- Office 365 subscription recommended

## Installation
```bash
git clone https://github.com/your-repo/clinical-trial-review-addin.git
cd clinical-trial-review-addin
npm install
npx office-addin-dev-certs install

## Build Commands

| Command         | Description               |
|-----------------|---------------------------|
| `npm run build` | Production build          |
| `npm run dev`   | Development server        |
| `npm start`     | Load add-in in Word       |
| `npm test`      | Run test suite            |

## Development

npm run dev  # Starts development server with hot reload
npm start   # Loads add-in in Word

## License

MIT License