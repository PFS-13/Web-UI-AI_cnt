# Path Traversal Utility

## Overview

Utility ini mengimplementasikan logika backend untuk menghitung paths di frontend, memungkinkan sistem untuk menentukan:
- **Total jumlah paths** yang ada dalam conversation
- **Posisi current path** (path mana yang sedang aktif)
- **Chain data** untuk setiap message (A/B format)

## Implementasi

### 1. Core Functions

#### `getPathsContainingMessage(messageId, allPaths)`
- **Purpose**: Mencari semua paths yang mengandung message tertentu
- **Input**: 
  - `messageId`: ID message yang dicari
  - `allPaths`: Array of arrays berisi semua paths
- **Output**: Array of paths yang mengandung message tersebut

#### `getCurrentPathIndex(currentPath, pathsContainingMessage)`
- **Purpose**: Menentukan index path yang sedang aktif
- **Input**:
  - `currentPath`: Path yang sedang aktif
  - `pathsContainingMessage`: Array of paths yang mengandung message
- **Output**: Index path (1-based)

#### `calculateChainData(messageId, isEdited, editedFromMessageId, allPaths, currentPath)`
- **Purpose**: Menghitung chain data untuk message tertentu
- **Input**: Semua parameter yang diperlukan
- **Output**: `ChainData` object atau `null`

#### `calculateAllChainData(messages, allPaths, currentPath)`
- **Purpose**: Batch calculate chain data untuk semua messages
- **Input**: Array messages, allPaths, currentPath
- **Output**: Map dengan key messageId dan value ChainData

### 2. Helper Functions

#### `formatChainDataToObject(chainDataMap)`
- **Purpose**: Convert Map ke Object untuk state management
- **Input**: Map dari calculateAllChainData
- **Output**: Object dengan key messageId

#### `debugPathInfo(messageId, allPaths, currentPath)`
- **Purpose**: Debug helper untuk logging path information
- **Input**: messageId, allPaths, currentPath
- **Output**: Console log dengan detail path info

## Usage Example

```typescript
import { 
  calculateAllChainData, 
  formatChainDataToObject,
  debugPathInfo
} from '../../utils/pathTraversal';

// Di MessageList.tsx
const allPaths = await messageAPI.getPathMessages(conversationId);
const chainDataMap = calculateAllChainData(messages, allPaths, currentPath);
const chainData = formatChainDataToObject(chainDataMap);

// Update state
setChainData(chainData);
```

## Alur Kerja

1. **Load Data**: Ambil semua paths dari backend API
2. **Process Messages**: Untuk setiap message yang diedit, cari paths yang mengandungnya
3. **Calculate Index**: Tentukan posisi current path dalam paths yang mengandung message
4. **Format Result**: Convert ke format yang bisa digunakan oleh UI
5. **Update State**: Update chainData state untuk rendering

## Performance

- **Efficient**: Menggunakan data yang sudah ada dari backend
- **Batch Processing**: Menghitung semua chain data sekaligus
- **Memoization Ready**: Bisa di-memoize untuk performa lebih baik
- **Debug Friendly**: Logging yang komprehensif untuk troubleshooting

## Integration

Utility ini terintegrasi dengan:
- `MessageList.tsx`: Untuk menghitung chain data
- `ChainMessageControls.tsx`: Untuk menampilkan A/B format
- `useChat.ts`: Untuk path management
- Backend API: Untuk mendapatkan path data

## Benefits

1. **Frontend Calculation**: Tidak perlu hit backend berulang kali
2. **Real-time Updates**: Chain data update otomatis ketika path berubah
3. **Accurate Indexing**: Menentukan posisi current path dengan tepat
4. **Scalable**: Bisa handle conversation dengan banyak paths
5. **Maintainable**: Code yang clean dan well-documented
