import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Pressable,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import { colors } from '../theme';
import RecipeDetailScreen from './RecipeDetailScreen';
// Use the CommonJS build of lucide-react-native to avoid Metro ESM resolution issues
// @ts-ignore: package does not ship typings for the dist/cjs entry; runtime is fine
import {
    Search,
    Beef,
    CakeSlice,
    Leaf,
    Sprout,
    Fish,
    Apple,
    Egg,
    Wheat,
    Plus,
    ChefHat,
    ShoppingCart
} from 'lucide-react-native';

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
import { fetchUserRecipes } from '../utils/apiHelpersRecipe'; // <-- Import your helper
import { supabase } from '../utils/supabase'; // <-- Import your supabase client

export function CookbookScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('cookbook');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [activeRecipes, setActiveRecipes] = useState<string[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const screenWidth = Dimensions.get('window').width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch user ID from Supabase Auth
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (data?.user) setUserId(data.user.id);
        });
    }, []);

    useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUserRecipes(userId)
        .then(data => {
            console.log('API data:', data); // <-- Add this
            const mappedRecipes = (data.recipes || []).map((r: any) => ({
                ...r,
                category: r.type,
            }));
            console.log('Mapped recipes:', mappedRecipes); // <-- And this
            setRecipes(mappedRecipes);
            setLoading(false);
        });
    }, [userId]);

    // When a recipe is selected, slide the detail in from the right
    useEffect(() => {
        if (selectedRecipe) {
            // reset to off-screen right then animate to 0
            translateX.setValue(screenWidth);
            Animated.timing(translateX, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedRecipe, screenWidth, translateX]);

    const handleCloseDetail = () => {
        // slide out to the right then clear selectedRecipe
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
        // TODO: Implement search for new recipes to add
        console.log('Searching for:', searchQuery);
    };

    const handleRecipePress = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleRecipeLongPress = (recipeId: string) => {
        toggleActiveRecipe(recipeId);
    };

    const renderCookbookContent = () => {
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

        if (activeRecipesList.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <ShoppingCart size={64} color={colors.muted} />
                    <Text style={styles.emptyTitle}>No active recipes</Text>
                    <Text style={styles.emptyDescription}>
                        Long press on recipes in your cookbook to add them to your grocery list
                    </Text>
                </View>
            );
        }

        // Combine all ingredients from active recipes
        const allIngredients = activeRecipesList.flatMap(recipe =>
            recipe.ingredients?.map(ingredient => ({
                ingredient,
                recipe: recipe.name
            })) || []
        );

        const groupedIngredients = allIngredients.reduce((groups, item) => {
            if (!groups[item.ingredient]) {
                groups[item.ingredient] = [];
            }
            groups[item.ingredient].push(item.recipe);
            return groups;
        }, {} as Record<string, string[]>);

        return (
            <ScrollView style={styles.groceryContent}>
                <Text style={styles.groceryTitle}>
                    Grocery List ({activeRecipesList.length} recipe{activeRecipesList.length !== 1 ? 's' : ''})
                </Text>

                {Object.entries(groupedIngredients).map(([ingredient, recipeNames]) => (
                    <View key={ingredient} style={styles.groceryItem}>
                        <View style={styles.checkbox} />
                        <View style={styles.groceryItemContent}>
                            <Text style={styles.groceryItemName}>{ingredient}</Text>
                            <Text style={styles.groceryItemRecipes}>
                                for {recipeNames.join(', ')}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Always render cookbook UI beneath the detail overlay so the detail can slide over it */}
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

            {/* Animated detail overlay - slides in/out over the cookbook */}
            {selectedRecipe && (
                <Animated.View
                    style={[
                        styles.detailOverlay,
                        { transform: [{ translateX }] }
                    ]}
                    pointerEvents="box-none"
                >
                    <RecipeDetailScreen recipeId={selectedRecipe.id} onBack={handleCloseDetail} />
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
    groceryContent: {
        flex: 1,
    },
    groceryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    groceryItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: 12,
        marginTop: 2,
    },
    groceryItemContent: {
        flex: 1,
    },
    groceryItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 2,
    },
    groceryItemRecipes: {
        fontSize: 12,
        color: colors.muted,
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