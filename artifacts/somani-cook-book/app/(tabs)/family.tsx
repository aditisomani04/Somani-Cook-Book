import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipeBook } from '@/contexts/RecipeContext';
import { useColors } from '@/hooks/useColors';

const AVATAR_COLORS = ['#d9e0cc', '#ead9c8', '#e8d9a9', '#d4e4df', '#ead2d0'];

export default function FamilyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recipes } = useRecipeBook();
  const contributors = useMemo(() => {
    const counts = new Map<string, number>();
    recipes.forEach((recipe) => {
      const name = recipe.chef.trim();
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [recipes]);
  const videoCount = recipes.filter((recipe) => recipe.videoUri).length;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: Platform.OS === 'web' ? Math.max(67, insets.top) + 16 : insets.top + 12,
        paddingBottom: Platform.OS === 'web' ? 110 : insets.bottom + 110,
        paddingHorizontal: 22,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.kicker, { color: colors.primary }]}>THE PEOPLE BEHIND THE PLATES</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Family cooks</Text>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Every recipe carries a little piece of the person who made it.
      </Text>

      <View style={[styles.familyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.familyIcon, { backgroundColor: colors.accent }]}>
          <Feather name="users" size={21} color={colors.accentForeground} />
        </View>
        <View style={styles.familyCopy}>
          <Text style={[styles.familyTitle, { color: colors.foreground }]}>Somani family table</Text>
          <Text style={[styles.familySub, { color: colors.mutedForeground }]}>
            {contributors.length} {contributors.length === 1 ? 'contributor' : 'contributors'} · {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>
        <Feather name="heart" size={17} color={colors.primary} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contributors</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{contributors.length}</Text>
      </View>

      {contributors.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
            <Feather name="user-plus" size={21} color={colors.accentForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>The first cook is you</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Add a recipe with the chef’s name to begin the family contributor list.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/add-recipe')}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Add a family recipe</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.contributorList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {contributors.map(([name, count], index) => (
            <View
              key={name}
              style={[
                styles.contributor,
                index < contributors.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                <Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>
                  {name.trim().slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contributorInfo}>
                <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
                <Text style={[styles.contributorSub, { color: colors.mutedForeground }]}>
                  {count} {count === 1 ? 'recipe' : 'recipes'}
                </Text>
              </View>
              <Feather name="book-open" size={17} color={colors.mutedForeground} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Little memories</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{videoCount}</Text>
      </View>
      <View style={[styles.memoryCard, { backgroundColor: colors.accent }]}>
        <Feather name="video" size={19} color={colors.accentForeground} />
        <View style={styles.memoryCopy}>
          <Text style={[styles.memoryTitle, { color: colors.accentForeground }]}>
            {videoCount > 0 ? `${videoCount} recipe ${videoCount === 1 ? 'clip' : 'clips'}` : 'Keep a kitchen moment'}
          </Text>
          <Text style={[styles.memorySub, { color: colors.accentForeground }]}>
            Add a short video when you write a recipe.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a recipe with a video"
          onPress={() => router.push('/add-recipe')}
          hitSlop={8}
        >
          <Feather name="arrow-right" size={18} color={colors.accentForeground} />
        </Pressable>
      </View>
      <Text style={[styles.localNote, { color: colors.mutedForeground }]}>
        Recipes are saved on this device. Family members using other devices won’t see these entries until shared syncing is added.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.25 },
  title: { fontFamily: 'Georgia', fontSize: 34, marginTop: 8 },
  intro: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 320 },
  familyCard: { marginTop: 22, padding: 15, borderWidth: 1, borderRadius: 19, flexDirection: 'row', alignItems: 'center', gap: 12 },
  familyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  familyCopy: { flex: 1 },
  familyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  familySub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28, marginBottom: 11 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 20 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  empty: { padding: 17, borderRadius: 20, borderWidth: 1, alignItems: 'flex-start' },
  emptyIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 12 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 280 },
  addButton: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 18 },
  addButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pressed: { opacity: 0.85 },
  contributorList: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15 },
  contributor: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Georgia', fontSize: 18 },
  contributorInfo: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  contributorSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  memoryCard: { padding: 15, borderRadius: 19, flexDirection: 'row', alignItems: 'center', gap: 12 },
  memoryCopy: { flex: 1 },
  memoryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  memorySub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  localNote: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16, marginTop: 18, paddingHorizontal: 2 },
});
