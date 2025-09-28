import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AppRegistry, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './theme';
// Use the CommonJS build of lucide-react-native to avoid Metro ESM resolution issues
// @ts-ignore: package does not ship typings for the dist/cjs entry; runtime is fine
import { Home, Pill, Utensils, Brain, Heart, Settings, Clock, BookOpen } from 'lucide-react-native/dist/cjs/lucide-react-native.js';
import MindfullMealPlannerScreen from './components/MindfullMealPlannerScreen';
import MindfullMedicationScreen from './components/MindfullMedicationScreen';

// Dummy Button and Badge components for demonstration
const Button = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    {children}
  </TouchableOpacity>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{children}</Text>
  </View>
);

type Screen = 'home' | 'meals' | 'meds';

// Array of motivational images that change every hour
const motivationalImages = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop', // Chef cat
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=600&fit=crop', // Meditation cat
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=600&fit=crop', // Study cat
  'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=600&fit=crop', // Happy cat
];

// Array of motivational quotes
const motivationalQuotes = [
  "You're doing great! Keep up the healthy habits! 🌟",
  "Take it one meal, one pill, one moment at a time 💊",
  "Self-care isn't selfish, it's essential 🧘‍♀️",
  "Progress, not perfection. You've got this! 💪",
  "Your health is your wealth 💎",
  "Small steps lead to big changes 🌱",
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userName, setUserName] = useState('User');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  // Change image every hour and quote every time
  useEffect(() => {
    const updateContent = () => {
      const hour = new Date().getHours();
      setCurrentImageIndex(hour % motivationalImages.length);
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    };

    updateContent(); // Set initial content

    // Update every hour
    const interval = setInterval(updateContent, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            userName={userName}
            onNavigate={setCurrentScreen}
            currentImage={motivationalImages[currentImageIndex]}
            currentQuote={currentQuote}
          />
        );
      case 'meals':
        return <MindfullMealPlannerScreen />;
      case 'meds':
        return <MindfullMedicationScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mindfull</Text>
        <Button onPress={() => { /* settings action */ }}>
          <Settings size={20} color={colors.text} />
        </Button>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderScreen()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavButton
          icon={<Home size={20} />}
          label="Home"
          active={currentScreen === 'home'}
          onPress={() => setCurrentScreen('home')}
        />
        <NavButton
          icon={<Utensils size={20} />}
          label="Meals"
          active={currentScreen === 'meals'}
          onPress={() => setCurrentScreen('meals')}
        />
        <NavButton
          icon={<Pill size={20} />}
          label="Medications"
          active={currentScreen === 'meds'}
          onPress={() => setCurrentScreen('meds')}
        />
      </View>
    </View>
  );
}

function HomeScreen({
  userName,
  onNavigate,
  currentImage,
  currentQuote
}: {
  userName: string;
  onNavigate: (screen: Screen) => void;
  currentImage: string;
  currentQuote: string;
}) {
  return (
    <View style={styles.homeContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Welcome, <Text style={styles.welcomeHighlight}>{userName}</Text>!
        </Text>
        <Text style={styles.welcomeQuote}>{currentQuote}</Text>
      </View>

      {/* Main Motivational Image Card */}
      <View style={styles.motivationalCard}>
        <Image
          source={{ uri: currentImage }}
          style={styles.motivationalImage}
          resizeMode="cover"
        />
      </View>

    </View>
  );
}

function QuickActionCard({
  icon,
  title,
  color,
  onPress
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  onPress: () => void;
}) {
  const renderedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, {
      ...((icon as any).props || {}),
      color: ((icon as any).props && (icon as any).props.color) || colors.background
    } as any)
    : icon;

  return (
    <TouchableOpacity
      style={[styles.quickActionCardBottom, { backgroundColor: color }]}
      onPress={onPress}
    >
      <View style={styles.quickActionContentBottom}>
        {renderedIcon}
        <Text style={styles.quickActionTitleBottom}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function NavButton({
  icon,
  label,
  active,
  onPress
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.navButton, active && styles.navButtonActive]}
      onPress={onPress}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, { color: active ? colors.primary : colors.muted } as any)
        : icon}
      <Text style={[styles.navButtonText, { color: active ? colors.primary : colors.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50, // Account for status bar
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  button: {
    padding: 8,
  },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navButtonActive: {
    backgroundColor: colors.primaryLight + '20', // 20% opacity
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  homeContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeHighlight: {
    color: colors.primary,
  },
  welcomeQuote: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  motivationalCard: {
    backgroundColor: colors.cardBg,
  borderRadius: 20,
  padding: 14,
  marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  motivationalImage: {
    width: '100%',
    height: 420,
    borderRadius: 16,
  },
  quickActionsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingBottom: 16,
  },
  quickActionCardBottom: {
    width: '22%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionContentBottom: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitleBottom: {
    fontWeight: '600',
    marginTop: 8,
    color: colors.background,
    fontSize: 12,
    textAlign: 'center',
  },
});

// Register the app component with React Native
AppRegistry.registerComponent('main', () => App);