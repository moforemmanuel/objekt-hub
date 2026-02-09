'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useObjectsStore } from '@/stores/objects';
import { objectsApi, ApiClientError } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function ObjectSkeleton() {
  return (
    <Card>
      <CardHeader className="p-0">
        <Skeleton className="aspect-square rounded-t-lg rounded-b-none" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { objects, pagination, isLoading, setObjects, setLoading, setError } = useObjectsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure objects is always an array (for hydration safety)
  const objectsList = objects || [];

  // Initialize Socket.IO for real-time updates
  useSocket();

  useEffect(() => {
    loadObjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadObjects = async (search?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await objectsApi.list({
        page: currentPage,
        limit: 12,
        search: search || undefined,
      });
      setObjects(response.data.data, response.data.pagination);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadObjects(searchQuery);
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Objects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ObjectSkeleton key={i} />
            ))}
          </div>
        ) : objectsList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No objects found. {isAuthenticated && 'Be the first to create one!'}
            </p>
            {isAuthenticated && (
              <Link href="/objects/create">
                <Button>Create Object</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {objectsList.map((object) => (
                <Card
                  key={object.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/objects/${object.id}`)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-800">
                      <img
                        src={object.imageUrl}
                        alt={object.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{object.title}</h3>
                    {object.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {object.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(object.createdBy.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {object.createdBy.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {dayjs(object.createdAt).fromNow()}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
