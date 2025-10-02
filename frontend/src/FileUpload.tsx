import React, { useEffect, useRef, useState } from 'react';

type UploadResult = {
  ok: boolean;
  file?: any;
  db?: any;
  url?: string;
  message?: string;
};

type Props = {
  /** id message yang akan dikaitkan dengan attachment */
  messageId: number;
  /** full url or relative endpoint. Default: '/attachments/upload' */
  uploadUrl?: string;
  /** optional bearer token (jika auth diperlukan) */
  authToken?: string | null;
  /** accepted mime/file extensions (comma separated for input accept) */
  accept?: string;
  /** max size in bytes (default 10MB) */
  maxSize?: number;
  /** callback setelah upload sukses */
  onUploaded?: (result: UploadResult) => void;
};

export default function FileUpload({
  messageId,
  uploadUrl = 'http://localhost:3001/attachments/upload',
  authToken = null,
  accept = '.png,.jpg,.jpeg,.gif,.pdf,.docx,.xlsx,.txt',
  maxSize = 10 * 1024 * 1024,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  function validateFile(f: File) {
    if (f.size > maxSize) return `Ukuran file terlalu besar (max ${Math.round(maxSize / 1024 / 1024)} MB)`;

    if (!accept) return null;
    const lower = accept.toLowerCase();
    const extList = lower.split(',').map((s) => s.trim()).filter(Boolean);
    const matches = extList.some((a) => {
      if (a.startsWith('.')) {
        return f.name.toLowerCase().endsWith(a);
      }
      // mime check
      return f.type === a;
    });
    if (!matches) return `Tipe file tidak diizinkan: ${f.name}`;
    return null;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }

    const v = validateFile(f);
    if (v) {
      setError(v);
      setFile(null);
      return;
    }

    setFile(f);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (!f) return;
    const v = validateFile(f);
    if (v) {
      setError(v);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  // menggunakan XHR agar bisa menampilkan progress upload
  async function uploadWithProgress(f: File): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', f);
      form.append('message_id', String(messageId));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      // jangan set Content-Type untuk FormData
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const p = Math.round((event.loaded / event.total) * 100);
          setProgress(p);
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        const text = xhr.responseText || '';

        // coba parse json, fallback ke pesan teks
        let parsed: any = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch (e) {
          // bukan json
          parsed = { message: text || xhr.statusText };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          // Asumsi backend mengembalikan { ok: true, db, file, url }
          resolve({ ok: true, ...parsed });
        } else {
          // berikan message yang berguna
          const msg = parsed?.message ?? `HTTP ${xhr.status} ${xhr.statusText}`;
          resolve({ ok: false, message: msg });
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  }

  async function handleUpload(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setStatus('');
    setProgress(0);

    if (!file) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    setStatus('Uploading...');
    try {
      const res = await uploadWithProgress(file);
      if (res.ok) {
        setStatus('Upload berhasil');
        setFile(null);
        setProgress(100);
        // panggil callback dengan object hasil penuh
        if (onUploaded) onUploaded(res);
      } else {
        setError(res.message ?? 'Upload gagal');
        setStatus('Upload gagal');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Terjadi kesalahan saat upload');
      setStatus('Upload error');
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleUpload} className="space-y-3">
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            aria-label="File to upload"
          />

          <div className="text-sm text-center">
            <div className="font-medium">Drag & drop file di sini</div>
            <div className="text-xs text-gray-500">atau klik untuk memilih (max {Math.round(maxSize / 1024 / 1024)} MB)</div>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 px-3 py-1 rounded bg-slate-800 text-white text-sm shadow-sm hover:opacity-90"
              >
                Pilih file
              </button>
            </div>
          </div>
        </label>

        {previewUrl && (
          <div className="flex items-center space-x-3">
            <img src={previewUrl} alt="preview" className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium truncate">{file?.name}</div>
              <div className="text-xs text-gray-500">{file?.type} • {Math.round((file?.size ?? 0) / 1024)} KB</div>
            </div>
            <button type="button" onClick={() => setFile(null)} className="text-sm text-red-600">Hapus</button>
          </div>
        )}

        {!previewUrl && file && (
          <div className="p-3 border rounded text-sm flex items-center justify-between">
            <div className="truncate">{file.name}</div>
            <div className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</div>
          </div>
        )}

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
            <div className="h-2 rounded" style={{ width: `${progress}%`, backgroundColor: undefined }} />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={!file}
          >
            Upload
          </button>

          <button
            type="button"
            onClick={() => { setFile(null); setError(null); setStatus(''); setProgress(0); }}
            className="px-3 py-2 rounded border text-sm"
          >
            Reset
          </button>

          <div className="ml-auto text-sm text-gray-600">{status}</div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>
    </div>
  );
}
