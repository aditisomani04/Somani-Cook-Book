import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeCard } from '@/components/RecipeCard';
import { useRecipeBook } from '@/contexts/RecipeContext';
import { useColors } from '@/hooks/useColors';
import { RECIPE_CATEGORIES } from '@/types/recipe';

const FILTERS = ['All', ...RECIPE_CATEGORIES] as const;

export default function RecipesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recipes, favorites, toggleFavorite, isLoading } = useRecipeBook();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('All');
  const visibleRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesCategory = category === 'All' || recipe.category === category;
      const matchesSearch =
        !query ||
        `${recipe.title} ${recipe.chef} ${recipe.story}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, category]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? Math.max(67, insets.top) + 16 : insets.top + 12,
          paddingBottom: Platform.OS === 'web' ? 110 : insets.bottom + 110,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>THE COLLECTION</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Recipes</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add recipe"
            testID="recipes-add-button"
            onPress={() => router.push('/add-recipe')}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {recipes.length} {recipes.length === 1 ? 'family recipe' : 'family recipes'}
        </Text>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            testID="recipe-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Find a dish, cook, or memory"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.foreground }]}
            accessibilityLabel="Search recipes"
          />
          {search.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
              hitSlop={8}
            >
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategory(item)}
                style={[
                  styles.filter,
                  { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border },
                ]}
              >
                <Text style={[styles.filterText, { color: selected ? colors.primaryForeground : colors.secondaryForeground }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
        ) : visibleRecipes.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
              <Feather name={search ? 'search' : 'book-open'} size={21} color={colors.accentForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search || category !== 'All' ? 'No recipes found' : 'Your recipe box is ready'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search || category !== 'All'
                ? 'Try another search or category.'
                : 'Save a dish here and keep its story close.'}
            </Text>
            {!search && category === 'All' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/add-recipe')}
                style={[styles.emptyButton, { backgroundColor: colors.accent }]}
              >
                <Feather name="plus" size={16} color={colors.accentForeground} />
                <Text style={[styles.emptyButtonText, { color: colors.accentForeground }]}>Add a recipe</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.list}>
            {visibleRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onToggleFavorite={() => void toggleFavorite(recipe.id)}
                onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4 },
  title: { fontFamily: 'Georgia', fontSize: 34, marginTop: 6 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 5 },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.97 }] },
  searchBox: {
    marginTop: 21,
    height: 48,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, minWidth: 0 },
  filters: { gap: 8, paddingVertical: 16 },
  filter: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  loading: { height: 230, alignItems: 'center', justifyContent: 'center' },
  empty: { borderWidth: 1, borderRadius: 22, padding: 20, alignItems: 'flex-start', marginTop: 5 },
  emptyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 13 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 5 },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 18, marginTop: 15 },
  emptyButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  list: { marginTop: 1 },
});
