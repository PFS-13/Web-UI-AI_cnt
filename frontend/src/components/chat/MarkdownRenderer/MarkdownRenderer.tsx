import React from 'react';
import { useMarkdownContext } from './MarkdownContext';

interface MarkdownRendererProps {
  text: string;
  messageId?: number; // Optional message ID for context
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const { lastOrderedListNumber, setLastOrderedListNumber } = useMarkdownContext();
  // Process inline formatting (simple approach)
  const processInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    // Process bold text
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(remaining)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={partKey++}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }

    // Process italic in each part
    const processedParts: React.ReactNode[] = [];
    for (const part of parts) {
      if (typeof part === 'string') {
        const italicRegex = /\*(.*?)\*/g;
        let italicLastIndex = 0;
        let italicMatch;
        const italicParts: React.ReactNode[] = [];

        while ((italicMatch = italicRegex.exec(part)) !== null) {
          if (italicMatch.index > italicLastIndex) {
            italicParts.push(part.slice(italicLastIndex, italicMatch.index));
          }
          italicParts.push(<em key={partKey++}>{italicMatch[1]}</em>);
          italicLastIndex = italicMatch.index + italicMatch[0].length;
        }

        if (italicLastIndex < part.length) {
          italicParts.push(part.slice(italicLastIndex));
        }

        processedParts.push(...italicParts);
      } else {
        processedParts.push(part);
      }
    }

    // Process code in each part
    const finalParts: React.ReactNode[] = [];
    for (const part of processedParts) {
      if (typeof part === 'string') {
        const codeRegex = /`(.*?)`/g;
        let codeLastIndex = 0;
        let codeMatch;
        const codeParts: React.ReactNode[] = [];

        while ((codeMatch = codeRegex.exec(part)) !== null) {
          if (codeMatch.index > codeLastIndex) {
            codeParts.push(part.slice(codeLastIndex, codeMatch.index));
          }
          codeParts.push(
            <code key={partKey++} style={{ 
              background: '#2d2d2d', 
              padding: '2px 4px', 
              borderRadius: '3px', 
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }}>
              {codeMatch[1]}
            </code>
          );
          codeLastIndex = codeMatch.index + codeMatch[0].length;
        }

        if (codeLastIndex < part.length) {
          codeParts.push(part.slice(codeLastIndex));
        }

        finalParts.push(...codeParts);
      } else {
        finalParts.push(part);
      }
    }

    return finalParts;
  };

  const renderMarkdown = (text: string): React.ReactNode => {
    // Simple markdown renderer without complex regex processing
    const lines = text.split('\n');
    const processedLines: React.ReactNode[] = [];
    let keyCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Process code blocks
      if (line.startsWith('```')) {
        const codeLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('```')) {
          codeLines.push(lines[j]);
          j++;
        }
        processedLines.push(
          <pre key={keyCounter++} style={{ 
            background: '#1a1a1a', 
            padding: '12px', 
            borderRadius: '6px', 
            overflow: 'auto',
            margin: '8px 0',
            border: '1px solid #333'
          }}>
            <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
              {codeLines.join('\n')}
            </code>
          </pre>
        );
        i = j;
        continue;
      }

      // Process headers
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const HeadingTag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements;
        processedLines.push(
          React.createElement(HeadingTag, { 
            key: keyCounter++,
            style: { 
              margin: '12px 0 8px 0',
              fontWeight: 'bold',
              fontSize: level === 1 ? '1.5em' : level === 2 ? '1.3em' : '1.1em'
            }
          }, content)
        );
        continue;
      }

      // Process ordered lists (grouped)
      const orderedListMatch = line.match(/^(\d+\.)\s+(.*)$/);
      if (orderedListMatch) {
        const listItems: React.ReactNode[] = [];
        let currentIndex = i;
        let itemNumber = parseInt(orderedListMatch[1]) || 1;
        
        // Determine starting number based on context
        let startNumber = lastOrderedListNumber + 1;
        if (itemNumber === 1) {
          // If this is a new list starting with 1, reset numbering
          startNumber = 1;
        } else if (itemNumber > lastOrderedListNumber) {
          // If this continues from previous numbering
          startNumber = lastOrderedListNumber + 1;
        } else {
          // If this is a restart or continuation
          startNumber = itemNumber;
        }
        
        // Collect all consecutive ordered list items
        while (currentIndex < lines.length) {
          const currentLine = lines[currentIndex];
          const match = currentLine.match(/^(\d+\.)\s+(.*)$/);
          
          if (match) {
            const content = match[2];
            listItems.push(
              <li key={keyCounter++} style={{ margin: '4px 0' }}>
                {processInline(content)}
              </li>
            );
            currentIndex++;
          } else {
            break;
          }
        }
        
        // Update context with the last number in this list
        setLastOrderedListNumber(startNumber + listItems.length - 1);
        
        // Create ordered list with proper start number
        processedLines.push(
          <ol key={keyCounter++} start={startNumber} style={{ 
            margin: '8px 0', 
            paddingLeft: '20px',
            listStyleType: 'decimal'
          }}>
            {listItems}
          </ol>
        );
        
        i = currentIndex - 1; // Adjust index
        continue;
      }

      // Process unordered lists (grouped)
      const unorderedListMatch = line.match(/^(\*)\s+(.*)$/);
      if (unorderedListMatch) {
        const listItems: React.ReactNode[] = [];
        let currentIndex = i;
        
        // Collect all consecutive unordered list items
        while (currentIndex < lines.length) {
          const currentLine = lines[currentIndex];
          const match = currentLine.match(/^(\*)\s+(.*)$/);
          
          if (match) {
            const content = match[2];
            listItems.push(
              <li key={keyCounter++} style={{ margin: '4px 0' }}>
                {processInline(content)}
              </li>
            );
            currentIndex++;
          } else {
            break;
          }
        }
        
        // Create unordered list
        processedLines.push(
          <ul key={keyCounter++} style={{ 
            margin: '8px 0', 
            paddingLeft: '20px',
            listStyleType: 'disc'
          }}>
            {listItems}
          </ul>
        );
        
        i = currentIndex - 1; // Adjust index
        continue;
      }


      // Process the line
      const processedLine = processInline(line);
      processedLines.push(
        <div key={keyCounter++} style={{ margin: '4px 0' }}>
          {processedLine}
        </div>
      );
    }

    return <div>{processedLines}</div>;
  };

  return <span>{renderMarkdown(text)}</span>;
};

export default MarkdownRenderer;