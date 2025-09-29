import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Updated ChatbotPage: switch path by pressing a button on the edited message itself.
// Backend must return path_messages for every path (array of full MessageRow objects).

type MessageRow = {
  id: number;
  conversation_id: string;
  content: string;
  created_at: string;
  is_attach_file: boolean | null;
  is_from_sender: boolean | null;
  edited_from_message_id: number | null;
  parent_message_id: number | null;
};

type PathRow = {
  path_ids: number[];
  path_contents: string[];
  path_messages: MessageRow[];
};

type NormalizedMessages = Record<number, MessageRow>;

function computeLCP(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i; // length of common prefix
}

function normalizePaths(paths: PathRow[]) {
  const map: NormalizedMessages = {};
  for (const p of paths) {
    for (const msg of p.path_messages) {
      if (!map[msg.id]) map[msg.id] = msg;
    }
  }
  return map;
}

function PathList({
  paths,
  activeIndex,
  onSelect,
}: {
  paths: PathRow[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      {paths.map((p, idx) => (
        <button
          key={p.path_ids.join('-')}
          onClick={() => onSelect(idx)}
          className={`w-full text-left p-3 rounded-lg border transition-colors duration-150 hover:bg-slate-50 ${
            idx === activeIndex ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'
          }`}
        >{<div className="font-medium">Path {idx + 1}</div>}
          {/* <div className="truncate text-sm text-slate-700">{p.path_contents.join(' → ')}</div> */}
          {/* <div className="text-xs text-slate-400 mt-1">IDs: {p.path_ids.join(',')}</div> */}
        </button>
      ))}
    </div>
  );
}

export default function ChatbotPage() {
  const conversationId = '7210c963-5b32-4bdc-8351-c9ed9f013cfc';

  const [paths, setPaths] = useState<PathRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePathIndex, setActivePathIndex] = useState<number | null>(null);
  const [displayedSequence, setDisplayedSequence] = useState<number[]>([]);

  const normalized = useMemo(() => (paths ? normalizePaths(paths) : {}), [paths]);

  // map messageId -> array of path indices that include this message
  const msgToPaths = useMemo(() => {
    const map: Record<number, number[]> = {};
    if (!paths) return map;
    paths.forEach((p, idx) => {
      p.path_messages.forEach((m) => {
        if (!map[m.id]) map[m.id] = [];
        map[m.id].push(idx);
      });
    });
    return map;
  }, [paths]);

  useEffect(() => {
    async function fetchPaths() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post(
          `http://localhost:3001/message/v1/conversations/${conversationId}`,
          {},
          { withCredentials: true }
        );
        setPaths(response.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch paths');
      } finally {
        setLoading(false);
      }
    }
    fetchPaths();
  }, [conversationId]);

  useEffect(() => {
    if (paths && paths.length > 0 && activePathIndex === null) {
      setActivePathIndex(0);
      setDisplayedSequence(paths[0].path_ids);
    }
  }, [paths, activePathIndex]);

  function handleSelectPath(newIndex: number) {
    if (!paths) return;
    const newPath = paths[newIndex].path_ids;
    if (activePathIndex === null) {
      setActivePathIndex(newIndex);
      setDisplayedSequence(newPath);
      return;
    }
    const oldPath = paths[activePathIndex].path_ids;
    const lcpLen = computeLCP(oldPath, newPath);

    const preserved = displayedSequence.slice(0, lcpLen);
    const toAppend = newPath.slice(lcpLen);
    const merged = [...preserved, ...toAppend];

    console.log(`Switching path: oldIndex=${activePathIndex} newIndex=${newIndex} lcp=${lcpLen}`);

    setActivePathIndex(newIndex);
    setDisplayedSequence(merged);
  }

  function handleSwitchToEditedMessage(msgId: number) {
    if (!paths) return;
    const candidateIndices = msgToPaths[msgId] || [];
    if (candidateIndices.length === 0) return;

    // prefer a different path than current (if available)
    let targetIndex = candidateIndices[0];
    if (candidateIndices.length > 1 && activePathIndex !== null) {
      const other = candidateIndices.find((i) => i !== activePathIndex);
      if (other !== undefined) targetIndex = other;
    }

    const targetPath = paths[targetIndex].path_ids;
    const lcpLen = computeLCP(displayedSequence, targetPath);
    const preserved = displayedSequence.slice(0, lcpLen);
    const merged = [...preserved, ...targetPath.slice(lcpLen)];

    setActivePathIndex(targetIndex);
    setDisplayedSequence(merged);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {paths && paths.length > 0 ? (
              <PathList paths={paths} activeIndex={activePathIndex} onSelect={handleSelectPath} />
            ) : (
              <div className="text-sm text-slate-500">No paths found.</div>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Chatbot conversation</h1>
              <div className="text-sm text-slate-500">Conversation: {conversationId}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-3 text-sm text-slate-400">Rendered path (IDs): {displayedSequence.join(' → ')}</div>

            <div className="flex flex-col space-y-3">
              {displayedSequence.map((id) => {
                const msg = normalized[id];
                if (!msg) return null;

                const isSender = msg.is_from_sender === true;

                return (
                  <div key={id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    <div>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                          isSender ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-900 self-start'
                        }`}
                      >
                        <div className="text-sm">{msg.content}</div>
                        <div className="mt-1 text-[10px] opacity-70">#{msg.id} · {new Date(msg.created_at).toLocaleTimeString()}</div>
                      </div>

                      {/* Button shown on messages that are edited (have edited_from_message_id != null) */}
                      {msg.edited_from_message_id !== null && (
                        <div className={`mt-1 flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                          <button
                            onClick={() => handleSwitchToEditedMessage(msg.id)}
                            className="text-[12px] px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                          >
                            Open edited branch
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayedSequence.length === 0 && <div className="text-slate-500">No messages to display.</div>}
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">Tip: press the button shown under an edited message to jump to its edit branch; the UI will preserve the common prefix.</div>
        </div>
      </div>
    </div>
  );
}
