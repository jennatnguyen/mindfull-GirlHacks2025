import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { colors } from '../theme';
import {
    ArrowLeft,
    Clock,
    Users,
    ChefHat,
    Beef,
    CakeSlice,
    Leaf,
    Sprout,
    Fish,
    Apple,
    Egg,
    Wheat,
} from 'lucide-react-native';
import type { Recipe } from './CookbookScreen';

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

const difficultyColors = {
    easy: '#16a34a',
    medium: '#eab308',
    hard: '#dc2626',
};

interface RecipeDetailScreenProps {
    recipe: Recipe;
    onBack: () => void;
}

import { useEffect, useState } from 'react';
import { fetchRecipeById, fetchIngredientsForRecipe } from '../utils/apiHelpersRecipe';

export function RecipeDetailScreen({ recipeId, onBack }: { recipeId: string | number, onBack: () => void }) {
    const [recipe, setRecipe] = useState<any>(null);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        async function loadRecipe() {
            const recipeData = await fetchRecipeById(recipeId);
            setRecipe(recipeData.recipe);
            const ingData = await fetchIngredientsForRecipe(recipeId);
            setIngredients(ingData.ingredients);
            setLoading(false);
        }
        loadRecipe();
    }, [recipeId]);

    if (loading || !recipe) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

        const categoryStr = String(recipe.category);
        const categoryKey = Object.prototype.hasOwnProperty.call(categoryIcons, categoryStr)
            ? (categoryStr as keyof typeof categoryIcons)
            : 'meat';
        const IconComponent = categoryIcons[categoryKey];
        const iconColor = categoryColors[categoryKey];

        const difficultyStr = recipe.difficulty ? String(recipe.difficulty) : '';
        const difficultyKey = Object.prototype.hasOwnProperty.call(difficultyColors, difficultyStr)
            ? (difficultyStr as keyof typeof difficultyColors)
            : undefined;
        const difficultyColor = difficultyKey ? difficultyColors[difficultyKey] : colors.muted;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recipe</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Recipe Hero */}
                <View style={styles.heroSection}>
                    <View style={[styles.heroIcon, { backgroundColor: iconColor + '20' }]}>
                        <IconComponent size={48} color={iconColor} />
                    </View>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={[styles.categoryText, { color: iconColor }]}>
                            {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                        </Text>
                    </View>
                </View>

                {/* Recipe Stats */}
                <View style={styles.statsContainer}>
                    {recipe.cookTime && (
                        <View style={styles.statItem}>
                            <Clock size={20} color={colors.muted} />
                            <Text style={styles.statLabel}>Cook Time</Text>
                            <Text style={styles.statValue}>{recipe.cookTime}</Text>
                        </View>
                    )}

                    {recipe.servings && (
                        <View style={styles.statItem}>
                            <Users size={20} color={colors.muted} />
                            <Text style={styles.statLabel}>Servings</Text>
                            <Text style={styles.statValue}>{recipe.servings}</Text>
                        </View>
                    )}

                    {recipe.difficulty && (
                        <View style={styles.statItem}>
                            <ChefHat size={20} color={colors.muted} />
                            <Text style={styles.statLabel}>Difficulty</Text>
                            <Text style={[styles.statValue, { color: difficultyColor }]}>
                                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Ingredients */}
                {ingredients && ingredients.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <View style={styles.ingredientsList}>
                            {ingredients.map((ingredient, index) => (
                                <View key={index} style={styles.ingredientItem}>
                                    <View style={styles.ingredientBullet} />
                                    <Text style={styles.ingredientText}>{ingredient.name}{ingredient.quantity ? ` (${ingredient.quantity} ${ingredient.unit || ''})` : ''}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Instructions */}
                {recipe.instructions && recipe.instructions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <View style={styles.instructionsList}>
                            {Array.isArray(recipe.instructions)
                                ? recipe.instructions.map((instruction: string, index: number) => (
                                    <View key={index} style={styles.instructionItem}>
                                        <View style={styles.stepNumber}>
                                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.instructionText}>{instruction}</Text>
                                    </View>
                                ))
                                : <Text style={styles.instructionText}>{recipe.instructions}</Text>
                            }
                        </View>
                    </View>
                )}

            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    heroIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    recipeName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 6,
    },
    categoryBadge: {
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    ingredientsList: {
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ingredientBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
    },
    instructionsList: {
        gap: 16,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        color: colors.background,
        fontSize: 14,
        fontWeight: 'bold',
    },
    instructionText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
        lineHeight: 24,
    },
    actionButtons: {
        gap: 12,
        paddingBottom: 24,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RecipeDetailScreen;