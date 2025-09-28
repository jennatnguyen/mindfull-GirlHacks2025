import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../theme';
import CameraScreen from './CameraScreen';
import { API_BASE_URL } from '../utils/api';
import { useMedications, type MedicationWithUI } from './hooks/useMedications';
// TODO: Replace with actual user ID from your auth system
const DEMO_USER_ID = '24e29b84-3e45-45fe-9de7-e3e447ced105';

export function MedicationScreen() {
  console.log('MedicationScreen rendered');
  
  const {
    medications,
    loading,
    error,
    upcomingMeds,
    lowStockMeds,
    addMedication,
    markAsTaken,
    refreshMedications,
  } = useMedications({ userId: DEMO_USER_ID });

  console.log('MedicationScreen state:', { 
    medicationsCount: medications.length, 
    loading, 
    error, 
    upcomingCount: upcomingMeds.length,
    lowStockCount: lowStockMeds.length 
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicationWithUI | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  // Form state
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTime, setNewTime] = useState('');

  // Simple connectivity test
  const testConnection = async () => {
  console.log('Testing connection...');
    setTestResult('Testing...');
    try {
      // Hit root by swapping '/api' -> '' to test reachability
      const rootUrl = API_BASE_URL.replace(/\/?api\/?$/, '/');
      const response = await fetch(rootUrl);
      const text = await response.text();
  console.log('Connection test result:', text);
      setTestResult(`Success: ${text}`);
    } catch (error) {
  console.log('Connection test failed:', error);
      setTestResult(`Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleTakeMedication = (med: MedicationWithUI) => {
    setSelectedMed(med);
    setShowVerifyModal(true);
  };

  const handleMedVerified = async () => {
    if (selectedMed) {
      const success = await markAsTaken(selectedMed.id);
      if (success) {
        setShowVerifyModal(false);
        setSelectedMed(null);
      }
    }
  };

  const handleCapture = (photo: { uri: string }) => {
    // Later: send photo.uri to backend for OCR/verification
    handleMedVerified();
  };

  const addMedicationHandler = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Please enter a medication name.');
      return;
    }

    const success = await addMedication({
      name: newName.trim(),
      dose: newDose.trim() || '—',
      description: newDescription.trim() || '',
      // TODO: Add time/schedule handling
    });

    if (success) {
      setNewName('');
      setNewDose('');
      setNewDescription('');
      setNewTime('');
      setShowAddModal(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMedications();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.muted, { marginTop: 16 }]}>Loading medications...</Text>
        <Text style={[styles.muted, { marginTop: 8, fontSize: 12 }]}>API: {API_BASE_URL}</Text>
        
        {/* Debug section */}
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <TouchableOpacity style={styles.retryBtn} onPress={testConnection}>
            <Text style={styles.retryBtnText}>Test Connection</Text>
          </TouchableOpacity>
          {testResult ? (
            <Text style={[styles.muted, { marginTop: 10, textAlign: 'center' }]}>
              {testResult}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (error && medications.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
  <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refreshMedications}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
          <ScrollView 
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Medications</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>

      {lowStockMeds.length > 0 && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>Warning: {lowStockMeds.length} medication(s) running low. Time to refill!</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Due Now</Text>
        {upcomingMeds.length === 0 ? (
          <Text style={styles.muted}>All medications taken for now!</Text>
        ) : (
          upcomingMeds.map(med => (
            <View key={med.id} style={styles.medRow}>
              <View style={styles.medLeft}>
                <View style={[styles.medAvatar, med.taken ? styles.medTaken : styles.medPending]}>
                  <Text style={styles.medAvatarText}>💊</Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.muted}>{med.dose} • {med.description}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{med.time}</Text>
                </View>
                <TouchableOpacity style={styles.takeBtn} onPress={() => handleTakeMedication(med)}>
                  <Text style={styles.takeBtnText}>Take</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>All Medications</Text>
        {medications.map(med => (
          <View key={med.id} style={styles.allMedRow}>
            <View style={styles.allMedLeft}>
              <View style={[styles.medAvatar, med.taken ? styles.medTaken : styles.medPending]}>
                <Text style={styles.medAvatarText}>💊</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.medName}>{med.name} - {med.dose}</Text>
                <Text style={styles.muted}>{med.description}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{med.pillsRemaining} left</Text>
              </View>
              <Text style={styles.smallMuted}>{med.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Add modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Medication</Text>
            <TextInput placeholder="Name" value={newName} onChangeText={setNewName} style={styles.input} />
            <TextInput placeholder="Dose" value={newDose} onChangeText={setNewDose} style={styles.input} />
            <TextInput placeholder="Description" value={newDescription} onChangeText={setNewDescription} style={[styles.input, { height: 80 }]} multiline />
            <TextInput placeholder="Time" value={newTime} onChangeText={setNewTime} style={styles.input} />
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, borderWidth: 1, marginRight: 8 }]} onPress={() => setShowAddModal(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={addMedicationHandler}>
                <Text style={{ color: 'white' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verify modal */}
      <Modal visible={showVerifyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Medication</Text>
            <Text style={styles.muted}>Take a photo of your {selectedMed?.name} pill to confirm you're taking the right medication.</Text>
            <View style={{ marginTop: 10 }}>
              <CameraScreen onCapture={handleCapture} onClose={() => setShowVerifyModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.text, textAlign: 'center', fontSize: 16 },
  retryBtn: { backgroundColor: colors.text, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  retryBtnText: { color: 'white', fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  addBtn: { backgroundColor: colors.text, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: 'white' },
  alert: { backgroundColor: colors.warningLight, padding: 10, borderRadius: 8, marginBottom: 12 },
  alertText: { color: colors.warningText },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 8, backgroundColor: colors.cardBg },
  cardTitle: { fontWeight: '700', marginBottom: 8, color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
  smallMuted: { color: colors.muted, fontSize: 12, marginTop: 4 },
  medRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  medLeft: { flexDirection: 'row', alignItems: 'center' },
  medAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  medAvatarText: { color: 'white' },
  medPending: { backgroundColor: '#BFDBFE' },
  medTaken: { backgroundColor: colors.successLight },
  medName: { fontWeight: '600', color: colors.text },
  badge: { backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 6 },
  badgeText: { fontSize: 12, color: colors.text },
  takeBtn: { marginTop: 6, backgroundColor: colors.text, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  takeBtnText: { color: 'white' },
  allMedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.surface },
  allMedLeft: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: colors.cardBg, padding: 16, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, padding: 8, borderRadius: 6, marginTop: 6 },
  cameraPlaceholder: { backgroundColor: colors.surface, height: 140, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btn: { padding: 10, borderRadius: 8, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
});
