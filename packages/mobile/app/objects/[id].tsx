import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { objectsApi, ApiClientError } from '@/lib/api';
import type { ObjectItem } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import dayjs from 'dayjs';

const { width: screenWidth } = Dimensions.get('window');

export default function ObjectDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [object, setObject] = useState<ObjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) loadObject();
  }, [id]);

  const loadObject = async () => {
    setIsLoading(true);
    try {
      const response = await objectsApi.get(id!);
      setObject(response.data);
    } catch (error) {
      if (error instanceof ApiClientError) {
        Alert.alert('Error', error.message, [{ text: 'OK', onPress: () => router.back() }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Object', 'Are you sure you want to delete this object?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await objectsApi.delete(id!);
            Alert.alert('Success', 'Object deleted', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (error) {
            if (error instanceof ApiClientError) {
              Alert.alert('Error', error.message);
            }
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const isOwner = user && object && user.id === object.createdBy.id;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!object) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.icon }}>Object not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Image */}
      <Image source={{ uri: object.imageUrl }} style={styles.image} contentFit="cover" />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{object.title}</Text>

        {object.description ? (
          <Text style={[styles.description, { color: colors.icon }]}>{object.description}</Text>
        ) : null}

        {/* Creator info */}
        <View
          style={[
            styles.creatorCard,
            {
              backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#f9fafb',
              borderColor: colorScheme === 'dark' ? '#2e3032' : '#e5e7eb',
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {object.createdBy.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.creatorName, { color: colors.text }]}>
              {object.createdBy.username}
            </Text>
            <Text style={[styles.createdDate, { color: colors.icon }]}>
              {dayjs(object.createdAt).format('MMMM D, YYYY [at] h:mm A')}
            </Text>
          </View>
        </View>

        {/* Delete button (owner only) */}
        {isOwner ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Object</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  createdDate: {
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
