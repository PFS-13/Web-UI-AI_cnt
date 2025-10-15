/**
 * Path Traversal Utility
 * Implementasi logika backend untuk menghitung paths di frontend
 * Menggunakan data yang sudah ada dari backend API
 */

export interface ChainData {
  currentIndex: number;
  totalChains: number;
}

/**
 * Menghitung total paths yang mengandung message tertentu
 * @param messageId ID message yang dicari
 * @param allPaths Array of arrays berisi semua paths
 * @returns Array of paths yang mengandung message tersebut
 */
export function getPathsContainingMessage(
  messageId: number, 
  allPaths: number[][]
): number[][] {
  return allPaths.filter(path => path.includes(messageId));
}

/**
 * Menentukan current path index berdasarkan currentPath
 * @param currentPath Path yang sedang aktif
 * @param pathsContainingMessage Array of paths yang mengandung message
 * @returns Index path yang sedang aktif (1-based)
 */
export function getCurrentPathIndex(
  currentPath: number[],
  pathsContainingMessage: number[][]
): number {
  // Cari path yang match dengan currentPath
  const currentPathIndex = pathsContainingMessage.findIndex(path => {
    // Bandingkan panjang dan isi array
    if (path.length !== currentPath.length) return false;
    return path.every((id, index) => id === currentPath[index]);
  });

  // Return 1-based index (0-based + 1)
  return currentPathIndex !== -1 ? currentPathIndex + 1 : 1;
}

/**
 * Mencari semua messages dalam chain edit
 * @param messageId ID message yang dicari
 * @param allMessages Array semua messages
 * @returns Array berisi semua message IDs dalam chain edit
 */
