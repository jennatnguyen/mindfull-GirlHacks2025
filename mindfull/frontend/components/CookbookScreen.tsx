import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Pressable, Alert, Animated, Dimensions, } from 'react-native';
import { colors } from '../theme';
import { recipeAPI } from '../utils/api';
import RecipeDetailScreen from './RecipeDetailScreen';
import GroceryListScreen from './GroceryListScreen';
import { supabase } from '../utils/supabase';

import { Search, Beef, CakeSlice, Leaf, Sprout, Fish, Apple, Egg, Wheat, Plus, ChefHat, ShoppingCart } from 'lucide-react-native';

export type Recipe = {
    id: string;
    name: string;
    category: 'meat' | 'sweet' | 'vegetarian' | 'vegan' | 'seafood' | 'fruit' | 'egg' | 'grain';
    cookTime?: string;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    ingredients?: string[];
    instructions?: string[];
};

type TabType = 'cookbook' | 'grocery';

const categoryIcons = {
    meat: Beef,
    sweet: CakeSlice,
    vegetarian: Leaf,
    vegan: Sprout,
    seafood: Fish,
    fruit: Apple,
    egg: Egg,
    grain: Wheat,
};

const categoryColors = {
    meat: '#dc2626',
    sweet: '#ec4899',
    vegetarian: '#16a34a',
    vegan: '#059669',
    seafood: '#0ea5e9',
    fruit: '#ea580c',
    egg: '#eab308',
    grain: '#a855f7',
};

