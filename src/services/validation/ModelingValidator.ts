import { ModelingQuestion, ModelingValidationResult, UserTable } from '@/types';

// Storage cost multipliers
const STORAGE_COST = {
  fact: 10, // Fact tables have billions of rows
  dimension: 1, // Dimension tables are small
};

// Field type storage costs (relative)
const FIELD_STORAGE = {
  integer: 1,
  decimal: 2,
  boolean: 0.5,
  string: 3,
  timestamp: 2,
};

// Cardinality multipliers for fact tables
const CARDINALITY_MULTIPLIER = {
  low: 0.5,
  medium: 1,
  high: 2,
};

export function validateModelingQuestion(
  question: ModelingQuestion,
  userTables: UserTable[]
): ModelingValidationResult {
  const fieldMap = new Map(question.fields.map((f) => [f.id, f]));

  // Calculate storage score
  let storageScore = 0;
  userTables.forEach((table) => {
    const tableCost = STORAGE_COST[table.type];
    table.fieldIds.forEach((fieldId) => {
      const field = fieldMap.get(fieldId);
      if (field) {
        let fieldCost = FIELD_STORAGE[field.dataType] * tableCost;
        // High cardinality in fact tables is expensive
        if (table.type === 'fact') {
          fieldCost *= CARDINALITY_MULTIPLIER[field.cardinality];
        }
        storageScore += fieldCost;
      }
    });
  });

  // Calculate query cost (based on number of tables/joins needed)
  const tableCount = userTables.length;
  const queryCostScore = Math.max(0, (tableCount - 1) * 15); // Each join adds 15 to query cost

  // Determine status based on thresholds
  const { storage: storageThr, queryCost: queryThr } = question.scoreThresholds;

  const storageStatus =
    storageScore <= storageThr.green
      ? 'green'
      : storageScore <= storageThr.yellow
        ? 'yellow'
        : 'red';

  const queryCostStatus =
    queryCostScore <= queryThr.green
      ? 'green'
      : queryCostScore <= queryThr.yellow
        ? 'yellow'
        : 'red';

  // Analyze each table
  const tableResults = userTables.map((table) => {
    const issues: string[] = [];
    const expectedTable = question.expectedTables.find(
      (et) => et.type === table.type && et.name.toLowerCase() === table.name.toLowerCase()
    );

    // Check for missing required fields
    if (expectedTable) {
      const missingRequired = expectedTable.requiredFields.filter(
        (fid) => !table.fieldIds.includes(fid)
      );
      if (missingRequired.length > 0) {
        const fieldNames = missingRequired
          .map((fid) => fieldMap.get(fid)?.name || fid)
          .join(', ');
        issues.push(`Missing required fields: ${fieldNames}`);
      }

      // Check for fields that shouldn't be here
      const unexpectedFields = table.fieldIds.filter(
        (fid) =>
          !expectedTable.requiredFields.includes(fid) &&
          !expectedTable.optionalFields.includes(fid)
      );
      if (unexpectedFields.length > 0) {
        const fieldNames = unexpectedFields
          .map((fid) => fieldMap.get(fid)?.name || fid)
          .join(', ');
        if (table.type === 'fact') {
          issues.push(`Consider moving to dimension: ${fieldNames}`);
        } else {
          issues.push(`Unexpected fields: ${fieldNames}`);
        }
      }
    }

    // Warn about high-cardinality fields in fact tables
    if (table.type === 'fact') {
      const highCardFields = table.fieldIds.filter(
        (fid) => fieldMap.get(fid)?.cardinality === 'high'
      );
      if (highCardFields.length > 0) {
        const fieldNames = highCardFields
          .map((fid) => fieldMap.get(fid)?.name || fid)
          .join(', ');
        issues.push(`High-cardinality fields in Fact table increase storage: ${fieldNames}`);
      }
    }

    return {
      tableName: table.name,
      tableType: table.type,
      fieldCount: table.fieldIds.length,
      feedback: expectedTable?.feedback || '',
      issues,
    };
  });

  // Check for unassigned fields
  const assignedFieldIds = new Set(userTables.flatMap((t) => t.fieldIds));
  const unassignedFields = question.fields.filter((f) => !assignedFieldIds.has(f.id));

  // Generate overall feedback
  let overallFeedback = '';
  if (storageStatus === 'red' && queryCostStatus === 'red') {
    overallFeedback =
      'Both storage and query costs are too high. Consider a more balanced approach.';
  } else if (storageStatus === 'red') {
    overallFeedback =
      'Storage cost is too high. Try moving some fields from Fact tables to Dimensions.';
  } else if (queryCostStatus === 'red') {
    overallFeedback =
      'Query cost is too high due to many JOINs. Consider denormalizing some dimensions.';
  } else if (storageStatus === 'green' && queryCostStatus === 'green') {
    overallFeedback = 'Excellent! Your model balances storage and query performance well.';
  } else {
    overallFeedback = 'Good effort! There\'s room for optimization.';
  }

  if (unassignedFields.length > 0) {
    overallFeedback += ` Note: ${unassignedFields.length} field(s) not assigned to any table.`;
  }

  const passed = storageStatus !== 'red' && queryCostStatus !== 'red';

  return {
    passed,
    storageScore: Math.round(storageScore),
    queryCostScore: Math.round(queryCostScore),
    maxStorageScore: storageThr.yellow * 1.5,
    maxQueryCostScore: queryThr.yellow * 1.5,
    storageStatus,
    queryCostStatus,
    tableResults,
    overallFeedback,
  };
}
