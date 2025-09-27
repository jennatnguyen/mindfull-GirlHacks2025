# Mindfull - GirlHacks 2025

**Mindfull** is an ADHD support app designed specifically for neurodivergent college students. This mobile-first web application provides essential tools to help manage daily tasks, medication, and wellness routines.

## ✨ Features

### 💊 Medication Reminders
- Photo verification system for medication compliance
- Snooze options for flexible timing
- Low stock tracking and alerts

### 🍽️ Meal Planner
- AI-generated grocery lists
- Custom recipe creation and storage
- AI-generated meal suggestions

### 🎯 Focus Mode
- App locking functionality during study sessions
- Study verification questions to maintain focus
- Distraction-free environment

### 🧘 Mindfulness Tools
- Haptic feedback for grounding techniques
- Sensory regulation tools
- Self-regulation support features

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+): [Download here](https://nodejs.org)
- **Git**: [Download here](https://git-scm.com)
- **VS Code**: [Download here](https://code.visualstudio.com) (recommended)
- **Expo Go app** on your phone:
  - iOS: App Store → "Expo Go"
  - Android: Google Play → "Expo Go"

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/GirlHacks2025.git
cd GirlHacks2025/mindfull

# Install dependencies
npm install

# Install global tools
npm install -g @expo/cli eas-cli
```

### 2. Start Development
```bash
# Start the development server
npx expo start --tunnel

# Scan QR code with Expo Go app on your phone
```

## 📁 Project Structure
```
GirlHacks2025/
├── mindfull/                 ← Main app directory (work here)
│   ├── App.tsx              ← Main app component
│   ├── app.json             ← Expo configuration
│   ├── package.json         ← Dependencies
│   ├── assets/              ← Images, icons
│   ├── components/          ← React components (create this)
│   ├── screens/             ← App screens (create this)
│   └── services/            ← API calls, utilities (create this)
```

## 🏗️ Development Workflow

### Daily Workflow
```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development server
npx expo start --tunnel

# 4. Make changes, test on phone

# 5. Commit and push
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name

# 6. Create Pull Request on GitHub
```

### Feature Branches
- `feature/meal-planning` - Meal planning system
- `feature/medication-reminders` - Medication management
- `feature/camera-integration` - Photo capture system
- `feature/app-architecture` - Navigation, auth, state management

## 📱 Testing on Phone

### Method 1: Individual Testing
```bash
npx expo start --tunnel
# Scan QR code with your phone
```

### Method 2: Shared Development
```bash
# One person runs the server
npx expo start --tunnel

# Share the exp:// URL with teammates
# Everyone can scan the same QR code
```

## 🛠️ Common Commands

### Development
```bash
npx expo start                # Start development server
npx expo start --clear        # Clear cache and start
npx expo start --tunnel       # Use tunnel for better connectivity
npx expo start --web          # Test in web browser
```

### Package Management
```bash
npm install package-name      # Install new package
npm install                   # Install all dependencies
npm cache clean --force       # Clear npm cache
```

### Building
```bash
eas login                     # Login to EAS
eas init                      # Initialize EAS config
eas build --platform all      # Build for iOS and Android
```

## 🐛 Troubleshooting

### NPM Issues
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Expo Issues
```bash
npx expo doctor               # Check for issues
npx expo start --clear        # Clear cache
npx expo start --tunnel       # Try tunnel mode
```

### Phone Connection Issues
```bash
# Try tunnel mode
npx expo start --tunnel

# Manual URL entry in Expo Go
# Use the exp:// URL from terminal

# Check WiFi - same network for both devices
```

### Build Issues
```bash
# Clear EAS cache
eas build --clear-cache

# Check eas.json configuration
cat eas.json
```

## 🔧 Tech Stack

- **Frontend**: React Native + Expo
- **Styling**: NativeWind (Tailwind for React Native)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Navigation**: React Navigation
- **Camera**: Expo Camera
- **Notifications**: Expo Notifications
- **AI**: OpenAI API (for meal planning and photo verification)


## 🤝 Contributing

This is a project created for neurodivergent college students at GirlHacks 2025. Feel free to fork and adapt this project for your own needs or contribute improvements to help the ADHD community.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with 💜 for the neurodivergent community*
