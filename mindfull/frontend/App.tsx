import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, AppRegistry } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { signIn, signUp, signOut } from "./utils/auth";
import {useSession} from "./utils/useSession";

// Dummy icons for demonstration (replace with your icon library or remove if not needed)
const Home = ({ size = 20 }) => <Text style={{ fontSize: size }}>🏠</Text>;
const Pill = ({ size = 20 }) => <Text style={{ fontSize: size }}>💊</Text>;
const Utensils = ({ size = 20 }) => <Text style={{ fontSize: size }}>🍽️</Text>;
const Brain = ({ size = 20 }) => <Text style={{ fontSize: size }}>🧠</Text>;
const Heart = ({ size = 20 }) => <Text style={{ fontSize: size }}>❤️</Text>;
const Settings = ({ size = 20 }) => <Text style={{ fontSize: size }}>⚙️</Text>;
const Clock = ({ size = 20 }) => <Text style={{ fontSize: size }}>⏰</Text>;
const BookOpen = ({ size = 20 }) => <Text style={{ fontSize: size }}>📖</Text>;


const Button = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{children}</Text>
  </TouchableOpacity>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{children}</Text>
  </View>
);

type Screen = 'home';

export default function App() {
  const session = useSession();
const user = session?.user ?? null;
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userName, setUserName] = useState(user?.email || 'User');

  React.useEffect(() => {
    if (user?.email) setUserName(user.email);
  }, [user]);

  if (!session) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
      default:
        return <HomeScreen userName={userName} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mindfull</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button onPress={() => { /* settings action */ }}>
            <Settings size={20} />
          </Button>
          <Button onPress={signOut}>
            Sign Out
          </Button>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
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
        {/* Other nav buttons can be added here */}
      </View>
    </View>
  );
}

//---------------------------------------Login Screen---------------------------------------
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        // ✅ Pass the name along to signUp
        await signUp(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.headerTitle}>Mindfull</Text>
      <Text style={styles.loginSubtitle}>
        {mode === 'login' ? 'Sign In' : 'Sign Up'}
      </Text>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Name field only on Sign Up */}
      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
      )}

      {/* Errors */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Action button */}
      <Button onPress={handleAuth}>
        {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
      </Button>

      {/* Toggle between login/signup */}
      <TouchableOpacity
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        <Text style={styles.switchText}>
          {mode === 'login'
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

//---------------------------------------Home Screen---------------------------------------
function HomeScreen({ userName, onNavigate }: { userName: string; onNavigate: (screen: Screen) => void }) {
  return (
    <View style={styles.homeContainer}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Hello, {userName}!</Text>
        <Text style={styles.welcomeSubtitle}>How can we help you today?</Text>
      </View>

      <View style={styles.quickActions}>
        <QuickActionCard
          icon={<Pill size={24} />}
          title="Take Meds"
          description="Time for your medication"
          color="#6366f1"
          onPress={() => { }}
        />
        <QuickActionCard
          icon={<Utensils size={24} />}
          title="Plan Meals"
          description="What's for dinner?"
          color="#06b6d4"
          onPress={() => { }}
        />
        <QuickActionCard
          icon={<Brain size={24} />}
          title="Focus Time"
          description="Start studying"
          color="#8b5cf6"
          onPress={() => { }}
        />
        <QuickActionCard
          icon={<Heart size={24} />}
          title="Mindfulness"
          description="Take a break"
          color="#f59e0b"
          onPress={() => { }}
        />
      </View>

      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <Clock size={20} />
          <Text style={styles.scheduleTitle}>Today's Schedule</Text>
        </View>

        <View style={styles.scheduleItem}>
          <View style={styles.scheduleItemLeft}>
            <Pill size={16} />
            <Text style={styles.scheduleItemText}>Morning Medication</Text>
          </View>
          <Badge>9:00 AM</Badge>
        </View>

        <View style={styles.scheduleItem}>
          <View style={styles.scheduleItemLeft}>
            <Utensils size={16} />
            <Text style={styles.scheduleItemText}>Meal Prep</Text>
          </View>
          <Badge>12:00 PM</Badge>
        </View>

        <View style={styles.scheduleItem}>
          <View style={styles.scheduleItemLeft}>
            <BookOpen size={16} />
            <Text style={styles.scheduleItemText}>Study Session</Text>
          </View>
          <Badge>2:00 PM</Badge>
        </View>
      </View>
    </View>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  color,
  onPress
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: color }]}
      onPress={onPress}
    >
      <View style={styles.quickActionContent}>
        {icon}
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
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
      {icon}
      <Text style={styles.navButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingTop: 50, // Account for status bar
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    padding: 8,
    backgroundColor: '#010c0bff',
    //'#6366f1',
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },

  badge: {
    backgroundColor: '#f3f4f6',
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
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  navButtonActive: {
    backgroundColor: '#e0e7ff',
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  homeContainer: {
    padding: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionTitle: {
    fontWeight: 'bold',
    marginTop: 4,
    color: 'white',
  },
  quickActionDescription: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 4,
  },
  scheduleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleItemText: {
    marginLeft: 8,
  },
  // ─────────────────────────────
  // LOGIN SCREEN STYLING
  // ─────────────────────────────
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#9db7ab', // pastel green/blue bg
  },
  loginSubtitle: {
    fontSize: 22,
    marginBottom: 16,
    color: '#f1d797ff', // gold subtitle
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#c49a2f', // gold outline
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1e1e1e',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  switchText: {
    color: '#110c01ff', // black link
    marginTop: 16,
    textDecorationLine: 'underline',
  },
  // NEW: login-only button styles (don’t duplicate "button"/"buttonText")
  loginButton: {
    backgroundColor: '#c49a2f', // gold
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

// Register the app component with React Native
AppRegistry.registerComponent('main', () => App);