import { get, set, update, del } from 'idb-keyval';

// Key prefixes
const CHATS_PREFIX = 'ic_messages_';
const PENDING_PREFIX = 'ic_pending_';
const ROOMS_LIST_KEY = 'ic_rooms_list';

// --- Cached Messages (Read-only offline view) ---
export async function cacheMessages(roomId, messages) {
  try {
    await set(`${CHATS_PREFIX}${roomId}`, messages);
  } catch (err) {
    console.error("Failed to cache messages", err);
  }
}

export async function getCachedMessages(roomId) {
  try {
    return await get(`${CHATS_PREFIX}${roomId}`) || [];
  } catch {
    return [];
  }
}

// --- Pending Messages (Queue to send when online) ---
export async function queuePendingMessage(roomId, message) {
  try {
    await update(`${PENDING_PREFIX}${roomId}`, (val) => {
      const queue = val || [];
      return [...queue, message];
    });
  } catch (err) {
    console.error("Failed to queue message", err);
  }
}

export async function getPendingMessages(roomId) {
  try {
    return await get(`${PENDING_PREFIX}${roomId}`) || [];
  } catch {
    return [];
  }
}

export async function removePendingMessage(roomId, localId) {
  try {
    await update(`${PENDING_PREFIX}${roomId}`, (val) => {
      const queue = val || [];
      return queue.filter(m => m.localId !== localId);
    });
  } catch (err) {
    console.error("Failed to remove pending message", err);
  }
}

export async function getAllPendingQueues() {
  try {
    // This is a naive way since idb-keyval doesn't easily expose 'keys' without a custom store.
    // To keep it simple, we just export what we need per room, but the flush queue will be handled
    // on a per-room basis when a user opens the room, OR globally if we track pending rooms.
    return []; // For now, we flush per-room when ChatWindow mounts.
  } catch {
    return [];
  }
}

// --- Cached Sidebar Room List ---
export async function cacheRoomList(rooms) {
  try {
    await set(ROOMS_LIST_KEY, rooms);
  } catch (err) {
    console.error("Failed to cache room list", err);
  }
}

export async function getCachedRoomList() {
  try {
    return await get(ROOMS_LIST_KEY) || [];
  } catch {
    return [];
  }
}
