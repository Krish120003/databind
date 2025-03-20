
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeftIcon, DownloadIcon, TableIcon } from 'lucide-react';

interface JoinPreviewProps {
  joinedData: any[];
  primaryFile: File | null;
  secondaryFile: File | null;
  conflicts: {
    rowIndex: number;
    primaryValues: any;
    secondaryValues: any;
    conflictingColumns: string[];
  }[];
  resolvedConflicts: Record<number, 'primary' | 'secondary'>;
  onResolveConflict: (rowIndex: number, source: 'primary' | 'secondary') => void;
  onBack: () => void;
  onDownload: () => void;
  allColumns: string[];
}

const JoinPreview: React.FC<JoinPreviewProps> = ({
  joinedData,
  primaryFile,
  secondaryFile,
  conflicts,
  resolvedConflicts,
  onResolveConflict,
  onBack,
  onDownload,
  allColumns
}) => {
  const [activeTab, setActiveTab] = useState<'conflicts' | 'preview'>('conflicts');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  
  const hasUnresolvedConflicts = conflicts.some(
    conflict => !resolvedConflicts[conflict.rowIndex]
  );
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = joinedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(joinedData.length / rowsPerPage);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Join Results</h2>
          <p className="text-muted-foreground">
            {joinedData.length} rows found with {conflicts.length} conflicts
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('conflicts')} 
            className={activeTab === 'conflicts' ? 'bg-secondary' : ''}>
            Resolve Conflicts ({conflicts.length})
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('preview')}
            className={activeTab === 'preview' ? 'bg-secondary' : ''}>
            Data Preview
          </Button>
        </div>
      </div>
      
      {activeTab === 'conflicts' && (
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle>Conflicts</CardTitle>
            <CardDescription>
              Resolve conflicts by selecting which file should be the source of truth for each row
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conflicts.length > 0 ? (
              <ScrollArea className="h-[400px] w-full pr-4">
                <div className="space-y-4">
                  {conflicts.map((conflict, index) => (
                    <Card key={index} className={cn(
                      "border overflow-hidden transition-all",
                      resolvedConflicts[conflict.rowIndex] ? "bg-secondary/30" : "bg-white"
                    )}>
                      <CardHeader className="py-3 px-4 bg-secondary/50 border-b">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            Conflict #{index + 1}
                          </CardTitle>
                          {resolvedConflicts[conflict.rowIndex] && (
                            <span className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded-full">
                              Resolved with {resolvedConflicts[conflict.rowIndex]} file
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 py-3">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <div className="font-medium">Conflicting Columns:</div>
                            <div className="text-muted-foreground">
                              {conflict.conflictingColumns.join(', ')}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroup>
                                  <RadioGroupItem
                                    value="primary"
                                    id={`primary-${conflict.rowIndex}`}
                                    checked={resolvedConflicts[conflict.rowIndex] === 'primary'}
                                    onClick={() => onResolveConflict(conflict.rowIndex, 'primary')}
                                    className="text-file-blue"
                                  />
                                </RadioGroup>
                                <div className="text-sm font-medium text-file-blue">
                                  Primary: {primaryFile?.name}
                                </div>
                              </div>
                              
                              <div className="rounded-md border p-3 bg-file-blue/5">
                                {conflict.conflictingColumns.map((column, colIndex) => (
                                  <div key={colIndex} className="grid grid-cols-2 gap-2 text-sm py-1">
                                    <div className="font-medium">{column}:</div>
                                    <div className="truncate">{conflict.primaryValues[column] ?? 'null'}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroup>
                                  <RadioGroupItem
                                    value="secondary"
                                    id={`secondary-${conflict.rowIndex}`}
                                    checked={resolvedConflicts[conflict.rowIndex] === 'secondary'}
                                    onClick={() => onResolveConflict(conflict.rowIndex, 'secondary')}
                                    className="text-file-purple"
                                  />
                                </RadioGroup>
                                <div className="text-sm font-medium text-file-purple">
                                  Secondary: {secondaryFile?.name}
                                </div>
                              </div>
                              
                              <div className="rounded-md border p-3 bg-file-purple/5">
                                {conflict.conflictingColumns.map((column, colIndex) => (
                                  <div key={colIndex} className="grid grid-cols-2 gap-2 text-sm py-1">
                                    <div className="font-medium">{column}:</div>
                                    <div className="truncate">{conflict.secondaryValues[column] ?? 'null'}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-green-50 rounded-full p-3 mb-3">
                  <TableIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">No Conflicts Found</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Great! There are no conflicts between your files. You can proceed to download the joined data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'preview' && (
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Preview of the joined data with resolved conflicts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <div className="w-full inline-block align-middle">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/30">
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Row
                      </th>
                      {allColumns.map((column, i) => (
                        <th
                          key={i}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedRows.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex}
                        className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      >
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {startIndex + rowIndex + 1}
                        </td>
                        {allColumns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm whitespace-nowrap truncate max-w-[200px]"
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
            </ScrollArea>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="space-x-2"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Back to Configuration</span>
        </Button>
        
        <Button
          onClick={onDownload}
          disabled={hasUnresolvedConflicts}
          className="space-x-2"
        >
          <DownloadIcon className="h-4 w-4" />
          <span>Download Joined File</span>
        </Button>
      </div>
    </div>
  );
};

export default JoinPreview;