// Hardcoded fallback recipes
const fallbackRecipes: Recipe[] = [
    // Meat recipes
    {
        id: 'fb1',
        name: 'Mongolian Beef',
        category: 'meat',
        cookTime: '30 min',
        servings: 4,
        difficulty: 'medium',
        ingredients: ['Beef strips', 'Onions', 'Soy sauce', 'Brown sugar', 'Garlic'],
        instructions: ['Marinate beef', 'Stir fry with onions', 'Add sauce', 'Serve hot']
    },
    {
        id: 'fb2',
        name: 'BBQ Chicken',
        category: 'meat',
        cookTime: '40 min',
        servings: 6,
        difficulty: 'easy',
        ingredients: ['Chicken thighs', 'BBQ sauce', 'Onion powder', 'Paprika', 'Salt'],
        instructions: ['Season chicken', 'Grill 15 min each side', 'Brush with BBQ sauce']
    },
    // Sweet recipes
    {
        id: 'fb3',
        name: 'Chocolate Cake',
        category: 'sweet',
        cookTime: '45 min',
        servings: 8,
        difficulty: 'medium',
        ingredients: ['Flour', 'Cocoa powder', 'Sugar', 'Eggs', 'Butter'],
        instructions: ['Mix dry ingredients', 'Add wet ingredients', 'Bake at 350°F']
    },
    {
        id: 'fb4',
        name: 'Banana Bread',
        category: 'sweet',
        cookTime: '60 min',
        servings: 10,
        difficulty: 'easy',
        ingredients: ['Ripe bananas', 'Flour', 'Sugar', 'Eggs', 'Baking soda'],
        instructions: ['Mash bananas', 'Mix all ingredients', 'Bake 60 minutes']
    },
    // Vegetarian recipes
    {
        id: 'fb5',
        name: 'Caesar Salad',
        category: 'vegetarian',
        cookTime: '15 min',
        servings: 2,
        difficulty: 'easy',
        ingredients: ['Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing'],
        instructions: ['Wash lettuce', 'Add dressing', 'Top with cheese and croutons']
    },
    {
        id: 'fb6',
        name: 'Caprese Pasta',
        category: 'vegetarian',
        cookTime: '25 min',
        servings: 4,
        difficulty: 'easy',
        ingredients: ['Pasta', 'Fresh mozzarella', 'Cherry tomatoes', 'Basil', 'Olive oil'],
        instructions: ['Cook pasta', 'Add tomatoes and mozzarella', 'Toss with basil']
    },
    // Vegan recipes
    {
        id: 'fb7',
        name: 'Quinoa Bowl',
        category: 'vegan',
        cookTime: '20 min',
        servings: 2,
        difficulty: 'easy',
        ingredients: ['Quinoa', 'Black beans', 'Avocado', 'Corn', 'Lime'],
        instructions: ['Cook quinoa', 'Mix with beans and corn', 'Top with avocado']
    },
    {
        id: 'fb8',
        name: 'Lentil Curry',
        category: 'vegan',
        cookTime: '35 min',
        servings: 4,
        difficulty: 'medium',
        ingredients: ['Red lentils', 'Coconut milk', 'Curry powder', 'Onions', 'Tomatoes'],
        instructions: ['Sauté onions', 'Add lentils and spices', 'Simmer with coconut milk']
    },
    // Seafood recipes
    {
        id: 'fb9',
        name: 'Grilled Salmon',
        category: 'seafood',
        cookTime: '20 min',
        servings: 2,
        difficulty: 'easy',
        ingredients: ['Salmon fillets', 'Lemon', 'Olive oil', 'Salt', 'Pepper'],
        instructions: ['Season salmon', 'Grill 6 minutes each side', 'Serve with lemon']
    },
    {
        id: 'fb10',
        name: 'Shrimp Scampi',
        category: 'seafood',
        cookTime: '15 min',
        servings: 3,
        difficulty: 'medium',
        ingredients: ['Shrimp', 'Garlic', 'White wine', 'Butter', 'Pasta'],
        instructions: ['Sauté garlic', 'Add shrimp and wine', 'Toss with pasta']
    },
    // Fruit recipes
    {
        id: 'fb11',
        name: 'Berry Smoothie',
        category: 'fruit',
        cookTime: '5 min',
        servings: 1,
        difficulty: 'easy',
        ingredients: ['Mixed berries', 'Banana', 'Yogurt', 'Honey', 'Ice'],
        instructions: ['Blend all ingredients', 'Serve immediately']
    },
    {
        id: 'fb12',
        name: 'Apple Crisp',
        category: 'fruit',
        cookTime: '50 min',
        servings: 6,
        difficulty: 'easy',
        ingredients: ['Apples', 'Oats', 'Brown sugar', 'Butter', 'Cinnamon'],
        instructions: ['Slice apples', 'Mix topping', 'Bake 45 minutes']
    },
    // Egg recipes
    {
        id: 'fb13',
        name: 'Scrambled Eggs',
        category: 'egg',
        cookTime: '5 min',
        servings: 2,
        difficulty: 'easy',
        ingredients: ['Eggs', 'Butter', 'Salt', 'Pepper', 'Chives'],
        instructions: ['Beat eggs', 'Cook low and slow', 'Garnish with chives']
    },
    {
        id: 'fb14',
        name: 'Egg Benedict',
        category: 'egg',
        cookTime: '25 min',
        servings: 2,
        difficulty: 'hard',
        ingredients: ['English muffins', 'Eggs', 'Ham', 'Hollandaise sauce', 'Paprika'],
        instructions: ['Poach eggs', 'Toast muffins', 'Assemble with ham and sauce']
    },
    // Grain recipes
    {
        id: 'fb15',
        name: 'Garlic Bread',
        category: 'grain',
        cookTime: '15 min',
        servings: 4,
        difficulty: 'easy',
        ingredients: ['Baguette', 'Garlic', 'Butter', 'Parsley', 'Parmesan'],
        instructions: ['Mix garlic butter', 'Spread on bread', 'Bake until golden']
    },
    {
        id: 'fb16',
        name: 'French Toast',
        category: 'grain',
        cookTime: '20 min',
        servings: 4,
        difficulty: 'easy',
        ingredients: ['Thick bread', 'Eggs', 'Milk', 'Vanilla', 'Cinnamon'],
        instructions: ['Make custard', 'Dip bread', 'Cook until golden brown']
    }
];

