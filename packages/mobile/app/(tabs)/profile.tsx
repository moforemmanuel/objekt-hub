import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';
import { usersApi, ApiClientError } from '@/lib/api';
import dayjs from 'dayjs';

export default function ProfileScreen() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (username.trim() === user?.username) {
      Alert.alert('Info', 'No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersApi.updateProfile({ username: username.trim() });
      if (user) {
        setAuth({ ...user, username: response.data.username }, user.id);
      }
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (typeof error.errors === 'object' && error.errors !== null) {
          const messages = Object.values(error.errors).flat();
          Alert.alert('Error', messages.join('\n'));
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => clearAuth(),
      },
    ]);
  };

  if (!user) return null;

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{user.username}</Text>
          <Text style={styles.memberSince}>
            Member since {dayjs(user.createdAt).format('MMMM D, YYYY')}
          </Text>
        </View>

        {/* Edit Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#9ca3af',
  },
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  saveButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 24,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
