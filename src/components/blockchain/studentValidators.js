import { body, param } from 'express-validator';

/**
 * Validation for completing an activity
 */
export const validateCompleteActivity = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isUUID()
    .withMessage('Student ID must be a valid UUID'),
    
  body('activityId')
    .notEmpty()
    .withMessage('Activity ID is required')
    .isString()
    .withMessage('Activity ID must be a string'),
    
  body('activityType')
    .optional()
    .isIn(['quiz', 'game', 'lesson', 'assignment'])
    .withMessage('Activity type must be one of: quiz, game, lesson, assignment'),
    
  body('answers')
    .optional()
    .isArray()
    .withMessage('Answers must be an array'),
    
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address'),
    
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be a number between 0 and 100')
];

/**
 * Validation for getting student dashboard
 */
export const validateGetStudentDashboard = [
  param('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address')
];

/**
 * Validation for getting student badges
 */
export const validateGetStudentBadges = [
  param('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address')
];

/**
 * Validation for getting student certificates
 */
export const validateGetStudentCertificates = [
  param('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address')
];

/**
 * Validation for registering student with wallet
 */
export const validateRegisterStudentWallet = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
    
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
    
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address'),
    
  body('walletType')
    .optional()
    .isIn(['web3auth', 'metamask', 'walletconnect'])
    .withMessage('Wallet type must be one of: web3auth, metamask, walletconnect'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation for updating user wallet
 */
export const validateUpdateUserWallet = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address'),
    
  body('walletType')
    .optional()
    .isIn(['web3auth', 'metamask', 'walletconnect'])
    .withMessage('Wallet type must be one of: web3auth, metamask, walletconnect')
];