export function CookbookScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('cookbook');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [activeRecipes, setActiveRecipes] = useState<string[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const screenWidth = Dimensions.get('window').width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;

    // Single recipes state - starts with fallback data, then gets replaced by API data
    const [recipes, setRecipes] = useState<Recipe[]>(fallbackRecipes);
    const [loading, setLoading] = useState(true);
    const [useApiData, setUseApiData] = useState(false);
    const [recipeIngredients, setRecipeIngredients] = useState<Record<string, string[]>>({});

    // Fetch user ID from Supabase Auth
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (data?.user) {
                setUserId(data.user.id);
                console.log('Set userId:', data.user.id);
            } else {
                console.log('No user found', error);
            }
        });
    }, []);

    useEffect(() => {
        console.log('CookbookScreen useEffect, userId:', userId);
        if (!userId) return;

        setLoading(true);
        fetch(`https://floatiest-uncontested-romaine.ngrok-free.dev/api/recipes/user/${userId}`)
            .then(response => response.json())
            .then(data => {
                console.log('API data:', data);
                const mappedRecipes = (data.recipes || []).map((r: any) => ({
                    ...r,
                    category: r.type || 'meat',
                    id: String(r.id),
                    instructions: typeof r.instructions === 'string'
                        ? r.instructions.split('\n').filter(line => line.trim())
                        : r.instructions || [],
                    ingredients: r.ingredients || [],
                    cookTime: r.cookTime || '30 min',
                    servings: r.servings || 4,
                    difficulty: r.difficulty || 'easy'
                }));

                console.log('Mapped recipes:', mappedRecipes);

                if (mappedRecipes.length > 0) {
                    setRecipes(mappedRecipes);
                    setUseApiData(true);
                    console.log('Using API recipes');
                } else {
                    console.log('Using fallback recipes');
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                console.log('Using fallback recipes due to error');
                setLoading(false);
            });
    }, [userId]);

    // Function to fetch ingredients for a specific recipe
    const fetchRecipeIngredients = async (recipeId: string) => {
        if (!useApiData || recipeIngredients[recipeId]) {
            return;
        }

        try {
            const response = await fetch(`https://floatiest-uncontested-romaine.ngrok-free.dev/api/recipes/${recipeId}/ingredients`);
            const data = await response.json();

            if (data.ingredients) {
                const ingredientsList = data.ingredients.map((ing: any) =>
                    ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name
                );

                setRecipeIngredients(prev => ({
                    ...prev,
                    [recipeId]: ingredientsList
                }));

                setRecipes(prev => prev.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, ingredients: ingredientsList }
                        : recipe
                ));
            }
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    // When a recipe is selected, slide the detail in from the right
    useEffect(() => {
        if (selectedRecipe) {
            translateX.setValue(screenWidth);
            Animated.timing(translateX, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedRecipe, screenWidth, translateX]);

    const handleCloseDetail = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setSelectedRecipe(null));
    };

    // Filter recipes based on selected categories
    const filteredRecipes = selectedCategories.length === 0
        ? recipes
        : recipes.filter(recipe => selectedCategories.includes(recipe.category));

    // Group recipes by category
    const groupedRecipes = filteredRecipes.reduce((groups, recipe) => {
        const category = recipe.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(recipe);
        return groups;
    }, {} as Record<string, Recipe[]>);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleActiveRecipe = (recipeId: string) => {
        setActiveRecipes(prev =>
            prev.includes(recipeId)
                ? prev.filter(id => id !== recipeId)
                : [...prev, recipeId]
        );
    };

    const searchForNewRecipes = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleRecipePress = (recipe: Recipe) => {
        fetchRecipeIngredients(recipe.id);
        setSelectedRecipe(recipe);
    };

    const handleRecipeLongPress = (recipeId: string) => {
        toggleActiveRecipe(recipeId);
    };

    const renderCookbookContent = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Loading recipes...</Text>
                </View>
            );
        }

        if (recipes.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <ChefHat size={64} color={colors.muted} />
                    <Text style={styles.emptyTitle}>No recipes yet!</Text>
                    <Text style={styles.emptyDescription}>
                        Start building your cookbook by adding your favorite recipes
                    </Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={20} color={colors.background} />
                        <Text style={styles.addButtonText}>Add Recipe</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.cookbookContent}>
                {/* Show indicator of data source */}
                <View style={styles.dataSourceIndicator}>
                    <Text style={styles.dataSourceText}>
                        {useApiData ? '📡 Your saved recipes' : '📚 Sample recipes'}
                    </Text>
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {Object.keys(categoryIcons).map(category => {
                        const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                        const isSelected = selectedCategories.includes(category);

                        return (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.filterChip,
                                    isSelected && styles.filterChipActive
                                ]}
                                onPress={() => toggleCategory(category)}
                            >
                                <IconComponent
                                    size={16}
                                    color={isSelected ? colors.background : categoryColors[category as keyof typeof categoryColors]}
                                />
                                <Text style={[
                                    styles.filterChipText,
                                    isSelected && styles.filterChipTextActive
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Recipe List */}
                <ScrollView style={styles.recipeList} showsVerticalScrollIndicator={false}>
                    {Object.entries(groupedRecipes).map(([category, categoryRecipes]) => (
                        <View key={category} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Text>
                            <View style={styles.recipeGrid}>
                                {categoryRecipes.map(recipe => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        isActive={activeRecipes.includes(recipe.id)}
                                        onPress={() => handleRecipePress(recipe)}
                                        onLongPress={() => handleRecipeLongPress(recipe.id)}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderGroceryContent = () => {
        const activeRecipesList = recipes.filter(recipe => activeRecipes.includes(recipe.id));

        return (
            <GroceryListScreen
                activeRecipes={activeRecipesList}
                onGenerateList={async (recipeIds: string[]) => {
                    console.log('Generating list for recipes:', recipeIds);
                }}
            />
        );
    };

    return (
        <View style={styles.container}>
            <>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search size={20} color={colors.muted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for new recipes"
                            placeholderTextColor={colors.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchForNewRecipes}
                        />
                    </View>
                </View>

                {/* Tab Buttons */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'cookbook' && styles.tabButtonActive
                        ]}
                        onPress={() => setActiveTab('cookbook')}
                    >
                        <ChefHat
                            size={18}
                            color={activeTab === 'cookbook' ? colors.background : colors.muted}
                            style={styles.tabIcon}
                        />
                        <Text style={[
                            styles.tabButtonText,
                            activeTab === 'cookbook' && styles.tabButtonTextActive
                        ]}>
                            Cookbook
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'grocery' && styles.tabButtonActive
                        ]}
                        onPress={() => setActiveTab('grocery')}
                    >
                        <ShoppingCart
                            size={18}
                            color={activeTab === 'grocery' ? colors.background : colors.muted}
                            style={styles.tabIcon}
                        />
                        <Text style={[
                            styles.tabButtonText,
                            activeTab === 'grocery' && styles.tabButtonTextActive
                        ]}>
                            Grocery List
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {activeTab === 'cookbook' ? renderCookbookContent() : renderGroceryContent()}
                </View>
            </>

            {/* Animated detail overlay */}
            {selectedRecipe && (
                <Animated.View
                    style={[
                        styles.detailOverlay,
                        { transform: [{ translateX }] }
                    ]}
                    pointerEvents="box-none"
                >
                    <RecipeDetailScreen recipe={selectedRecipe} onBack={handleCloseDetail} />
                </Animated.View>
            )}
        </View>
    );
}

function RecipeCard({
    recipe,
    isActive,
    onPress,
    onLongPress
}: {
    recipe: Recipe;
    isActive: boolean;
    onPress: () => void;
    onLongPress: () => void;
}) {
    const IconComponent = categoryIcons[recipe.category];
    const iconColor = categoryColors[recipe.category];

    return (
        <Pressable
            style={[
                styles.recipeCard,
                isActive && styles.recipeCardActive
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View style={[
                styles.recipeIconContainer,
                { backgroundColor: iconColor + '20' },
                isActive && { backgroundColor: iconColor }
            ]}>
                <IconComponent
                    size={32}
                    color={isActive ? colors.background : iconColor}
                />
            </View>
            <Text style={[
                styles.recipeName,
                isActive && styles.recipeNameActive
            ]}>
                {recipe.name}
            </Text>
            {recipe.cookTime && (
                <Text style={[
                    styles.recipeDetails,
                    isActive && styles.recipeDetailsActive
                ]}>
                    {recipe.cookTime}
                </Text>
            )}
            {isActive && (
                <View style={styles.activeIndicator}>
                    <Text style={styles.activeIndicatorText}>✓</Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    searchContainer: {
        marginBottom: 16,
        marginTop: -6,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    tabButtonActive: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tabIcon: {
        marginRight: 4,
    },
    tabButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.muted,
    },
    tabButtonTextActive: {
        color: colors.background,
    },
    content: {
        flex: 1,
    },
    cookbookContent: {
        flex: 1,
    },
    dataSourceIndicator: {
        alignItems: 'center',
        marginBottom: 8,
    },
    dataSourceText: {
        fontSize: 12,
        color: colors.muted,
        fontStyle: 'italic',
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterContent: {
        paddingRight: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginRight: 8,
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        textTransform: 'capitalize',
    },
    filterChipTextActive: {
        color: colors.background,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    recipeList: {
        flex: 1,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    recipeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    recipeCard: {
        width: '47%',
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    recipeCardActive: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.primary + '10',
    },
    recipeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    recipeName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    recipeNameActive: {
        color: colors.primary,
    },
    recipeDetails: {
        fontSize: 12,
        color: colors.muted,
    },
    recipeDetailsActive: {
        color: colors.primary,
    },
    activeIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIndicatorText: {
        color: colors.background,
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        elevation: 10,
    },
});

export default CookbookScreen;