export function findEditChain(
  messageId: number,
  allMessages: Array<{
    id?: number;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>
): number[] {
  const chain: number[] = [];
  const visited = new Set<number>();
  
  // Fungsi rekursif untuk mencari chain
  function traverseChain(currentId: number) {
    if (visited.has(currentId)) return; // Prevent infinite loop
    visited.add(currentId);
    chain.push(currentId);
    
    // Cari messages yang diedit dari currentId
    const editedMessages = allMessages.filter(msg => 
      msg.edited_from_message_id === currentId && msg.id
    );
    
    // Traverse setiap edited message
    editedMessages.forEach(msg => {
      if (msg.id) {
        traverseChain(msg.id);
      }
    });
  }
  
  // Mulai dari messageId
  traverseChain(messageId);
  
  // Juga cari ke atas (original message)
  const currentMessage = allMessages.find(msg => msg.id === messageId);
  if (currentMessage?.edited_from_message_id) {
    traverseChain(currentMessage.edited_from_message_id);
  }
  
  return chain;
}

/**
 * Menghitung chain data untuk message tertentu dengan dukungan chain editing
 * @param messageId ID message
 * @param isEdited Apakah message diedit
 * @param editedFromMessageId ID message original (jika ada)
 * @param allPaths Array of arrays berisi semua paths
 * @param currentPath Path yang sedang aktif
 * @param allMessages Array semua messages untuk chain detection
 * @returns Chain data atau null jika tidak ada chains
 */
export function calculateChainData(
  messageId: number,
  isEdited: boolean,
  editedFromMessageId: number | undefined,
  allPaths: number[][],
  currentPath: number[]
): ChainData | null {
  // Hanya untuk message yang diedit atau memiliki edited_from_message_id
  if (!isEdited && !editedFromMessageId) {
    return null;
  }

  // Cari semua paths yang mengandung message ini
  const pathsContainingMessage = getPathsContainingMessage(messageId, allPaths);

  // Jika tidak ada paths yang mengandung message ini, skip
  if (pathsContainingMessage.length === 0) {
    return null;
  }

  // ENHANCED LOGIC: SELALU gunakan total paths conversation untuk totalChains
  let totalChains = allPaths.length; // SELALU gunakan total paths conversation
  let currentIndex = 1; // Default: path pertama
  
  // Tentukan current index berdasarkan currentPath di allPaths
  const currentPathIndex = allPaths.findIndex(path => {
    if (path.length !== currentPath.length) return false;
    return path.every((id, index) => id === currentPath[index]);
  });
  
  currentIndex = currentPathIndex !== -1 ? currentPathIndex + 1 : 1;
  
  // Chain edit logic removed as it's not used

  const result = {
    currentIndex,
    totalChains
  };

  return result;
}

/**
 * Batch calculate chain data untuk semua messages dengan dukungan chain editing
 * @param messages Array of messages dengan format ChatMessage
 * @param allPaths Array of arrays berisi semua paths dari backend
 * @param currentPath Path yang sedang aktif
 * @returns Map dengan key messageId dan value ChainData
 */
export function calculateAllChainData(
  messages: Array<{
    id?: number;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>,
  allPaths: number[][],
  currentPath: number[]
): Map<number, ChainData> {
  const chainDataMap = new Map<number, ChainData>();

  // Hitung chain data untuk setiap message dengan dukungan chain editing
  messages.forEach(message => {
    if (message.id) {
      const chainData = calculateChainData(
        message.id,
        message.is_edited || false,
        message.edited_from_message_id,
        allPaths,
        currentPath
      );
      
      if (chainData) {
        chainDataMap.set(message.id, chainData);
      }
    }
  });

  return chainDataMap;
}

/**
 * Debug helper untuk logging path information
 * @param messageId ID message
 * @param allPaths Array of arrays berisi semua paths
 * @param currentPath Path yang sedang aktif
 */
export function debugPathInfo(
  messageId: number,
  allPaths: number[][],
  currentPath: number[]
): void {
  const pathsContainingMessage = getPathsContainingMessage(messageId, allPaths);
  getCurrentPathIndex(currentPath, pathsContainingMessage);
}

/**
 * Utility untuk memformat chain data menjadi object
 * @param chainDataMap Map dari calculateAllChainData
 * @returns Object dengan key messageId dan value ChainData
 */
export function formatChainDataToObject(
  chainDataMap: Map<number, ChainData>
): Record<number, ChainData> {
  const result: Record<number, ChainData> = {};
  chainDataMap.forEach((chainData, messageId) => {
    result[messageId] = chainData;
  });
  return result;
}

/**
 * Mencari message dalam chain edit untuk navigation
 * @param messageId ID message yang sedang aktif
 * @param direction 'next' atau 'prev'
 * @param allMessages Array semua messages
 * @returns ID message target untuk navigation, atau null jika tidak ada
 */
export function findChainNavigationTarget(
  messageId: number,
  direction: 'next' | 'prev',
  allMessages: Array<{
    id?: number;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>
): number | null {
  const editChain = findEditChain(messageId, allMessages);
  const currentIndex = editChain.indexOf(messageId);
  
  if (currentIndex === -1) return null;
  
  if (direction === 'next') {
    // Cari message selanjutnya dalam chain
    return currentIndex < editChain.length - 1 ? editChain[currentIndex + 1] : null;
  } else {
    // Cari message sebelumnya dalam chain
    return currentIndex > 0 ? editChain[currentIndex - 1] : null;
  }
}

/**
 * Mencari original message dalam chain edit
 * @param messageId ID message yang sedang aktif
 * @param allMessages Array semua messages
 * @returns ID original message, atau messageId jika tidak ada chain
 */
export function findOriginalMessageInChain(
  messageId: number,
  allMessages: Array<{
    id?: number;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>
): number {
  const editChain = findEditChain(messageId, allMessages);
  
  // Cari message yang tidak memiliki edited_from_message_id (original)
  for (const chainId of editChain) {
    const message = allMessages.find(msg => msg.id === chainId);
    if (message && !message.edited_from_message_id) {
      return chainId;
    }
  }
  
  // Fallback ke messageId jika tidak ditemukan original
  return messageId;
}

/**
 * Mencari message terakhir dalam chain edit (untuk edit handler)
 * @param messageId ID message yang sedang diedit
 * @param allMessages Array semua messages
 * @returns ID message terakhir dalam chain
 */
export function findLatestMessageInChain(
  messageId: number,
  allMessages: Array<{
    id?: number;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>
): number {
  // Cari message terakhir dengan iterasi rekursif
  let latestMessageId = messageId;
  let foundNewer = true;
  let iteration = 0;
  
  // Iterasi sampai tidak ada message yang diedit dari latestMessageId
  while (foundNewer && iteration < 10) { // Prevent infinite loop
    iteration++;
    foundNewer = false;
    
    const editedFromLatest = allMessages.find(msg => 
      msg.edited_from_message_id === latestMessageId && msg.id
    );
    
    if (editedFromLatest && editedFromLatest.id) {
      latestMessageId = editedFromLatest.id;
      foundNewer = true;
    }
  }
  
  // FALLBACK: Jika tidak ada chain, cari message dengan ID tertinggi yang memiliki edited_from_message_id
  if (latestMessageId === messageId) {
    // Cari semua messages yang memiliki edited_from_message_id
    const messagesWithEditedFrom = allMessages.filter(msg => 
      msg.id && msg.edited_from_message_id
    );
    
    if (messagesWithEditedFrom.length > 0) {
      // Cari message dengan ID tertinggi
      const highestIdMessage = messagesWithEditedFrom.reduce((max, current) => 
        (current.id && max.id && current.id > max.id) ? current : max
      );
      
      if (highestIdMessage.id && highestIdMessage.id > messageId) {
        latestMessageId = highestIdMessage.id;
      }
    }
  }
  
  return latestMessageId;
}
