# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will automatically open in your browser at `http://localhost:3000`

### 3. Start Using!

- **Setup Screen**: Configure your prompt and review preferences
- **Review Screen**: Watch AI optimize your prompt in real-time
- **Final Screen**: Copy and use your optimized prompt

## 📁 What Changed?

Your original `PromptCoPilot.jsx` has been restructured into:

```
src/
├── main.jsx                      ← Entry point
├── App.jsx                       ← Root component
├── components/
│   ├── PromptCoPilot.jsx        ← Main logic (separated from UI)
│   ├── screens/
│   │   ├── SetupScreen.jsx      ← Setup UI
│   │   ├── ReviewScreen.jsx     ← Review UI
│   │   └── FinalScreen.jsx      ← Final UI
│   └── ui/
│       ├── Button.jsx            ← Reusable button
│       ├── Icons.jsx             ← All icons
│       └── ModeChip.jsx          ← Mode selection chips
└── constants/
    ├── colors.js                 ← Color palette
    └── content.js                ← Static text/data
```

## 🎯 Key Benefits

- ✅ **Modular Structure**: Each component has a single responsibility
- ✅ **Reusable Components**: UI elements can be easily reused
- ✅ **Easy to Maintain**: Find and update code quickly
- ✅ **Scalable**: Add new features without cluttering
- ✅ **Production Ready**: Built with Vite for optimal performance

## 🛠 Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 💡 Tips

- Your original file is saved as `PromptCoPilot.jsx.original`
- Hot module replacement (HMR) is enabled - changes reflect instantly
- The app runs on port 3000 by default
- Press `Ctrl+C` to stop the dev server

## 🐛 Troubleshooting

If you encounter issues:

1. Delete `node_modules` and run `npm install` again
2. Clear browser cache
3. Make sure you're using Node.js version 16+

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

Enjoy building with PromptCraft! 🎉
