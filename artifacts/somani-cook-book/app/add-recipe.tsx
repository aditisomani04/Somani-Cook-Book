import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useRecipeBook } from '@/contexts/RecipeContext';
import { useColors } from '@/hooks/useColors';
import { RECIPE_CATEGORIES, Recipe, RecipeCategory } from '@/types/recipe';

export default function AddRecipeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveRecipe } = useRecipeBook();
  const [title, setTitle] = useState('');
  const [chef, setChef] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Mains');
  const [story, setStory] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [photoUri, setPhotoUri] = useState<string>();
  const [videoUri, setVideoUri] = useState<string>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectMedia = async (kind: 'images' | 'videos') => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo library access',
          permission.canAskAgain
            ? 'Allow access to choose a family recipe photo or video.'
            : 'Enable photo library access in Settings to attach a memory.',
          permission.canAskAgain
            ? [{ text: 'OK' }]
            : [
                { text: 'Not now', style: 'cancel' },
                { text: 'Open Settings', onPress: () => void Linking.openSettings() },
              ],
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [kind],
        allowsEditing: kind === 'images',
        videoMaxDuration: 60,
        quality: 0.82,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      if (kind === 'videos' && asset.duration && asset.duration > 60_000) {
        Alert.alert('Choose a shorter clip', 'Recipe videos can be up to one minute long.');
        return;
      }
      if (kind === 'images') setPhotoUri(asset.uri);
      else setVideoUri(asset.uri);
    } catch {
      Alert.alert('Could not open your library', 'Please try again in a moment.');
    }
  };

  const submit = async () => {
    if (!title.trim() || !chef.trim()) {
      setError('Add a recipe name and the family cook’s name to continue.');
      return;
    }
    setError('');
    setSaving(true);
    const recipe: Recipe = {
      id: `${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim(),
      chef: chef.trim(),
      category,
      story: story.trim(),
      ingredients: ingredientsText.split('\n').map((line) => line.trim()).filter(Boolean),
      steps: stepsText.split('\n').map((line) => line.trim()).filter(Boolean),
      photoUri,
      videoUri,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveRecipe(recipe);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/recipe/[id]', params: { id: recipe.id } });
    } catch {
      setError('Your recipe could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === 'web' ? Math.max(67, insets.top) + 8 : insets.top + 8,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close recipe form"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={21} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New family recipe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.form}
        contentContainerStyle={{
          paddingHorizontal: 21,
          paddingTop: 18,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 26,
        }}
        bottomOffset={24}
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Save the dish, the cook, and the memory that makes it yours.
        </Text>

        <Text style={[styles.label, { color: colors.foreground }]}>Recipe name *</Text>
        <TextInput
          testID="recipe-title-input"
          value={title}
          onChangeText={setTitle}
          placeholder="What do you call it?"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
          returnKeyType="next"
          maxLength={80}
        />

        <Text style={[styles.label, { color: colors.foreground }]}>Family cook *</Text>
        <TextInput
          testID="recipe-chef-input"
          value={chef}
          onChangeText={setChef}
          placeholder="Who makes this one?"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
          returnKeyType="next"
          maxLength={60}
        />

        <Text style={[styles.label, { color: colors.foreground }]}>A place in the book</Text>
        <View style={styles.categories}>
          {RECIPE_CATEGORIES.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCategory(item)}
                style={[
                  styles.category,
                  {
                    backgroundColor: selected ? colors.accent : colors.card,
                    borderColor: selected ? colors.accentForeground : colors.border,
                  },
                ]}
              >
                <Text style={[styles.categoryText, { color: selected ? colors.accentForeground : colors.secondaryForeground }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>The story behind it</Text>
        <TextInput
          value={story}
          onChangeText={setStory}
          placeholder="A holiday, a kitchen lesson, the way it always smells..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, styles.multiline, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>{story.length}/500</Text>

        <Text style={[styles.label, { color: colors.foreground }]}>Ingredients</Text>
        <TextInput
          value={ingredientsText}
          onChangeText={setIngredientsText}
          placeholder={'One ingredient per line\nFor example: 2 cups of rice'}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, styles.listInput, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: colors.foreground }]}>How to make it</Text>
        <TextInput
          value={stepsText}
          onChangeText={setStepsText}
          placeholder={'One step per line\nStart with the first thing you do'}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, styles.listInput, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: colors.foreground }]}>Add a family memory</Text>
        <View style={styles.mediaRow}>
          <Pressable
            accessibilityRole="button"
            testID="pick-recipe-photo"
            onPress={() => void selectMedia('images')}
            style={({ pressed }) => [
              styles.mediaButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={[styles.mediaIcon, { backgroundColor: colors.accent }]}>
                <Feather name="image" size={18} color={colors.accentForeground} />
              </View>
            )}
            <View style={styles.mediaCopy}>
              <Text style={[styles.mediaTitle, { color: colors.foreground }]}>{photoUri ? 'Photo added' : 'Add a photo'}</Text>
              <Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>{photoUri ? 'Tap to change' : 'Choose from library'}</Text>
            </View>
            <Feather name={photoUri ? 'check-circle' : 'plus'} size={17} color={colors.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            testID="pick-recipe-video"
            onPress={() => void selectMedia('videos')}
            style={({ pressed }) => [
              styles.mediaButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.mediaIcon, { backgroundColor: colors.accent }]}>
              <Feather name="video" size={18} color={colors.accentForeground} />
            </View>
            <View style={styles.mediaCopy}>
              <Text style={[styles.mediaTitle, { color: colors.foreground }]}>{videoUri ? 'Clip added' : 'Add a video'}</Text>
              <Text style={[styles.mediaHint, { color: colors.mutedForeground }]}>{videoUri ? 'Up to 1 minute' : 'A short kitchen moment'}</Text>
            </View>
            <Feather name={videoUri ? 'check-circle' : 'plus'} size={17} color={colors.primary} />
          </Pressable>
        </View>
        {videoUri ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setVideoUri(undefined)}
            style={styles.removeMedia}
          >
            <Feather name="x" size={14} color={colors.destructive} />
            <Text style={[styles.removeMediaText, { color: colors.destructive }]}>Remove video</Text>
          </Pressable>
        ) : null}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructive + '12' }]}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
          testID="save-recipe-button"
          disabled={saving}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: colors.primary },
            (pressed || saving) && styles.pressed,
          ]}
        >
          {saving ? <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Saving…</Text> : (
            <>
              <Feather name="book-open" size={17} color={colors.primaryForeground} />
              <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save to family cookbook</Text>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingBottom: 13, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 13 },
  backButton: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  headerSpacer: { width: 35 },
  form: { flex: 1 },
  intro: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginBottom: 4 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 17, marginBottom: 8 },
  input: { minHeight: 47, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 13 },
  multiline: { minHeight: 104, lineHeight: 20 },
  listInput: { minHeight: 105, lineHeight: 20 },
  helper: { textAlign: 'right', fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 5 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  category: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 17, borderWidth: 1 },
  categoryText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  mediaRow: { gap: 9 },
  mediaButton: { minHeight: 65, borderWidth: 1, borderRadius: 15, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  mediaIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  photoPreview: { width: 42, height: 42, borderRadius: 12 },
  mediaCopy: { flex: 1 },
  mediaTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  mediaHint: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  pressed: { opacity: 0.82 },
  removeMedia: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', marginTop: 8 },
  removeMediaText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  errorBox: { borderRadius: 12, padding: 11, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 15 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, flex: 1 },
  saveButton: { minHeight: 52, borderRadius: 18, marginTop: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  saveText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
