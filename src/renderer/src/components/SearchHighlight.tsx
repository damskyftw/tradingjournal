import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchTerm,
  className = ''
}) => {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-300 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};