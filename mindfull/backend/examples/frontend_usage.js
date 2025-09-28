// Example frontend usage of the Recipe Generator API
// This demonstrates how to integrate the API with your React Native app

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/recipes';

class RecipeService {
  
  /**
   * Generate recipes based on user input
   * @param {string} userRequest - Detailed description of desired meal
   * @returns {Promise} - Promise resolving to recipe data
   */
  static async generateRecipes(userRequest) {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, {
        userRequest: userRequest.trim()
      });

      if (response.data.success) {
        return {
          success: true,
          recipes: response.data.data.recipes,
          userRequest: response.data.data.userRequest,
          generatedAt: response.data.data.generated_at
        };
      } else {
        throw new Error(response.data.error || 'Failed to generate recipes');
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Save a recipe to user's favorites
   * @param {string} userId - User identifier
   * @param {object} recipe - Recipe object to save
   * @returns {Promise} - Promise resolving to save confirmation
   */
  static async saveRecipe(userId, recipe) {
    try {
      const response = await axios.post(`${API_BASE_URL}/save`, {
        userId,
        recipe
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.error || 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Recipe save error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get user's saved recipes
   * @param {string} userId - User identifier
   * @returns {Promise} - Promise resolving to saved recipes
   */
  static async getSavedRecipes(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/saved/${userId}`);

      if (response.data.success) {
        return {
          success: true,
          recipes: response.data.data
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch saved recipes');
      }
    } catch (error) {
      console.error('Fetch saved recipes error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Remove a saved recipe
   * @param {string} userId - User identifier
   * @param {string} recipeId - Recipe identifier
   * @returns {Promise} - Promise resolving to deletion confirmation
   */
  static async removeSavedRecipe(userId, recipeId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/saved/${userId}/${recipeId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.error || 'Failed to remove recipe');
      }
    } catch (error) {
      console.error('Remove recipe error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

// Example React Native component usage
const RecipeGeneratorScreen = () => {
  const [userRequest, setUserRequest] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateRecipes = async () => {
    if (!userRequest.trim()) {
      setError('Please enter a detailed description of your desired meal');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);

    const result = await RecipeService.generateRecipes(userRequest);

    if (result.success) {
      setRecipes(result.recipes);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleSaveRecipe = async (recipe) => {
    // Assuming you have user ID from authentication
    const userId = 'current-user-id'; 
    
    const result = await RecipeService.saveRecipe(userId, recipe);

    if (result.success) {
      // Show success message
      alert('Recipe saved successfully!');
    } else {
      alert(`Failed to save recipe: ${result.error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe Generator</Text>
      
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Enter a detailed description of your desired meal (e.g., 'a low-caloric high protein meal that's not high in fats and sugars, preferably using chicken breast and vegetables')"
        value={userRequest}
        onChangeText={setUserRequest}
      />

      <TouchableOpacity 
        style={styles.generateButton}
        onPress={handleGenerateRecipes}
        disabled={loading}
      >
        <Text style={styles.generateButtonText}>
          {loading ? 'Generating Recipes...' : 'Generate Recipes'}
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeInfo}>
              {item.total_time_minutes} min • {item.servings} servings • {item.difficulty}
            </Text>
            <Text style={styles.recipeNutrition}>
              {item.nutrition_per_serving.calories_kcal} cal • 
              {item.nutrition_per_serving.macros_g.protein_g}g protein
            </Text>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => handleSaveRecipe(item)}
            >
              <Text style={styles.saveButtonText}>Save Recipe</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

// Example usage with different meal requests
const exampleRequests = [
  "a low-caloric high protein meal that's not high in fats and sugars, preferably using chicken breast and vegetables",
  "a quick 15-minute breakfast that's high in protein and low in carbs",
  "a vegetarian dinner recipe that's rich in fiber and under 400 calories",
  "a keto-friendly lunch with salmon and leafy greens"
];

export { RecipeService, RecipeGeneratorScreen };