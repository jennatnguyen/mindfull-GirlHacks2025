import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AppRegistry } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Dummy icons for demonstration (replace with your icon library or remove if not needed)
const Home = ({ size = 20 }) => <Text style={{ fontSize: size }}>🏠</Text>;
const Pill = ({ size = 20 }) => <Text style={{ fontSize: size }}>💊</Text>;
const Utensils = ({ size = 20 }) => <Text style={{ fontSize: size }}>🍽️</Text>;
const Brain = ({ size = 20 }) => <Text style={{ fontSize: size }}>🧠</Text>;
const Heart = ({ size = 20 }) => <Text style={{ fontSize: size }}>❤️</Text>;
const Settings = ({ size = 20 }) => <Text style={{ fontSize: size }}>⚙️</Text>;
const Clock = ({ size = 20 }) => <Text style={{ fontSize: size }}>⏰</Text>;
const BookOpen = ({ size = 20 }) => <Text style={{ fontSize: size }}>📖</Text>;

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

type Screen = 'home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userName, setUserName] = useState('User');

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
        <Button onPress={() => { /* settings action */ }}>
          <Settings size={20} />
        </Button>
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
  content: {
    flex: 1,
  },
  button: {
    padding: 8,
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
});

// Register the app component with React Native
AppRegistry.registerComponent('main', () => App);