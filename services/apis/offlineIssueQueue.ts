import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import api, { TokenManager } from './config';

const OFFLINE_QUEUE_KEY = '@offline_issue_queue_v1';

type QueueItemKind = 'new_issue' | 'attach_media';

interface QueuedMediaFile {
  uri: string;
  mimeType: string;
  mediaType: 'image' | 'audio' | 'video';
}

interface OfflineQueueItem {
  id: string;
  kind: QueueItemKind;
  payload: any;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

function createQueueId() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getQueue(): Promise<OfflineQueueItem[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return [];
  try {
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: OfflineQueueItem[]) {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

async function uploadMediaFromLocal(mediaFiles: QueuedMediaFile[]) {
  if (!mediaFiles.length) return [];

  const files: Array<{ data: string; mimeType: string; mediaType: 'image' | 'audio' | 'video' }> = [];
  for (const media of mediaFiles) {
    const base64 = await FileSystem.readAsStringAsync(media.uri, { encoding: 'base64' });
    files.push({ data: base64, mimeType: media.mimeType, mediaType: media.mediaType });
  }

  const uploadResponse = await api.post('/issues/upload', {
    images: files.map((file) => ({ data: file.data, mimeType: file.mimeType })),
  });

  const uploaded = uploadResponse?.data?.data?.images || [];
  return uploaded.map((item: any, index: number) => ({
    ...item,
    mediaType: files[index]?.mediaType || item.mediaType || 'image',
  }));
}

async function processNewIssue(item: OfflineQueueItem) {
  const payload = item.payload || {};
  const mediaFiles = Array.isArray(payload.localMediaFiles) ? payload.localMediaFiles : [];

  const issuePayload = { ...payload };
  delete issuePayload.localMediaFiles;

  // If local media was queued with the draft, upload first.
  if (mediaFiles.length) {
    const uploadedMedia = await uploadMediaFromLocal(mediaFiles);
    issuePayload.media = uploadedMedia;
  }

  await api.post('/issues', issuePayload);
}

async function processMediaAttachment(item: OfflineQueueItem) {
  const issueId = item.payload?.issueId;
  const mediaFiles = item.payload?.mediaFiles as QueuedMediaFile[] | undefined;

  if (!issueId || !mediaFiles?.length) return;

  const uploadedMedia = await uploadMediaFromLocal(mediaFiles);
  await api.patch(`/issues/${issueId}`, { media: uploadedMedia });
}

async function processQueueItem(item: OfflineQueueItem) {
  if (item.kind === 'new_issue') {
    await processNewIssue(item);
    return;
  }

  if (item.kind === 'attach_media') {
    await processMediaAttachment(item);
  }
}

export async function enqueueOfflineIssue(payload: any) {
  const queue = await getQueue();
  queue.push({
    id: createQueueId(),
    kind: 'new_issue',
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  await saveQueue(queue);
}

export async function enqueueOfflineMediaAttachment(issueId: string, mediaFiles: QueuedMediaFile[]) {
  const queue = await getQueue();
  queue.push({
    id: createQueueId(),
    kind: 'attach_media',
    payload: { issueId, mediaFiles },
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  await saveQueue(queue);
}

export async function getOfflineQueueCount() {
  const queue = await getQueue();
  return queue.length;
}

export async function syncOfflineIssueQueue() {
  const user = await TokenManager.getUserData();
  const token = await TokenManager.getAccessToken();
  if (!user || !token) {
    return { synced: 0, failed: 0, remaining: await getOfflineQueueCount() };
  }

  const queue = await getQueue();
  if (!queue.length) return { synced: 0, failed: 0, remaining: 0 };

  const remaining: OfflineQueueItem[] = [];
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await processQueueItem(item);
      synced += 1;
    } catch (error: any) {
      failed += 1;
      remaining.push({
        ...item,
        attempts: (item.attempts || 0) + 1,
        lastError: error?.response?.data?.error || error?.message || 'Sync failed',
      });
    }
  }

  await saveQueue(remaining);
  return { synced, failed, remaining: remaining.length };
}
