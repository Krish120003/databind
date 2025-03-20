
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TablePreviewProps {
  data: any[];
  columns: string[];
  fileType: 'primary' | 'secondary';
  title: string;
  selectedColumns: string[];
  onColumnSelect: (column: string) => void;
}

const TablePreview: React.FC<TablePreviewProps> = ({
  data,
  columns,
  fileType,
  title,
  selectedColumns,
  onColumnSelect
}) => {
  const [hoverColumn, setHoverColumn] = useState<string | null>(null);
  
  // Only display up to 100 rows for preview
  const previewData = data.slice(0, 100);
  
  const fileTypeColors = {
    primary: {
      bg: 'bg-file-blue/5',
      border: 'border-file-blue/20',
      text: 'text-file-blue',
      highlight: 'bg-file-blue/10'
    },
    secondary: {
      bg: 'bg-file-purple/5',
      border: 'border-file-purple/20',
      text: 'text-file-purple',
      highlight: 'bg-file-purple/10'
    }
  };
  
  return (
    <Card className={cn(
      "border overflow-hidden transition-all duration-300 animate-fade-in",
      fileTypeColors[fileType].border
    )}>
      <div className={cn(
        "px-4 py-3 border-b flex justify-between items-center",
        fileTypeColors[fileType].bg,
        fileTypeColors[fileType].border
      )}>
        <h3 className={cn("font-medium", fileTypeColors[fileType].text)}>
          {title}
        </h3>
        <span className="text-xs bg-secondary px-2 py-1 rounded-full">
          {data.length} rows
        </span>
      </div>
      
      <ScrollArea className="h-[300px] w-full">
        <div className="w-full inline-block align-middle">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  {columns.map((column, i) => (
                    <th
                      key={`header-${i}`}
                      scope="col"
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors relative group",
                        selectedColumns.includes(column) ? fileTypeColors[fileType].highlight : "hover:bg-secondary/60",
                        hoverColumn === column ? "bg-secondary/90" : ""
                      )}
                      onClick={() => onColumnSelect(column)}
                      onMouseEnter={() => setHoverColumn(column)}
                      onMouseLeave={() => setHoverColumn(null)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column}</span>
                        {selectedColumns.includes(column) && (
                          <span className={cn(
                            "flex h-4 w-4 rounded-full text-[10px] font-bold items-center justify-center ml-1",
                            fileTypeColors[fileType].text,
                            fileTypeColors[fileType].bg
                          )}>
                            {selectedColumns.indexOf(column) + 1}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "absolute bottom-0 left-0 h-[2px] transition-all",
                        selectedColumns.includes(column) ? fileTypeColors[fileType].text : "bg-primary/0 group-hover:bg-primary/20",
                        selectedColumns.includes(column) ? "w-full" : "w-0 group-hover:w-full"
                      )} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previewData.map((row, rowIndex) => (
                  <tr 
                    key={`row-${rowIndex}`}
                    className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={cn(
                          "px-4 py-2 text-sm whitespace-nowrap truncate max-w-[200px]",
                          selectedColumns.includes(column) ? fileTypeColors[fileType].highlight : "",
                          hoverColumn === column ? "bg-secondary/70" : ""
                        )}
                      >
                        {row[column] === null || row[column] === undefined ? 
                          <span className="text-muted-foreground italic">null</span> : 
                          String(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TablePreview;
