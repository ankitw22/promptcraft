# PromptCraft

AI-assisted prompt review application built with React and Vite.

## Features

- 📝 Interactive prompt optimization
- 🔍 Multiple review modes (Context Flow, Redundancy, Token Reduction, etc.)
- 🎯 Real-time typewriter effect for AI suggestions
- ✅ Checkpoint-based review workflow
- 📋 Copy and edit final prompts

## Project Structure

```
CoPilot/
├── index.html                     # Entry HTML file
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── src/
│   ├── main.jsx                   # Application entry point
│   ├── App.jsx                    # Root component
│   ├── index.css                  # Global styles
│   ├── components/
│   │   ├── PromptCoPilot.jsx     # Main component with state logic
│   │   ├── screens/
│   │   │   ├── SetupScreen.jsx   # Initial setup screen
│   │   │   ├── ReviewScreen.jsx  # Review and analysis screen
│   │   │   └── FinalScreen.jsx   # Final output screen
│   │   └── ui/
│   │       ├── Button.jsx         # Reusable button component
│   │       ├── Icons.jsx          # Icon components
│   │       └── ModeChip.jsx       # Mode selection chip
│   └── constants/
│       ├── colors.js              # Design tokens and colors
│       └── content.js             # Static content and text
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **IBM Plex Sans & IBM Plex Mono** - Typography
- **OKLCH Color Space** - Modern color system

## Usage

1. **Setup Screen**: Paste your prompt, select review modes, and configure optimization guidelines
2. **Review Screen**: Watch AI optimize your prompt with real-time feedback and checkpoints
3. **Final Screen**: Edit and copy your optimized prompt

## License

MIT
