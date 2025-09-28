import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';
import { colors } from '../theme';
import { supabase } from '../utils/supabase';
import {
    ShoppingCart,
    Check,
    X,
    RefreshCw,
    Plus,
    Trash2
} from 'lucide-react-native';

interface GroceryItem {
    name: string;
    quantity: string;
    checked?: boolean;
}

interface GroceryList {
    id: string;
    user_id: string;
    meal_ids: number[];
    list_json: {
        items: GroceryItem[];
    };
    created_at: string;
}

interface Recipe {
    id: string;
    name: string;
}

interface GroceryListScreenProps {
    activeRecipes?: Recipe[];
    onGenerateList?: (recipeIds: string[]) => Promise<void>;
}

export function GroceryListScreen({ activeRecipes = [], onGenerateList }: GroceryListScreenProps) {
    const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
    const [currentList, setCurrentList] = useState<GroceryList | null>(null);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (data?.user) {
                setUserId(data.user.id);
            }
        });
    }, []);

    useEffect(() => {
        if (userId) {
            fetchGroceryLists();
        }
    }, [userId]);

    const fetchGroceryLists = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('grocery_lists')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching grocery lists:', error);
                return;
            }

            setGroceryLists(data || []);
            if (data && data.length > 0 && !currentList) {
                setCurrentList(data[0]);
            }
        } catch (error) {
            console.error('Error fetching grocery lists:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const generateNewGroceryList = async () => {
        if (!userId || activeRecipes.length === 0) {
            Alert.alert(
                'No Active Recipes',
                'Please select some recipes from your cookbook first.'
            );
            return;
        }

        try {
            setLoading(true);
            const recipeIds = activeRecipes.map(recipe => parseInt(recipe.id));

            const response = await fetch('https://floatiest-uncontested-romaine.ngrok-free.dev/api/recipes/grocery-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    recipeIds: recipeIds
                })
            });

            const data = await response.json();

            if (data.groceryList) {
                await fetchGroceryLists();
                setCurrentList(data.groceryList);
                setCheckedItems(new Set());

                Alert.alert(
                    'Grocery List Generated',
                    'Your new grocery list has been created successfully!'
                );
            }
        } catch (error) {
            console.error('Error generating grocery list:', error);
            Alert.alert(
                'Error',
                'Failed to generate grocery list. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteGroceryList = async (listId: string) => {
        Alert.alert(
            'Delete Grocery List',
            'Are you sure you want to delete this grocery list?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('grocery_lists')
                                .delete()
                                .eq('id', listId);

                            if (error) {
                                console.error('Error deleting grocery list:', error);
                                return;
                            }

                            await fetchGroceryLists();
                            if (currentList?.id === listId) {
                                setCurrentList(groceryLists.length > 1 ? groceryLists[0] : null);
                            }
                        } catch (error) {
                            console.error('Error deleting grocery list:', error);
                        }
                    }
                }
            ]
        );
    };

    const toggleItemCheck = (itemName: string) => {
        const newCheckedItems = new Set(checkedItems);
        if (newCheckedItems.has(itemName)) {
            newCheckedItems.delete(itemName);
        } else {
            newCheckedItems.add(itemName);
        }
        setCheckedItems(newCheckedItems);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchGroceryLists();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <RefreshCw size={64} color={colors.muted} />
                    <Text style={styles.emptyTitle}>Loading grocery lists...</Text>
                </View>
            </View>
        );
    }

    if (!currentList && groceryLists.length === 0) {
        return (
            <View style={styles.container}>
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.emptyState}>
                        <ShoppingCart size={64} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No grocery lists yet</Text>
                        <Text style={styles.emptyDescription}>
                            Select recipes from your cookbook and generate your first grocery list
                        </Text>
                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={generateNewGroceryList}
                        >
                            <Plus size={20} color={colors.background} />
                            <Text style={styles.generateButtonText}>
                                Generate from Active Recipes ({activeRecipes.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    const currentItems = currentList?.list_json?.items || [];
    const checkedCount = currentItems.filter(item => checkedItems.has(item.name)).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Grocery Lists</Text>
                    <Text style={styles.subtitle}>
                        {checkedCount} of {currentItems.length} items checked
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateNewGroceryList}
                >
                    <Plus size={20} color={colors.background} />
                </TouchableOpacity>
            </View>

            {/* List Selection */}
            {groceryLists.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.listSelector}
                    contentContainerStyle={styles.listSelectorContent}
                >
                    {groceryLists.map((list) => (
                        <TouchableOpacity
                            key={list.id}
                            style={[
                                styles.listTab,
                                currentList?.id === list.id && styles.listTabActive
                            ]}
                            onPress={() => {
                                setCurrentList(list);
                                setCheckedItems(new Set());
                            }}
                        >
                            <Text style={[
                                styles.listTabText,
                                currentList?.id === list.id && styles.listTabTextActive
                            ]}>
                                {new Date(list.created_at).toLocaleDateString()}
                            </Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteGroceryList(list.id)}
                            >
                                <X size={16} color={colors.muted} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Grocery Items */}
            <ScrollView
                style={styles.itemsList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {currentItems.map((item, index) => {
                    const isChecked = checkedItems.has(item.name);
                    return (
                        <TouchableOpacity
                            key={`${item.name}-${index}`}
                            style={[
                                styles.groceryItem,
                                isChecked && styles.groceryItemChecked
                            ]}
                            onPress={() => toggleItemCheck(item.name)}
                        >
                            <View style={[
                                styles.checkbox,
                                isChecked && styles.checkboxChecked
                            ]}>
                                {isChecked && (
                                    <Check size={16} color={colors.background} />
                                )}
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={[
                                    styles.itemName,
                                    isChecked && styles.itemNameChecked
                                ]}>
                                    {item.name}
                                </Text>
                                {item.quantity && (
                                    <Text style={[
                                        styles.itemQuantity,
                                        isChecked && styles.itemQuantityChecked
                                    ]}>
                                        {item.quantity}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Clear Checked Items Button */}
            {checkedCount > 0 && (
                <View style={styles.bottomAction}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setCheckedItems(new Set())}
                    >
                        <Text style={styles.clearButtonText}>
                            Clear {checkedCount} checked item{checkedCount !== 1 ? 's' : ''}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 8,
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 2,
    },
    generateButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    generateButtonText: {
        color: colors.background,
        fontSize: 14,
        fontWeight: '600',
    },
    listSelector: {
        marginBottom: 16,
    },
    listSelectorContent: {
        paddingHorizontal: 16,
    },
    listTab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    listTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    listTabText: {
        fontSize: 14,
        color: colors.text,
        marginRight: 8,
    },
    listTabTextActive: {
        color: colors.background,
    },
    deleteButton: {
        padding: 2,
    },
    itemsList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    groceryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    groceryItemChecked: {
        backgroundColor: colors.surface,
        opacity: 0.7,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    itemNameChecked: {
        color: colors.muted,
        textDecorationLine: 'line-through',
    },
    itemQuantity: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 2,
    },
    itemQuantityChecked: {
        textDecorationLine: 'line-through',
    },
    bottomAction: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    clearButton: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    clearButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
});

export default GroceryListScreen;