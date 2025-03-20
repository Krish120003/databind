/**
 * Utility functions for handling file operations in the Excel/CSV Join Tool
 */

import * as XLSX from "xlsx";
import { toast } from "sonner";

/**
 * Parse an Excel or CSV file and return its data as an array of objects
 */
export const parseFile = async (
  file: File,
): Promise<{ data: any[]; columns: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the worksheet to an array of objects
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        // Extract column headers from the first row
        let columns: string[] = [];
        if (jsonData.length > 0) {
          columns = Object.keys(jsonData[0]);
        }

        resolve({ data: jsonData, columns });
      } catch (error) {
        console.error("Error parsing file:", error);
        reject(
          new Error(
            "Failed to parse the file. Please ensure it is a valid Excel or CSV file.",
          ),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Find common columns between two column sets
 */
export const findCommonColumns = (
  columnsA: string[],
  columnsB: string[],
): string[] => {
  return columnsA.filter((column) => columnsB.includes(column));
};

/**
 * Join two datasets based on a composite key (selected columns)
 */
export const joinDatasets = (
  primaryData: any[],
  secondaryData: any[],
  primaryKeyColumns: string[],
  secondaryKeyColumns: string[],
): {
  joinedData: any[];
  conflicts: {
    rowIndex: number;
    primaryValues: any;
    secondaryValues: any;
    conflictingColumns: string[];
  }[];
  allColumns: string[];
} => {
  // Create maps for quick lookup
  const secondaryMap = new Map();

  // Create a map of the secondary data using the composite key
  secondaryData.forEach((row) => {
    const compositeKey = secondaryKeyColumns.map((col) => row[col]).join("|");
    secondaryMap.set(compositeKey, row);
  });

  // Get all unique column names from both datasets
  const allColumns = [
    ...new Set([
      ...Object.keys(primaryData[0] || {}),
      ...Object.keys(secondaryData[0] || {}),
    ]),
  ];

  // Initialize empty arrays for joined data and conflicts
  const joinedData: any[] = [];
  const conflicts: {
    rowIndex: number;
    primaryValues: any;
    secondaryValues: any;
    conflictingColumns: string[];
  }[] = [];

  // Join the primary data with the secondary data
  primaryData.forEach((primaryRow) => {
    const compositeKey = primaryKeyColumns
      .map((col) => primaryRow[col])
      .join("|");
    const secondaryRow = secondaryMap.get(compositeKey);

    if (secondaryRow) {
      // Create a merged row with all columns
      const mergedRow: any = { ...primaryRow };

      // Find conflicting columns (columns in both datasets with different values)
      const conflictingColumns: string[] = [];

      for (const column of allColumns) {
        if (secondaryRow[column] !== undefined) {
          if (
            primaryRow[column] !== undefined &&
            String(primaryRow[column]) !== String(secondaryRow[column]) &&
            primaryRow[column] !== null &&
            secondaryRow[column] !== null
          ) {
            // There's a conflict - add it to the conflicts list
            conflictingColumns.push(column);
          }

          // Add secondary columns to the merged row for columns not in primary
          if (primaryRow[column] === undefined) {
            mergedRow[column] = secondaryRow[column];
          }
        }
      }

      // Add the merged row to the joined data
      joinedData.push(mergedRow);

      // Record the conflict if there are any conflicting columns
      if (conflictingColumns.length > 0) {
        conflicts.push({
          rowIndex: joinedData.length - 1,
          primaryValues: primaryRow,
          secondaryValues: secondaryRow,
          conflictingColumns,
        });
      }
    } else {
      // No match found in secondary data, add only the primary row
      joinedData.push({ ...primaryRow });
    }
  });

  // Add rows from secondary data that don't have matching keys in primary data
  secondaryData.forEach((secondaryRow) => {
    const compositeKey = secondaryKeyColumns
      .map((col) => secondaryRow[col])
      .join("|");
    const hasMatchInPrimary = primaryData.some((primaryRow) => {
      const primaryKey = primaryKeyColumns
        .map((col) => primaryRow[col])
        .join("|");
      return primaryKey === compositeKey;
    });

    if (!hasMatchInPrimary) {
      joinedData.push({ ...secondaryRow });
    }
  });

  return { joinedData, conflicts, allColumns };
};

/**
 * Resolve conflicts in the joined data by selecting which source to use
 */
export const resolveConflicts = (
  joinedData: any[],
  conflicts: {
    rowIndex: number;
    primaryValues: any;
    secondaryValues: any;
    conflictingColumns: string[];
  }[],
  resolutions: Record<number, "primary" | "secondary">,
) => {
  const resolvedData = [...joinedData];

  // Apply the conflict resolutions
  conflicts.forEach((conflict) => {
    const resolution = resolutions[conflict.rowIndex];
    if (resolution) {
      const sourceData =
        resolution === "primary"
          ? conflict.primaryValues
          : conflict.secondaryValues;

      // Update the conflicting columns with the chosen source
      conflict.conflictingColumns.forEach((column) => {
        resolvedData[conflict.rowIndex][column] = sourceData[column];
      });
    }
  });

  return resolvedData;
};

/**
 * Export data as an Excel file
 */
export const exportToExcel = (
  data: any[],
  filename: string = "joined-data",
) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Joined Data");

    // Write the workbook and trigger a download
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    toast.success("File exported successfully");
  } catch (error) {
    console.error("Error exporting file:", error);
    toast.error("Failed to export the file");
  }
};
