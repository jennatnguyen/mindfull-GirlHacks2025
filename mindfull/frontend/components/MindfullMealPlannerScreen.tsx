import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

export type Meal = {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day: string;
  ingredients: string[];
  cookTime: string;
  servings: number;
};

type GroceryItem = {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
};

export function MindfullMealPlannerScreen() {
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Overnight Oats',
      type: 'breakfast',
      day: 'Monday',
      ingredients: ['Rolled oats', 'Milk', 'Banana', 'Honey'],
      cookTime: '5 min',
      servings: 1,
    },
    {
      id: '2',
      name: 'Chicken Stir Fry',
      type: 'dinner',
      day: 'Monday',
      ingredients: ['Chicken breast', 'Mixed vegetables', 'Soy sauce', 'Rice'],
      cookTime: '20 min',
      servings: 2,
    },
  ]);

  const [groceryList, setGroceryList] = useState<GroceryItem[]>([
    { id: '1', name: 'Rolled oats', amount: '1 container', category: 'Grains', checked: false },
    { id: '2', name: 'Chicken breast', amount: '1 lb', category: 'Meat', checked: false },
    { id: '3', name: 'Mixed vegetables', amount: '1 bag', category: 'Frozen', checked: true },
    { id: '4', name: 'Bananas', amount: '6 count', category: 'Produce', checked: false },
  ]);

  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [peopleCount, setPeopleCount] = useState(2);
  const [newMealName, setNewMealName] = useState('');
  const [newMealType, setNewMealType] = useState<Meal['type']>('dinner');
  const [newMealDay, setNewMealDay] = useState('Monday');

  const toggleGroceryItem = (id: string) => {
    setGroceryList(prev => prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const generateGroceryList = () => {
    Alert.alert('Smart Grocery List', `AI would generate an optimized grocery list for ${peopleCount} people!`);
  };

  const generateMealPlan = () => {
    Alert.alert('Generate Meal Plan', `AI would generate a meal plan for ${peopleCount} people!`);
  };

  const addMeal = () => {
    if (!newMealName.trim()) {
      Alert.alert('Validation', 'Please provide a meal name.');
      return;
    }
    const meal: Meal = {
      id: String(Date.now()),
      name: newMealName.trim(),
      type: newMealType,
      day: newMealDay,
      ingredients: [],
      cookTime: '10 min',
      servings: 1,
    };
    setMeals(prev => [meal, ...prev]);
    setNewMealName('');
    setNewMealType('dinner');
    setNewMealDay('Monday');
    setShowAddMealDialog(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal Planner</Text>
        <View style={styles.headerRight}>
          <Text style={styles.icon}>👥</Text>
          <TextInput
            keyboardType="number-pad"
            value={String(peopleCount)}
            onChangeText={t => {
              const n = Number(t) || 1;
              setPeopleCount(Math.max(1, Math.min(10, n)));
            }}
            style={styles.peopleInput}
          />
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddMealDialog(true)}>
            <Text style={styles.addBtnText}>＋ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Quick Actions */}
      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickAction} onPress={generateMealPlan}>
          <Text style={styles.icon}>👨‍🍳</Text>
          <Text style={styles.quickText}>Generate Meal Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={generateGroceryList}>
          <Text style={styles.icon}>🛒</Text>
          <Text style={styles.quickText}>Smart Grocery List</Text>
        </TouchableOpacity>
      </View>

      {/* Meals by day */}
      {daysOfWeek.map(day => {
        const dayMeals = meals.filter(m => m.day === day);
        return (
          <View key={day} style={styles.card}>
            <Text style={styles.cardTitle}>{day}</Text>
            {dayMeals.length === 0 ? (
              <Text style={styles.muted}>No meals planned for {day}</Text>
            ) : (
              <View>
                {dayMeals.map(meal => (
                  <View key={meal.id} style={styles.mealRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.mealAvatar}>
                        <Text style={{ color: 'white' }}>🍽️</Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontWeight: '600' }}>{meal.name}</Text>
                        <Text style={styles.muted}>{meal.cookTime} • {meal.servings} serving{meal.servings > 1 ? 's' : ''}</Text>
                      </View>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{meal.type}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Grocery list */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Grocery List</Text>
        {Object.entries(
          groceryList.reduce((acc: Record<string, GroceryItem[]>, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <View key={category} style={{ marginTop: 8 }}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {items.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.groceryRow, item.checked ? styles.groceryChecked : undefined]}
                onPress={() => toggleGroceryItem(item.id)}
              >
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={item.checked ? styles.lineThrough : undefined}>{item.name}</Text>
                  <Text style={styles.muted}>({item.amount})</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Ingredients grid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pantry Ingredients</Text>
        <View style={styles.grid}>
          {['Rice', 'Pasta', 'Olive Oil', 'Salt', 'Pepper', 'Garlic', 'Onions', 'Tomatoes'].map(ingredient => (
            <View key={ingredient} style={styles.ingredient}>
              <Text style={styles.icon}>🍽️</Text>
              <Text style={{ marginTop: 6 }}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Add Meal Modal */}
      <Modal visible={showAddMealDialog} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Add New Meal</Text>
            <Text style={styles.label}>Meal Name</Text>
            <TextInput value={newMealName} onChangeText={setNewMealName} style={styles.input} placeholder="e.g., Chicken Stir Fry" />
            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as Meal['type'][]).map(t => (
                <TouchableOpacity key={t} onPress={() => setNewMealType(t)} style={[styles.pill, newMealType === t && styles.pillActive]}>
                  <Text style={newMealType === t ? { color: 'white' } : undefined}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Day</Text>
            <View style={styles.row}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <TouchableOpacity key={d} onPress={() => setNewMealDay(d)} style={[styles.pill, newMealDay === d && styles.pillActive]}>
                  <Text style={newMealDay === d ? { color: 'white' } : undefined}>{d.slice(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, borderWidth: 1, marginRight: 8 }]} onPress={() => setShowAddMealDialog(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={addMeal}>
                <Text style={{ color: 'white' }}>Add Meal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  peopleInput: { width: 48, height: 32, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 8, borderRadius: 6, textAlign: 'center' },
  addBtn: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#111827', borderRadius: 6 },
  addBtnText: { color: 'white' },
  icon: { fontSize: 18, marginRight: 6 },
  quickRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  quickAction: { flex: 1, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  quickText: { marginTop: 6, fontSize: 12 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8, backgroundColor: 'white' },
  cardTitle: { fontWeight: '700', fontSize: 16 },
  muted: { color: '#6b7280', marginTop: 8 },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12 },
  categoryTitle: { fontWeight: '600', marginBottom: 6, color: '#374151' },
  groceryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 6 },
  groceryChecked: { backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#d1d5db', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#10b981', borderColor: '#10b981' },
  checkMark: { color: 'white', fontSize: 12, fontWeight: '700' },
  lineThrough: { textDecorationLine: 'line-through', color: '#6b7280' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  ingredient: { width: '48%', padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 6 },
  mealAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 6 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  pill: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, marginRight: 6, marginBottom: 6 },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  btn: { padding: 10, borderRadius: 8, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
});

export default MindfullMealPlannerScreen;
