import { Trade } from '../../../shared/types';

export interface SearchExportData {
  searchTerm: string;
  filters: Record<string, any>;
  results: Trade[];
  exportedAt: string;
  totalResults: number;
}

export const exportSearchResults = (
  searchTerm: string,
  filters: Record<string, any>,
  results: Trade[],
  format: 'json' | 'csv' | 'markdown' = 'json'
): void => {
  const exportData: SearchExportData = {
    searchTerm,
    filters,
    results,
    exportedAt: new Date().toISOString(),
    totalResults: results.length
  };

  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case 'csv':
      content = generateCSV(results);
      filename = `search-results-${Date.now()}.csv`;
      mimeType = 'text/csv';
      break;
    case 'markdown':
      content = generateMarkdown(exportData);
      filename = `search-results-${Date.now()}.md`;
      mimeType = 'text/markdown';
      break;
    default:
      content = JSON.stringify(exportData, null, 2);
      filename = `search-results-${Date.now()}.json`;
      mimeType = 'application/json';
  }

  downloadFile(content, filename, mimeType);
};

const generateCSV = (trades: Trade[]): string => {
  const headers = [
    'ID',
    'Ticker',
    'Entry Date',
    'Exit Date',
    'Type',
    'Entry Price',
    'Exit Price',
    'Outcome',
    'Profit/Loss',
    'Thesis',
    'Exit Reason'
  ];

  const rows = trades.map(trade => [
    trade.id,
    trade.ticker,
    trade.entryDate,
    trade.exitDate || '',
    trade.type,
    trade.entryPrice?.toString() || '',
    trade.exitPrice?.toString() || '',
    trade.postTradeNotes?.outcome || '',
    trade.postTradeNotes?.profitLoss?.toString() || '',
    `"${trade.preTradeNotes.thesis.replace(/"/g, '""')}"`,
    `"${trade.postTradeNotes?.exitReason?.replace(/"/g, '""') || ''}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

const generateMarkdown = (exportData: SearchExportData): string => {
  const { searchTerm, filters, results, exportedAt, totalResults } = exportData;

  let markdown = `# Search Results Export\n\n`;
  markdown += `**Search Term:** ${searchTerm || 'None'}\n`;
  markdown += `**Export Date:** ${new Date(exportedAt).toLocaleString()}\n`;
  markdown += `**Total Results:** ${totalResults}\n\n`;

  if (Object.keys(filters).length > 0) {
    markdown += `## Applied Filters\n\n`;
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        markdown += `- **${key}:** ${value}\n`;
      }
    });
    markdown += '\n';
  }

  markdown += `## Results\n\n`;

  results.forEach((trade, index) => {
    markdown += `### ${index + 1}. ${trade.ticker} - ${trade.type.toUpperCase()}\n\n`;
    markdown += `- **Entry Date:** ${trade.entryDate}\n`;
    markdown += `- **Exit Date:** ${trade.exitDate || 'Open'}\n`;
    markdown += `- **Entry Price:** ${trade.entryPrice || 'N/A'}\n`;
    markdown += `- **Exit Price:** ${trade.exitPrice || 'N/A'}\n`;
    
    if (trade.postTradeNotes?.outcome) {
      markdown += `- **Outcome:** ${trade.postTradeNotes.outcome}\n`;
    }
    
    if (trade.postTradeNotes?.profitLoss) {
      markdown += `- **P&L:** ${trade.postTradeNotes.profitLoss}\n`;
    }

    markdown += `\n**Thesis:**\n${trade.preTradeNotes.thesis}\n\n`;
    
    if (trade.postTradeNotes?.exitReason) {
      markdown += `**Exit Reason:**\n${trade.postTradeNotes.exitReason}\n\n`;
    }

    if (trade.duringTradeNotes.length > 0) {
      markdown += `**During Trade Notes:**\n`;
      trade.duringTradeNotes.forEach(note => {
        markdown += `- ${new Date(note.timestamp).toLocaleString()}: ${note.content}\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};