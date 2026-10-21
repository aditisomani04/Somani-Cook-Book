import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipeBook } from '@/contexts/RecipeContext';
import { useColors } from '@/hooks/useColors';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recipes, favorites, toggleFavorite, deleteRecipe } = useRecipeBook();
  const recipe = useMemo(() => recipes.find((item) => item.id === id), [recipes, id]);
  const player = useVideoPlayer(recipe?.videoUri ?? null, (instance) => {
    instance.loop = false;
  });

  const confirmDelete = () => {
    const remove = () => {
      void deleteRecipe(id).then(() => router.replace('/recipes'));
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Remove this recipe from the family book?')) remove();
      return;
    }
    Alert.alert('Remove recipe?', 'This will remove the recipe from this device.', [
      { text: 'Keep recipe', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  };

  if (!recipe) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="book-open" size={27} color={colors.mutedForeground} />
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Recipe not found</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/recipes')}>
          <Text style={[styles.backToBook, { color: colors.primary }]}>Back to recipes</Text>
        </Pressable>
      </View>
    );
  }

  const isFavorite = favorites.includes(recipe.id);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cover}>
          {recipe.photoUri ? (
            <Image source={{ uri: recipe.photoUri }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.accent }]}>
              <Feather name="coffee" size={40} color={colors.accentForeground} />
            </View>
          )}
          <View
            style={[
              styles.coverToolbar,
              { top: Platform.OS === 'web' ? Math.max(67, insets.top) + 8 : insets.top + 8 },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={[styles.toolbarButton, { backgroundColor: colors.card }]}
            >
              <Feather name="arrow-left" size={19} color={colors.foreground} />
            </Pressable>
            <View style={styles.toolbarActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                onPress={() => void toggleFavorite(recipe.id)}
                style={[styles.toolbarButton, { backgroundColor: colors.card }]}
              >
                <Feather name="heart" size={18} color={isFavorite ? colors.primary : colors.foreground} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete recipe"
                onPress={confirmDelete}
                style={[styles.toolbarButton, { backgroundColor: colors.card }]}
              >
                <Feather name="trash-2" size={17} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.category, { backgroundColor: colors.accent }]}>
            <Text style={[styles.categoryText, { color: colors.accentForeground }]}>{recipe.category}</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{recipe.title}</Text>
          <View style={styles.byline}>
            <View style={[styles.chefDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.chefText, { color: colors.secondaryForeground }]}>Made with love by {recipe.chef}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            Added {new Date(recipe.createdAt).toLocaleDateString()}
          </Text>

          {recipe.story ? (
            <View style={[styles.storyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="message-circle" size={17} color={colors.primary} />
              <View style={styles.storyContent}>
                <Text style={[styles.storyLabel, { color: colors.primary }]}>THE STORY</Text>
                <Text style={[styles.storyText, { color: colors.foreground }]}>{recipe.story}</Text>
              </View>
            </View>
          ) : null}

          {recipe.videoUri ? (
            <View style={styles.videoSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>A kitchen moment</Text>
              <VideoView
                player={player}
                style={styles.video}
                nativeControls
                contentFit="contain"
              />
            </View>
          ) : null}

          {recipe.ingredients.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What goes in</Text>
              <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={`${ingredient}-${index}`} style={styles.listRow}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.listText, { color: colors.secondaryForeground }]}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {recipe.steps.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>The way we make it</Text>
              {recipe.steps.map((step, index) => (
                <View key={`${step}-${index}`} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.stepNumberText, { color: colors.accentForeground }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.secondaryForeground }]}>{step}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  cover: { height: 290, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverToolbar: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' },
  toolbarActions: { flexDirection: 'row', gap: 9 },
  toolbarButton: { width: 40, height: 40, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 21, paddingTop: 20 },
  category: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 15 },
  categoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.4 },
  title: { fontFamily: 'Georgia', fontSize: 32, lineHeight: 39, marginTop: 12 },
  byline: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  chefDot: { width: 8, height: 8, borderRadius: 4 },
  chefText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 7 },
  storyCard: { borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: 'row', gap: 10, marginTop: 22 },
  storyContent: { flex: 1 },
  storyLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  storyText: { fontFamily: 'Georgia', fontSize: 16, lineHeight: 23, marginTop: 8 },
  section: { marginTop: 24 },
  videoSection: { marginTop: 24 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 21, marginBottom: 12 },
  video: { width: '100%', height: 225, borderRadius: 17, overflow: 'hidden' },
  listCard: { borderWidth: 1, borderRadius: 17, paddingHorizontal: 15, paddingVertical: 8 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 39 },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  listText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, marginBottom: 15 },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  stepText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, flex: 1, paddingTop: 3 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 11 },
  notFoundTitle: { fontFamily: 'Georgia', fontSize: 23 },
  backToBook: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 3 },
});
