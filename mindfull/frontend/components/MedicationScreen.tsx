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
} from 'react-native';
import { colors } from '../theme';
import CameraScreen from './CameraScreen';

export type Medication = {
  id: string;
  name: string;
  dose: string;
  description: string;
  time: string;
  taken: boolean;
  pillsRemaining: number;
};

export function MedicationScreen() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Adderall',
      dose: '20mg',
      description: 'Orange oval pill',
      time: '9:00 AM',
      taken: false,
      pillsRemaining: 15,
    },
    {
      id: '2',
      name: 'Multivitamin',
      dose: '1 tablet',
      description: 'Large brown capsule',
      time: '9:00 AM',
      taken: true,
      pillsRemaining: 5,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleTakeMedication = (med: Medication) => {
    setSelectedMed(med);
    setShowVerifyModal(true);
  };

  const handleMedVerified = () => {
    if (selectedMed) {
      setMedications(prev =>
        prev.map(m => (m.id === selectedMed.id ? { ...m, taken: true, pillsRemaining: Math.max(0, m.pillsRemaining - 1) } : m))
      );
    }
    setShowVerifyModal(false);
    setSelectedMed(null);
  };
  const handleCapture = (photo: { uri: string }) => {
    // Later: send photo.uri to backend for OCR/verification
    handleMedVerified();
  };

  const addMedication = () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Please enter a medication name.');
      return;
    }
    const newMed: Medication = {
      id: String(Date.now()),
      name: newName.trim(),
      dose: newDose.trim() || '—',
      description: newDescription.trim() || '',
      time: newTime.trim() || '—',
      taken: false,
      pillsRemaining: 30,
    };
    setMedications(prev => [newMed, ...prev]);
    setNewName('');
    setNewDose('');
    setNewDescription('');
    setNewTime('');
    setShowAddModal(false);
  };

  const upcomingMeds = medications.filter(m => !m.taken);
  const lowStockMeds = medications.filter(m => m.pillsRemaining <= 5);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Medications</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>

      {lowStockMeds.length > 0 && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>⚠️ {lowStockMeds.length} medication(s) running low. Time to refill!</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Due Now</Text>
        {upcomingMeds.length === 0 ? (
          <Text style={styles.muted}>All medications taken for now! 🎉</Text>
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
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={addMedication}>
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
