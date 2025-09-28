// Test script for recipe generation API
const axios = require('axios');

// Prefer 127.0.0.1 to avoid IPv6 (::1) connection issues on some Windows setups.
// Allow overriding with BASE_URL env var (e.g. http://0.0.0.0:3000 or your deployed URL)
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:3000') + '/api/recipes';

async function testRecipeGeneration() {
  try {
    console.log('🧪 Testing Recipe Generation API...\n');

    // Test 1: Generate recipes
    console.log('1. Testing recipe generation...');
    const generateResponse = await axios.post(`${BASE_URL}/generate`, {
      userRequest: "a low-caloric high protein meal that's not high in fats and sugars, preferably using chicken breast and vegetables"
    });

    if (generateResponse.data.success) {
      console.log('✅ Recipe generation successful!');
      console.log(`Generated ${generateResponse.data.data.recipes.length} recipes`);
      console.log('First recipe title:', generateResponse.data.data.recipes[0].title);
      // Print the full first recipe JSON for inspection
      console.log('First recipe (full):\n', JSON.stringify(generateResponse.data.data.recipes[0], null, 2));
    } else {
      console.log('❌ Recipe generation failed:', generateResponse.data.error);
    }

    console.log('\n2. Testing with invalid input...');
    
    // Test 2: Invalid input
    try {
      await axios.post(`${BASE_URL}/generate`, {
        userRequest: ""
      });
    } catch (error) {
      if (error.response.status === 400) {
        console.log('✅ Correctly rejected empty request');
      } else {
        console.log('❌ Unexpected error:', error.response.data);
      }
    }

    // Test 3: Save recipe (mock user ID)
    if (generateResponse.data.success && generateResponse.data.data.recipes.length > 0) {
      console.log('\n3. Testing recipe saving...');
      const recipeToSave = generateResponse.data.data.recipes[0];
      
      try {
        const saveResponse = await axios.post(`${BASE_URL}/save`, {
          userId: 'test-user-123',
          recipe: recipeToSave
        });

        if (saveResponse.data.success) {
          console.log('✅ Recipe saved successfully!');
          
          // Test 4: Fetch saved recipes
          console.log('\n4. Testing fetch saved recipes...');
          const fetchResponse = await axios.get(`${BASE_URL}/saved/test-user-123`);
          
          if (fetchResponse.data.success) {
            console.log('✅ Successfully fetched saved recipes');
            console.log(`Found ${fetchResponse.data.data.length} saved recipe(s)`);
          } else {
            console.log('❌ Failed to fetch saved recipes:', fetchResponse.data.error);
          }
        } else {
          console.log('❌ Recipe save failed:', saveResponse.data.error);
        }
      } catch (saveError) {
        console.log('⚠️  Recipe save test skipped (likely no database connection):', saveError.message);
      }
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Example requests for different types of meals
async function testVariousRequests() {
  const requests = [
    "a quick 15-minute breakfast that's high in protein and low in carbs",
    "a vegetarian dinner recipe that's rich in fiber and under 400 calories",
    "a keto-friendly lunch with salmon and leafy greens",
    "a gluten-free dessert that uses natural sweeteners",
    "a meal prep recipe for chicken and rice that serves 4 people"
  ];

  console.log('\n🧪 Testing various recipe requests...\n');

  for (let i = 0; i < requests.length; i++) {
    try {
      console.log(`${i + 1}. Testing: "${requests[i]}"`);
      
      const response = await axios.post(`${BASE_URL}/generate`, {
        userRequest: requests[i]
      });

      if (response.data.success) {
        const recipes = response.data.data.recipes;
        console.log(`   ✅ Generated ${recipes.length} recipes`);
        // Print a compact sample title line followed by the full JSON for the first recipe
        console.log(`   📋 Sample: "${recipes[0].title}" (${recipes[0].total_time_minutes} min)`);
        console.log('   📋 Sample (full):\n', JSON.stringify(recipes[0], null, 2));
      } else {
        console.log(`   ❌ Failed: ${response.data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run tests
if (require.main === module) {
  console.log('Make sure the server is running on http://localhost:3000\n');
  
  testRecipeGeneration()
    .then(() => testVariousRequests())
    .catch(console.error);
}

module.exports = { testRecipeGeneration, testVariousRequests };