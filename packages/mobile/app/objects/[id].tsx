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
import dayjs from 'dayjs';

const { width: screenWidth } = Dimensions.get('window');

export default function ObjectDetailScreen() {
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
    Alert.alert('Delete Object', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await objectsApi.delete(id!);
            Alert.alert('Deleted', 'Object has been removed', [
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (!object) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Object not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
      <Image source={{ uri: object.imageUrl }} style={styles.image} contentFit="cover" />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{object.title}</Text>

        {object.description ? (
          <Text style={styles.description}>{object.description}</Text>
        ) : null}

        {/* Creator info */}
        <View style={styles.creatorCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {object.createdBy.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{object.createdBy.username}</Text>
            <Text style={styles.createdDate}>
              {dayjs(object.createdAt).format('MMMM D, YYYY [at] h:mm A')}
            </Text>
          </View>
        </View>

        {/* Delete button (owner only) */}
        {isOwner ? (
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  notFoundText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  image: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  createdDate: {
    fontSize: 13,
    marginTop: 2,
    color: '#9ca3af',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
