import React, { useState } from 'react';
import { Plus, UtensilsCrossed, ShoppingCart, ChefHat, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day: string;
  ingredients: string[];
  cookTime: string;
  servings: number;
}

interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

export function MindfullMealPlannerScreen() {
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Overnight Oats',
      type: 'breakfast',
      day: 'Monday',
      ingredients: ['Rolled oats', 'Milk', 'Banana', 'Honey'],
      cookTime: '5 min',
      servings: 1
    },
    {
      id: '2',
      name: 'Chicken Stir Fry',
      type: 'dinner',
      day: 'Monday',
      ingredients: ['Chicken breast', 'Mixed vegetables', 'Soy sauce', 'Rice'],
      cookTime: '20 min',
      servings: 2
    }
  ]);

  const [groceryList, setGroceryList] = useState<GroceryItem[]>([
    { id: '1', name: 'Rolled oats', amount: '1 container', category: 'Grains', checked: false },
    { id: '2', name: 'Chicken breast', amount: '1 lb', category: 'Meat', checked: false },
    { id: '3', name: 'Mixed vegetables', amount: '1 bag', category: 'Frozen', checked: true },
    { id: '4', name: 'Bananas', amount: '6 count', category: 'Produce', checked: false }
  ]);

  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [peopleCount, setPeopleCount] = useState(2);

  const toggleGroceryItem = (id: string) => {
    setGroceryList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const generateGroceryList = () => {
    // This would use AI in a real app
    alert('AI would generate an optimized grocery list for ' + peopleCount + ' people!');
  };

  const generateMealPlan = () => {
    // This would use AI in a real app
    alert('AI would generate a meal plan for ' + peopleCount + ' people!');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Meal Planner</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Input 
              type="number" 
              value={peopleCount} 
              onChange={(e) => setPeopleCount(Number(e.target.value))}
              className="w-16 h-8"
              min="1"
              max="10"
            />
          </div>
          <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Meal</DialogTitle>
              </DialogHeader>
              <AddMealForm onClose={() => setShowAddMealDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center gap-2"
          onClick={generateMealPlan}
        >
          <ChefHat className="h-6 w-6" />
          <span className="text-sm">Generate Meal Plan</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col items-center gap-2"
          onClick={generateGroceryList}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="text-sm">Smart Grocery List</span>
        </Button>
      </div>

      <Tabs defaultValue="meals">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meals">Meal Plan</TabsTrigger>
          <TabsTrigger value="grocery">Grocery List</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          {daysOfWeek.map(day => {
            const dayMeals = meals.filter(meal => meal.day === day);
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dayMeals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No meals planned for {day}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {dayMeals.map(meal => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="grocery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Grocery List</span>
                <Badge variant="secondary">
                  {groceryList.filter(item => !item.checked).length} items left
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(
                groceryList.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, GroceryItem[]>)
              ).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div 
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${
                          item.checked ? 'bg-green-50 border-green-200' : 'bg-white'
                        }`}
                        onClick={() => toggleGroceryItem(item.id)}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {item.checked && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1">
                          <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                            {item.name}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">({item.amount})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pantry Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {['Rice', 'Pasta', 'Olive Oil', 'Salt', 'Pepper', 'Garlic', 'Onions', 'Tomatoes'].map(ingredient => (
                  <div key={ingredient} className="p-3 border rounded-lg text-center">
                    <UtensilsCrossed className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm">{ingredient}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const typeColors = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800'
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{meal.name}</p>
          <p className="text-sm text-muted-foreground">
            {meal.cookTime} • {meal.servings} serving{meal.servings > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <Badge className={typeColors[meal.type]}>
        {meal.type}
      </Badge>
    </div>
  );
}

function AddMealForm({ onClose }: { onClose: () => void }) {
  const [mealType, setMealType] = useState('dinner');
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="meal-name">Meal Name</Label>
        <Input id="meal-name" placeholder="e.g., Chicken Stir Fry" />
      </div>
      <div>
        <Label htmlFor="meal-type">Type</Label>
        <select 
          id="meal-type" 
          value={mealType} 
          onChange={(e) => setMealType(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
      <div>
        <Label htmlFor="day">Day</Label>
        <select id="day" className="w-full p-2 border rounded-md">
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Add Meal
        </Button>
      </div>
    </div>
  );
}