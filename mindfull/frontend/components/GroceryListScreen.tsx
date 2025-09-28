import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
}

const GroceryListScreen: React.FC = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
    { id: '1', name: 'Milk', quantity: 2, checked: false },
    { id: '2', name: 'Bread', quantity: 1, checked: false },
    { id: '3', name: 'Eggs', quantity: 12, checked: false },
    { id: '4', name: 'Apples', quantity: 6, checked: false },
    { id: '5', name: 'Chicken Breast', quantity: 2, checked: false },
    { id: '6', name: 'Rice', quantity: 1, checked: false },
    { id: '7', name: 'Bananas', quantity: 4, checked: false },
    { id: '8', name: 'Tomatoes', quantity: 3, checked: false },
  ]);

  const toggleItem = (itemId: string) => {
    setGroceryItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      
      // Sort items: unchecked first, then checked
      return updatedItems.sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? 1 : -1;
      });
    });
  };

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, item.checked && styles.checkedItem]}
      onPress={() => toggleItem(item.id)}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.itemText, item.checked && styles.checkedText]}>
        {item.name} {item.quantity > 1 && `(${item.quantity})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>grocery list</Text>
      </View>

      {/* List */}
      <FlatList
        data={groceryItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🍽️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkedItem: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#333',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
});

export default GroceryListScreen;