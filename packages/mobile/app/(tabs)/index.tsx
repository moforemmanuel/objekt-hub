import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useObjectsStore } from '@/stores/objects';
import { objectsApi, ApiClientError } from '@/lib/api';
import type { ObjectItem } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function HomeScreen() {
  const router = useRouter();
  const { objects, pagination, isLoading, setObjects, setLoading, setError } = useObjectsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useSocket();

  const loadObjects = useCallback(
    async (page = 1, search?: string) => {
      setLoading(true);
      try {
        const response = await objectsApi.list({
          page,
          limit: 20,
          search: search || undefined,
        });
        setObjects(response.data.data, response.data.pagination);
      } catch (error) {
        if (error instanceof ApiClientError) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setObjects, setLoading, setError]
  );

  useEffect(() => {
    loadObjects(currentPage);
  }, [currentPage, loadObjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadObjects(1, searchQuery || undefined);
  }, [loadObjects, searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadObjects(1, searchQuery);
  };

  const loadMore = () => {
    if (pagination?.hasNextPage && !isLoading) {
      setCurrentPage((p) => p + 1);
    }
  };

  const renderItem = ({ item }: { item: ObjectItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/objects/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.createdBy.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardUsername}>{item.createdBy.username}</Text>
            <Text style={styles.cardDate}>{dayjs(item.createdAt).fromNow()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const objectsList = objects || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ObjektHub</Text>
        <Text style={styles.headerSubtitle}>
          {pagination ? `${pagination.total} objects` : ''}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>&#128269;</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search objects..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setCurrentPage(1);
                loadObjects(1);
              }}
            >
              <Text style={styles.clearIcon}>&#10005;</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Objects List */}
      <FlatList
        data={objectsList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>&#128230;</Text>
              <Text style={styles.emptyTitle}>No objects yet</Text>
              <Text style={styles.emptyText}>
                Tap the + button to create your first object
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && objectsList.length > 0 ? (
            <ActivityIndicator style={styles.loader} color="#0a7ea4" />
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/objects/create')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Initial loading */}
      {isLoading && objectsList.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#9ca3af',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 14,
    color: '#9ca3af',
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  cardMeta: {
    flex: 1,
  },
  cardUsername: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  cardDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  loader: {
    paddingVertical: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,249,250,0.8)',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    marginTop: -2,
  },
});
