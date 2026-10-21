import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RecipeCard } from '@/components/RecipeCard';
import { useRecipeBook } from '@/contexts/RecipeContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recipes, isLoading } = useRecipeBook();
  const cooks = new Set(recipes.map((recipe) => recipe.chef.trim())).size;
  const storyCount = recipes.filter((recipe) => recipe.story.trim().length > 0).length;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: Platform.OS === 'web' ? Math.max(67, insets.top) + 16 : insets.top + 12,
        paddingBottom: Platform.OS === 'web' ? 110 : insets.bottom + 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>SOMANI FAMILY</Text>
          <Text style={[styles.topLabel, { color: colors.mutedForeground }]}>OUR COOKBOOK</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a family recipe"
          testID="home-add-recipe"
          onPress={() => router.push('/add-recipe')}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Feather name="plus" size={19} color={colors.primaryForeground} />
          <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>Add recipe</Text>
        </Pressable>
      </View>

      <View style={styles.intro}>
        <Text style={[styles.heading, { color: colors.foreground }]}>A little taste{'\n'}of home.</Text>
        <Text style={[styles.introCopy, { color: colors.mutedForeground }]}>
          Recipes, stories, and the people who make them.
        </Text>
      </View>

      <ImageBackground
        source={require('../../assets/images/dal-family-table.jpg')}
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <LinearGradient
          colors={['rgba(25, 23, 17, 0.04)', 'rgba(25, 23, 17, 0.76)']}
          style={styles.heroShade}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroPill}>
              <Feather name="book-open" size={12} color="#fffaf0" />
              <Text style={styles.heroPillText}>MADE TO BE PASSED DOWN</Text>
            </View>
            <Text style={styles.heroTitle}>Every dish has a story.</Text>
            <Text style={styles.heroCopy}>
              Keep the flavors and memories of your family in one place.
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{recipes.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>RECIPES</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{cooks}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>FAMILY COOKS</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{storyCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>STORIES</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fresh from the family</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>The newest pages in your book</Text>
        </View>
        {recipes.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/recipes')} style={styles.viewAll}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>See all</Text>
            <Feather name="arrow-right" size={15} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
      ) : recipes.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
            <Feather name="book" size={22} color={colors.accentForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Start with a favorite</Text>
          <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
            Add the first recipe, then save the story and the cook behind it.
          </Text>
          <Pressable
            accessibilityRole="button"
            testID="empty-add-recipe"
            onPress={() => router.push('/add-recipe')}
            style={({ pressed }) => [
              styles.emptyAction,
              { backgroundColor: colors.accent },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="plus" size={16} color={colors.accentForeground} />
            <Text style={[styles.emptyActionText, { color: colors.accentForeground }]}>Write the first recipe</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeRail}>
          {recipes.slice(0, 5).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              compact
              onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
            />
          ))}
        </ScrollView>
      )}

      <View style={[styles.note, { backgroundColor: colors.accent }]}>
        <Feather name="heart" size={17} color={colors.accentForeground} />
        <Text style={[styles.noteText, { color: colors.accentForeground }]}>A cookbook made by your family, for your family.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5 },
  topLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.7, marginTop: 3 },
  addButton: { minHeight: 42, paddingHorizontal: 14, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 7 },
  addButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  intro: { paddingHorizontal: 22, marginTop: 28, marginBottom: 19 },
  heading: { fontFamily: 'Georgia', fontSize: 38, lineHeight: 43, letterSpacing: -1.1 },
  introCopy: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 10, lineHeight: 21 },
  hero: { height: 224, marginHorizontal: 18, overflow: 'hidden', borderRadius: 24 },
  heroImage: { borderRadius: 24 },
  heroShade: { flex: 1, justifyContent: 'flex-end', padding: 18 },
  heroContent: { gap: 8 },
  heroPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(35, 31, 23, 0.45)' },
  heroPillText: { color: '#fffaf0', fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.1 },
  heroTitle: { color: '#fffaf0', fontFamily: 'Georgia', fontSize: 25, lineHeight: 30 },
  heroCopy: { color: '#fffaf0', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, maxWidth: 280 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 9, marginTop: 15 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 10 },
  statValue: { fontFamily: 'Georgia', fontSize: 24 },
  statLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 0.9, marginTop: 3 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, marginTop: 27, marginBottom: 14 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 20 },
  sectionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  loading: { height: 155, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { marginHorizontal: 18, borderWidth: 1, borderRadius: 22, padding: 18, alignItems: 'flex-start' },
  emptyIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 13 },
  emptyCopy: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 5, maxWidth: 270 },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, marginTop: 15 },
  emptyActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  recipeRail: { paddingHorizontal: 18, paddingBottom: 4 },
  note: { marginHorizontal: 18, marginTop: 22, borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noteText: { fontFamily: 'Inter_500Medium', fontSize: 12, flexShrink: 1 },
});
