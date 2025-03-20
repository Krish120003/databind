
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, GitCompareIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface JoinConfigurationProps {
  primaryColumns: string[];
  secondaryColumns: string[];
  primarySelectedColumns: string[];
  secondarySelectedColumns: string[];
  canJoin: boolean;
  onJoin: () => void;
  onReset: () => void;
}

const JoinConfiguration: React.FC<JoinConfigurationProps> = ({
  primaryColumns,
  secondaryColumns,
  primarySelectedColumns,
  secondarySelectedColumns,
  canJoin,
  onJoin,
  onReset
}) => {
  const isSelectionComplete = primarySelectedColumns.length > 0 && secondarySelectedColumns.length > 0;
  const isSameColumnCount = primarySelectedColumns.length === secondarySelectedColumns.length;
  
  return (
    <Card className="border shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl">Join Configuration</CardTitle>
        <CardDescription>
          Select columns from both files to create a composite key for joining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr,auto,1fr]">
          {/* Primary File Columns */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-file-blue">Primary File Columns</h3>
            <div className="space-y-2">
              {primarySelectedColumns.length > 0 ? (
                <div className="space-y-2">
                  {primarySelectedColumns.map((column, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-file-blue/5 rounded-md border border-file-blue/20">
                      <span className="flex items-center justify-center bg-file-blue/10 text-file-blue h-5 w-5 rounded-full text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate">{column}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-sm text-muted-foreground bg-muted/50 rounded-md border border-border">
                  No columns selected
                </div>
              )}
            </div>
          </div>
          
          {/* Middle section with join icon */}
          <div className="flex items-center justify-center py-6">
            <div className={cn(
              "p-2 rounded-full transition-all duration-300",
              isSelectionComplete && isSameColumnCount ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
            )}>
              <GitCompareIcon className="h-6 w-6" />
            </div>
          </div>
          
          {/* Secondary File Columns */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-file-purple">Secondary File Columns</h3>
            <div className="space-y-2">
              {secondarySelectedColumns.length > 0 ? (
                <div className="space-y-2">
                  {secondarySelectedColumns.map((column, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-file-purple/5 rounded-md border border-file-purple/20">
                      <span className="flex items-center justify-center bg-file-purple/10 text-file-purple h-5 w-5 rounded-full text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate">{column}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-sm text-muted-foreground bg-muted/50 rounded-md border border-border">
                  No columns selected
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isSelectionComplete && !isSameColumnCount && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-start space-x-2 animate-fade-in">
            <AlertCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Column count mismatch</p>
              <p className="text-xs mt-1">
                The number of selected columns must be the same in both files to create a valid composite key.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          Reset Selection
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  disabled={!canJoin} 
                  onClick={onJoin}
                  className="transition-all"
                >
                  Continue to Join
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            {!canJoin && (
              <TooltipContent>
                <p>
                  {!isSelectionComplete 
                    ? "Select at least one column from each file" 
                    : !isSameColumnCount 
                      ? "Select the same number of columns from each file" 
                      : "Something went wrong"}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default JoinConfiguration;
