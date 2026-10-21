import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Recipe } from '@/types/recipe';

const STORAGE_KEY = '@somani-cookbook/v1';

interface StoredCookbook {
  recipes: Recipe[];
  favorites: string[];
}

interface RecipeContextValue extends StoredCookbook {
  isLoading: boolean;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

const RecipeContext = createContext<RecipeContextValue | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const parsed = JSON.parse(stored) as Partial<StoredCookbook>;
        if (Array.isArray(parsed.recipes)) setRecipes(parsed.recipes);
        if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
      })
      .catch(() => {
        // Keep the book available if local data is unreadable.
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: StoredCookbook) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setRecipes(next.recipes);
    setFavorites(next.favorites);
  }, []);

  const saveRecipe = useCallback(
    async (recipe: Recipe) => {
      const next = {
        recipes: [recipe, ...recipes],
        favorites,
      };
      await persist(next);
    },
    [favorites, persist, recipes],
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      await persist({
        recipes: recipes.filter((recipe) => recipe.id !== id),
        favorites: favorites.filter((favoriteId) => favoriteId !== id),
      });
    },
    [favorites, persist, recipes],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const nextFavorites = favorites.includes(id)
        ? favorites.filter((favoriteId) => favoriteId !== id)
        : [...favorites, id];
      await persist({ recipes, favorites: nextFavorites });
    },
    [favorites, persist, recipes],
  );

  const value = useMemo(
    () => ({
      recipes,
      favorites,
      isLoading,
      saveRecipe,
      deleteRecipe,
      toggleFavorite,
    }),
    [recipes, favorites, isLoading, saveRecipe, deleteRecipe, toggleFavorite],
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export function useRecipeBook() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipeBook must be used within a RecipeProvider');
  }
  return context;
}
