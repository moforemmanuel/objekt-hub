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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#fff',
          borderColor: colorScheme === 'dark' ? '#2e3032' : '#e5e7eb',
        },
      ]}
      onPress={() => router.push(`/objects/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[styles.cardDescription, { color: colors.icon }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {item.createdBy.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={[styles.cardUsername, { color: colors.icon }]}>
              {item.createdBy.username}
            </Text>
            <Text style={[styles.cardDate, { color: colors.icon }]}>
              {dayjs(item.createdAt).fromNow()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const objectsList = objects || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>ObjektHub</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colors.text,
              borderColor: colors.icon,
              backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#f9fafb',
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search objects..."
          placeholderTextColor={colors.icon}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No objects found. Create one!
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && objectsList.length > 0 ? (
            <ActivityIndicator style={styles.loader} color={colors.tint} />
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/objects/create')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Initial loading */}
      {isLoading && objectsList.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
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
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    marginBottom: 8,
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
  },
  cardDate: {
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
  },
  loader: {
    paddingVertical: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    marginTop: -2,
  },
});
