import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

export function RecipeCard({
  recipe,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  compact = false,
}: RecipeCardProps) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${recipe.title}, by ${recipe.chef}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageFrame, compact && styles.compactImageFrame]}>
        {recipe.photoUri ? (
          <Image source={{ uri: recipe.photoUri }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.accent }]}>
            <Feather name="coffee" size={25} color={colors.accentForeground} />
          </View>
        )}
        <View style={[styles.categoryTag, { backgroundColor: colors.background }]}>
          <Text style={[styles.categoryText, { color: colors.secondaryForeground }]}>
            {recipe.category}
          </Text>
        </View>
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {recipe.title}
          </Text>
          {onToggleFavorite ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onPress={(event) => {
                event.stopPropagation();
                onToggleFavorite();
              }}
              hitSlop={10}
              style={styles.favoriteButton}
            >
              <Feather
                name="heart"
                size={18}
                color={isFavorite ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.byline, { color: colors.mutedForeground }]}>
          By {recipe.chef}
        </Text>
        {recipe.story ? (
          <Text style={[styles.story, { color: colors.secondaryForeground }]} numberOfLines={2}>
            {recipe.story}
          </Text>
        ) : null}
        {recipe.videoUri ? (
          <View style={styles.videoLabel}>
            <Feather name="video" size={13} color={colors.primary} />
            <Text style={[styles.videoText, { color: colors.primary }]}>Video memory</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  compactCard: {
    width: 244,
    marginRight: 12,
    marginBottom: 0,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageFrame: {
    height: 188,
    position: 'relative',
  },
  compactImageFrame: {
    height: 144,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  copy: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    lineHeight: 23,
    flex: 1,
  },
  favoriteButton: {
    padding: 2,
  },
  byline: {
    fontSize: 13,
    marginTop: 5,
    fontFamily: 'Inter_500Medium',
  },
  story: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
  videoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  videoText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
