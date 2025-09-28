import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AppRegistry, Image, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './theme';
import { Home, Pill, Utensils, Brain, Heart, Settings, Clock, BookOpen } from 'lucide-react-native';
import { CookbookScreen } from './components/CookbookScreen';
import { MedicationScreen } from './components/MedicationScreen';
import { useSession } from './utils/useSession';
import { signIn, signUp, signOut, getSession as getAuthSession } from './utils/auth';
const logo = require('./assets/icon.png');

// Dummy Button and Badge components for demonstration
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
  // authentication/session wiring
  const session = useSession();
  const user = (session as any)?.user ?? null;

  // app-level state
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  // helper to make a nicer fallback name from email local-part
  const deriveNameFromEmail = (email?: string | null) => {
    if (!email) return 'User';
    const parts = email.split('@');
    return parts[0] || email;
  };

  const [userName, setUserName] = useState(user?.user_metadata?.display_name || deriveNameFromEmail(user?.email));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  // --- Authentication form state (kept in App for hackathon simplicity) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  // force UI into signed-out state until auth subscription fires
  const [forceSignedOut, setForceSignedOut] = useState(false);


  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    }
    setLoading(false);
  };

  
  // Sign-out wrapper with error handling so button doesn't silently fail
  const handleSignOut = async () => {
    try {
      await signOut();
      // immediately force the UI to the signed-out view; onAuthStateChange will clear this when it fires
      setForceSignedOut(true);
      // verify session cleared
      try {
        const sess = await getAuthSession();
        console.log('session after signOut:', sess);
        if (!sess) {
          // fallback UI reset until onAuthStateChange fires
          setUserName('User');
          setCurrentScreen('home');
        } else {
          console.warn('session still present after signOut', sess);
        }
      } catch (e) {
        console.error('Error checking session after signOut', e);
      }
    } catch (err: any) {
      console.error('Sign out failed', err);
      setError(err?.message || 'Sign out failed');
    }
  };

  // Clear the forced sign-out UI when the session updates (e.g., successful sign-in)
  useEffect(() => {
    if (session) {
      setForceSignedOut(false);
    }
  }, [session]);

  useEffect(() => {
    const display = (user as any)?.user_metadata?.display_name;
    if (display) setUserName(display);
    else if (user?.email) setUserName(deriveNameFromEmail(user.email));
  }, [user]);


  // Change image every hour and quote every time (keep hooks above any early returns)
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

  // If there is no session yet (not signed in) show a simple login/signup form in App
  if (!session)
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.headerTitle}>Mindfull</Text>
        <Text style={styles.loginSubtitle}>{mode === 'login' ? 'Sign In' : 'Sign Up'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button onPress={handleAuth}>{loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}</Button>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.switchText}>{mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</Text>
        </TouchableOpacity>
      </View>
    );


  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            userName={userName}
            onNavigate={setCurrentScreen}
            currentImage={motivationalImages[currentImageIndex]}
            currentQuote={currentQuote}
            onSettings={() => { /* navigate to settings or open modal */ }}
            onSignOut={handleSignOut}
          />
        );
      case 'meals':
        return <CookbookScreen />;
      case 'meds':
        return <MedicationScreen />;
    }
  };

  // If there's no session (or we forced signed-out), show the login/signup UI immediately
  if (!session || forceSignedOut) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar style="auto" />
        <Text style={styles.headerTitle}>Mindfull</Text>
        <Text style={styles.loginSubtitle}>{mode === 'login' ? 'Sign in to continue' : 'Create an account'}</Text>

        {mode === 'signup' && (
          <TextInput
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#6b6b6b"
          />
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#6b6b6b"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#6b6b6b"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleAuth} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.switchText}>{mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
        {/* Header actions removed — moved to footer so they only appear on Home screen */}
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
      {/* footer actions removed (now rendered inside HomeScreen below the image) */}
    </View>
  );
}


// --------------------------------------- Home Screen ---------------------------------------

function HomeScreen({
  userName,
  onNavigate,
  currentImage,
  currentQuote,
  onSettings,
  onSignOut,
}: {
  userName: string;
  onNavigate: (screen: Screen) => void;
  currentImage: string;
  currentQuote: string;
  onSettings: () => void;
  onSignOut: () => void | Promise<void>;
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

      {/* Action buttons below the image (only on Home) */}
      <View style={styles.footerActionsInScroll}>
        <TouchableOpacity style={styles.footerButton} onPress={onSettings}>
          <Settings size={18} color={colors.text} />
          <Text style={[styles.buttonText, { marginLeft: 8 }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={onSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 4, // Minimal bottom padding
    backgroundColor: colors.background,
  },

  homeContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 4, // Minimal top padding
  },

  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -4, // Slight negative margin to pull up
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
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
    marginBottom: 20,
  },
  motivationalCard: {
    backgroundColor: colors.cardBg,
  borderRadius: 20,
  padding: 14,
  marginBottom: 56,
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
  logoImage: {
    width: 120,
    height: 80,
    // Adjust width/height to fit your design
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  footerActionsInScroll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 72,
    marginBottom: 24,
  },
});

// Register the app component with React Native
AppRegistry.registerComponent('main', () => App);