"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import FileDropzone from "@/components/FileDropzone";
import TablePreview from "@/components/TablePreview";
import JoinConfiguration from "@/components/JoinConfiguration";
import JoinPreview from "@/components/JoinPreview";
import {
  parseFile,
  joinDatasets,
  resolveConflicts,
  exportToExcel,
} from "@/lib/fileUtils";
import { GitMergeIcon, TableIcon, XIcon } from "lucide-react";

const Index = () => {
  const isMobile = useIsMobile();

  // File states
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);

  // Data states
  const [primaryData, setPrimaryData] = useState<any[]>([]);
  const [secondaryData, setSecondaryData] = useState<any[]>([]);
  const [primaryColumns, setPrimaryColumns] = useState<string[]>([]);
  const [secondaryColumns, setSecondaryColumns] = useState<string[]>([]);

  // Selected columns for join
  const [primarySelectedColumns, setPrimarySelectedColumns] = useState<
    string[]
  >([]);
  const [secondarySelectedColumns, setSecondarySelectedColumns] = useState<
    string[]
  >([]);

  // Join result states
  const [joinedData, setJoinedData] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<
    {
      rowIndex: number;
      primaryValues: any;
      secondaryValues: any;
      conflictingColumns: string[];
    }[]
  >([]);
  const [resolvedConflicts, setResolvedConflicts] = useState<
    Record<number, "primary" | "secondary">
  >({});
  const [allColumns, setAllColumns] = useState<string[]>([]);

  // UI states
  const [isJoining, setIsJoining] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  // Handle file selection
  const handleFileSelect = async (
    file: File,
    fileType: "primary" | "secondary",
  ) => {
    try {
      setIsProcessingFiles(true);

      if (fileType === "primary") {
        setPrimaryFile(file);
        // Reset selections when a new file is uploaded
        setPrimarySelectedColumns([]);
      } else {
        setSecondaryFile(file);
        // Reset selections when a new file is uploaded
        setSecondarySelectedColumns([]);
      }

      // Parse the file
      const { data, columns } = await parseFile(file);

      if (data.length === 0) {
        toast.error("The file contains no data.");
        return;
      }

      if (fileType === "primary") {
        setPrimaryData(data);
        setPrimaryColumns(columns);
        toast.success(`Primary file loaded: ${data.length} rows`);
      } else {
        setSecondaryData(data);
        setSecondaryColumns(columns);
        toast.success(`Secondary file loaded: ${data.length} rows`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error((error as Error).message || "Error processing file");

      // Reset the file on error
      if (fileType === "primary") {
        setPrimaryFile(null);
      } else {
        setSecondaryFile(null);
      }
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Handle column selection
  const handleColumnSelect = (
    column: string,
    fileType: "primary" | "secondary",
  ) => {
    if (fileType === "primary") {
      if (primarySelectedColumns.includes(column)) {
        setPrimarySelectedColumns(
          primarySelectedColumns.filter((c) => c !== column),
        );
      } else {
        setPrimarySelectedColumns([...primarySelectedColumns, column]);
      }
    } else {
      if (secondarySelectedColumns.includes(column)) {
        setSecondarySelectedColumns(
          secondarySelectedColumns.filter((c) => c !== column),
        );
      } else {
        setSecondarySelectedColumns([...secondarySelectedColumns, column]);
      }
    }
  };

  // Reset column selections
  const resetSelections = () => {
    setPrimarySelectedColumns([]);
    setSecondarySelectedColumns([]);
  };

  // Perform the join operation
  const performJoin = () => {
    if (
      primarySelectedColumns.length === 0 ||
      secondarySelectedColumns.length === 0
    ) {
      toast.error("Please select at least one column from each file.");
      return;
    }

    if (primarySelectedColumns.length !== secondarySelectedColumns.length) {
      toast.error(
        "The number of selected columns must be the same in both files.",
      );
      return;
    }

    setIsJoining(true);

    try {
      const { joinedData, conflicts, allColumns } = joinDatasets(
        primaryData,
        secondaryData,
        primarySelectedColumns,
        secondarySelectedColumns,
      );

      setJoinedData(joinedData);
      setConflicts(conflicts);
      setAllColumns(allColumns);
      setShowPreview(true);

      if (conflicts.length > 0) {
        toast.info(
          `Found ${conflicts.length} conflicts. Please resolve them before downloading.`,
        );
      } else {
        toast.success("Join completed successfully with no conflicts!");
      }
    } catch (error) {
      console.error("Error joining data:", error);
      toast.error("Error joining data. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Handle conflict resolution
  const handleResolveConflict = (
    rowIndex: number,
    source: "primary" | "secondary",
  ) => {
    setResolvedConflicts({
      ...resolvedConflicts,
      [rowIndex]: source,
    });
  };

  // Handle going back from preview
  const handleBackFromPreview = () => {
    setShowPreview(false);
    setResolvedConflicts({});
  };

  // Handle file download
  const handleDownload = () => {
    const unresolvedCount = conflicts.filter(
      (conflict) => !resolvedConflicts[conflict.rowIndex],
    ).length;

    if (unresolvedCount > 0) {
      toast.error(
        `Please resolve all ${unresolvedCount} remaining conflicts before downloading.`,
      );
      return;
    }

    // Apply conflict resolutions
    const finalData = resolveConflicts(
      joinedData,
      conflicts,
      resolvedConflicts,
    );

    // Generate a filename based on the original files
    const primaryName =
      primaryFile?.name.split(".").slice(0, -1).join(".") || "primary";
    const secondaryName =
      secondaryFile?.name.split(".").slice(0, -1).join(".") || "secondary";
    const filename = `${primaryName}-${secondaryName}-joined`;

    // Export the data
    exportToExcel(finalData, filename);
  };

  // Reset the entire application
  const resetApplication = () => {
    setPrimaryFile(null);
    setSecondaryFile(null);
    setPrimaryData([]);
    setSecondaryData([]);
    setPrimaryColumns([]);
    setSecondaryColumns([]);
    setPrimarySelectedColumns([]);
    setSecondarySelectedColumns([]);
    setJoinedData([]);
    setConflicts([]);
    setResolvedConflicts({});
    setAllColumns([]);
    setShowPreview(false);
  };

  // Check if join is possible
  const canJoin =
    primarySelectedColumns.length > 0 &&
    secondarySelectedColumns.length > 0 &&
    primarySelectedColumns.length === secondarySelectedColumns.length;

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Header with branding */}
        <header className="animate-slide-down mb-10 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Excel Join Tool
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Combine and merge Excel spreadsheets with powerful joining
              capabilities
            </p>
          </div>

          {/* Reset button */}
          {(primaryFile || secondaryFile) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetApplication}
              className="space-x-1"
            >
              <XIcon className="h-4 w-4" />
              <span>Reset All</span>
            </Button>
          )}
        </header>

        {!showPreview ? (
          <div className="space-y-10">
            {/* File upload section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
              <div
                className="animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <FileDropzone
                  onFileSelect={(file) => handleFileSelect(file, "primary")}
                  label="Primary File (Left)"
                  fileType="primary"
                  selectedFile={primaryFile}
                  onClearFile={() => {
                    setPrimaryFile(null);
                    setPrimaryData([]);
                    setPrimaryColumns([]);
                    setPrimarySelectedColumns([]);
                  }}
                />
              </div>

              <div
                className="animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <FileDropzone
                  onFileSelect={(file) => handleFileSelect(file, "secondary")}
                  label="Secondary File (Right)"
                  fileType="secondary"
                  selectedFile={secondaryFile}
                  onClearFile={() => {
                    setSecondaryFile(null);
                    setSecondaryData([]);
                    setSecondaryColumns([]);
                    setSecondarySelectedColumns([]);
                  }}
                />
              </div>
            </div>

            {/* Data preview and column selection */}
            {primaryData.length > 0 && secondaryData.length > 0 && (
              <>
                <Separator className="my-8" />

                <div className="animate-fade-in mb-6">
                  <div className="mb-6 flex items-center space-x-2">
                    <div className="rounded-md bg-secondary p-2">
                      <TableIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      Select Columns to Join
                    </h2>
                  </div>

                  <p className="text-muted-foreground">
                    Click on columns from both files to create a composite key.
                    These columns will be used to match rows between files.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: "300ms" }}
                  >
                    <TablePreview
                      data={primaryData}
                      columns={primaryColumns}
                      fileType="primary"
                      title={primaryFile?.name || "Primary File"}
                      selectedColumns={primarySelectedColumns}
                      onColumnSelect={(column) =>
                        handleColumnSelect(column, "primary")
                      }
                    />
                  </div>

                  <div
                    className="animate-slide-up"
                    style={{ animationDelay: "400ms" }}
                  >
                    <TablePreview
                      data={secondaryData}
                      columns={secondaryColumns}
                      fileType="secondary"
                      title={secondaryFile?.name || "Secondary File"}
                      selectedColumns={secondarySelectedColumns}
                      onColumnSelect={(column) =>
                        handleColumnSelect(column, "secondary")
                      }
                    />
                  </div>
                </div>

                {/* Join configuration */}
                <div className="mt-10" style={{ animationDelay: "500ms" }}>
                  <JoinConfiguration
                    primaryColumns={primaryColumns}
                    secondaryColumns={secondaryColumns}
                    primarySelectedColumns={primarySelectedColumns}
                    secondarySelectedColumns={secondarySelectedColumns}
                    canJoin={canJoin}
                    onJoin={performJoin}
                    onReset={resetSelections}
                  />
                </div>
              </>
            )}

            {/* Empty state when no files loaded */}
            {primaryData.length === 0 &&
              secondaryData.length === 0 &&
              !isProcessingFiles && (
                <div className="animate-scale-in py-20 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                    <GitMergeIcon className="h-10 w-10 text-primary/70" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">
                    Join Excel and CSV Files
                  </h3>
                  <p className="mx-auto max-w-md text-muted-foreground">
                    Upload two files to start. You'll be able to preview the
                    data and select matching columns for joining.
                  </p>
                </div>
              )}
          </div>
        ) : (
          <JoinPreview
            joinedData={joinedData}
            primaryFile={primaryFile}
            secondaryFile={secondaryFile}
            conflicts={conflicts}
            resolvedConflicts={resolvedConflicts}
            onResolveConflict={handleResolveConflict}
            onBack={handleBackFromPreview}
            onDownload={handleDownload}
            allColumns={allColumns}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
