import { RECIPES_API_URL, MEDICINE_API_URL } from './api';

// ------------------- Recipe API helpers -------------------
export async function fetchUserRecipes(user_id: string) {
  const res = await fetch(`${RECIPES_API_URL}/user/${user_id}`);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function fetchAllRecipes() {
  const res = await fetch(RECIPES_API_URL);
  if (!res.ok) throw new Error('Failed to fetch all recipes');
  return res.json();
}

export async function fetchRecipeById(id: string | number) {
  const res = await fetch(`${RECIPES_API_URL}/single/${id}`);
  if (!res.ok) throw new Error('Failed to fetch recipe');
  return res.json();
}

export async function createRecipe(name: string, user_id: string) {
  const res = await fetch(RECIPES_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, user_id }),
  });
  if (!res.ok) throw new Error('Failed to create recipe');
  return res.json();
}

export async function deleteRecipe(id: string | number) {
  const res = await fetch(`${RECIPES_API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
  return res.json();
}

// ------------------- Grocery List API helpers -------------------
export async function generateGroceryList(user_id: string, recipeIds: (string | number)[]) {
  const res = await fetch(`${RECIPES_API_URL}/grocery-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, recipeIds }),
  });
  if (!res.ok) throw new Error('Failed to generate grocery list');
  return res.json();
}

export async function fetchGroceryListItems(groceryListId: string | number) {
  const res = await fetch(`${RECIPES_API_URL}/grocery-list/${groceryListId}/items`);
  if (!res.ok) throw new Error('Failed to fetch grocery list items');
  return res.json();
}

// ------------------- Ingredients API helpers -------------------
export async function fetchIngredientsForRecipe(recipe_id: string | number) {
  const res = await fetch(`${RECIPES_API_URL}/${recipe_id}/ingredients`);
  if (!res.ok) throw new Error('Failed to fetch ingredients');
  return res.json();
}

// ------------------- Medicine API helpers (template) -------------------
export async function fetchUserMedicines(user_id: string) {
  const res = await fetch(`${MEDICINE_API_URL}/user/${user_id}`);
  if (!res.ok) throw new Error('Failed to fetch medicines');
  return res.json();
}

// Add more medicine helpers as needed, e.g. createMedicine, deleteMedicine, etc.