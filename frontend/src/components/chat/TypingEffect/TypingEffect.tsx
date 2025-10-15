import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onStart?: () => void;
  isNewMessage?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ 
  text, 
  speed = 30, 
  onComplete,
  onStart,
  isNewMessage = false 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const currentTextRef = useRef('');
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onStartRef = useRef(onStart);

  // Update ref untuk onComplete dan onStart
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onStartRef.current = onStart;
  }, [onComplete, onStart]);

  // Effect untuk menangani perubahan text - hanya trigger saat text berubah
  useEffect(() => {
    // Jika bukan message baru, tampilkan langsung
    if (!isNewMessage) {
      setDisplayedText(text);
      isTypingRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Jika sedang typing, jangan restart
    if (isTypingRef.current) {
      return;
    }

    // Reset untuk message baru
    setDisplayedText('');
    currentTextRef.current = '';
    
    let currentIndex = 0;
    
    const startTyping = () => {
      isTypingRef.current = true;
      onStartRef.current?.(); // Call onStart when typing begins
      timerRef.current = setInterval(() => {
        if (currentIndex < text.length) {
          // Build text secara atomic
          currentTextRef.current += text[currentIndex];
          setDisplayedText(currentTextRef.current);
          currentIndex++;
        } else {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          isTypingRef.current = false;
          onCompleteRef.current?.();
        }
      }, speed);
    };

    // Mulai typing langsung tanpa delay untuk menghindari flickering
    startTyping();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isTypingRef.current = false;
    };
  }, [text, speed, isNewMessage]); // onComplete dan onStart menggunakan ref, tidak perlu di dependency

  // Cleanup saat component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return <span><MarkdownRenderer text={displayedText} messageId={undefined} /></span>;
};

export default TypingEffect;
