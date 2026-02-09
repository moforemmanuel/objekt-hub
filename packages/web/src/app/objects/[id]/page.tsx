'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { objectsApi, ApiClientError, type ObjectItem } from '@/lib/api';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function ObjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [object, setObject] = useState<ObjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const objectId = params.id as string;

  useEffect(() => {
    loadObject();
  }, [objectId]);

  const loadObject = async () => {
    setIsLoading(true);

    try {
      const response = await objectsApi.get(objectId);
      setObject(response.data);
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await objectsApi.delete(objectId);
      toast.success('Object deleted successfully');
      router.push('/');
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      }
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const isOwner = user && object && user.id === object.createdBy.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isLoading ? (
          <Card>
            <CardHeader className="p-0">
              <Skeleton className="aspect-video w-full rounded-t-lg rounded-b-none" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-3 pt-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : object ? (
          <Card className="pt-0 gap-2">
            <CardHeader className="p-0">
              <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-800">
                <img
                  src={object.imageUrl}
                  alt={object.title}
                  className="object-contain w-full h-full"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold">{object.title}</h1>
                {isOwner && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {object.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                  {object.description}
                </p>
              )}

              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{getInitials(object.createdBy.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{object.createdBy.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dayjs(object.createdAt).format('MMMM D, YYYY')} •{' '}
                    {dayjs(object.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Object</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this object? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
