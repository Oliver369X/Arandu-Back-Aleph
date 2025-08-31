import { body, query } from 'express-validator';

/**
 * Validation for batch grant rewards
 */
export const validateBatchGrantRewards = [
  body('rewards')
    .isArray({ min: 1 })
    .withMessage('Rewards must be a non-empty array'),
    
  body('rewards.*.walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required for each reward')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Each wallet address must be a valid Ethereum address'),
    
  body('rewards.*.amount')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Amount must be between 0.1 and 1000 for each reward'),
    
  body('rewards.*.isStreak')
    .optional()
    .isBoolean()
    .withMessage('isStreak must be a boolean'),
    
  body('rewards.*.reason')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Reason must be a string with max 200 characters')
];

/**
 * Validation for anchor report
 */
export const validateAnchorReport = [
  body('reportData')
    .isObject()
    .withMessage('Report data must be an object'),
    
  body('reportType')
    .optional()
    .isString()
    .isIn(['education_report', 'audit_report', 'system_report', 'compliance_report'])
    .withMessage('Report type must be one of: education_report, audit_report, system_report, compliance_report'),
    
  body('reportData.title')
    .notEmpty()
    .withMessage('Report title is required')
    .isString()
    .isLength({ min: 5, max: 200 })
    .withMessage('Report title must be between 5 and 200 characters'),
    
  body('reportData.description')
    .notEmpty()
    .withMessage('Report description is required')
    .isString()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Report description must be between 10 and 1000 characters'),
    
  body('reportData.data')
    .isObject()
    .withMessage('Report data.data must be an object'),
    
  body('reportData.generatedAt')
    .optional()
    .isISO8601()
    .withMessage('Generated date must be a valid ISO 8601 date')
];

/**
 * Validation for retry failed transactions
 */
export const validateRetryFailedTransactions = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50')
];

/**
 * Validation for get blockchain events
 */
export const validateGetBlockchainEvents = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
    
  query('contractAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Contract address must be a valid Ethereum address'),
    
  query('eventName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Event name must be between 1 and 50 characters')
];

/**
 * Validation for bulk issue certificates
 */
export const validateBulkIssueCertificates = [
  body('certificates')
    .isArray({ min: 1 })
    .withMessage('Certificates must be a non-empty array'),
    
  body('certificates.*.studentWalletAddress')
    .notEmpty()
    .withMessage('Student wallet address is required for each certificate')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Each student wallet address must be a valid Ethereum address'),
    
  body('certificates.*.courseName')
    .notEmpty()
    .withMessage('Course name is required for each certificate')
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
    
  body('certificates.*.description')
    .notEmpty()
    .withMessage('Description is required for each certificate')
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
    
  body('certificates.*.title')
    .optional()
    .isString()
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be between 5 and 150 characters'),
    
  body('certificates.*.completionDate')
    .optional()
    .isISO8601()
    .withMessage('Completion date must be a valid ISO 8601 date')
];

/**
 * Validation for admin authentication (middleware)
 */
export const validateAdminRole = [
  // This would typically check JWT token and admin role
  // For now, it's a placeholder
  body('adminToken')
    .optional()
    .isString()
    .withMessage('Admin token must be a string')
];

/**
 * Validation for manual badge grant
 */
export const validateManualBadgeGrant = [
  body('studentWalletAddress')
    .notEmpty()
    .withMessage('Student wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Student wallet address must be a valid Ethereum address'),
    
  body('badgeName')
    .notEmpty()
    .withMessage('Badge name is required')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('Badge name must be between 3 and 50 characters'),
    
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

/**
 * Validation for system maintenance operations
 */
export const validateSystemMaintenance = [
  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['sync_users', 'cleanup_events', 'update_cache', 'verify_contracts'])
    .withMessage('Operation must be one of: sync_users, cleanup_events, update_cache, verify_contracts'),
    
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object')
];
