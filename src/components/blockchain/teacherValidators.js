import { body, param } from 'express-validator';

/**
 * Validation for teacher verification
 */
export const validateVerifyTeacher = [
  body('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isUUID()
    .withMessage('Teacher ID must be a valid UUID'),
    
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address'),
    
  body('credentials')
    .isObject()
    .withMessage('Credentials must be an object'),
    
  body('credentials.education')
    .notEmpty()
    .withMessage('Education credentials are required')
    .isString()
    .withMessage('Education must be a string'),
    
  body('credentials.experience')
    .notEmpty()
    .withMessage('Experience credentials are required')
    .isString()
    .withMessage('Experience must be a string'),
    
  body('credentials.specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array')
];

/**
 * Validation for getting teacher dashboard
 */
export const validateGetTeacherDashboard = [
  param('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address')
];

/**
 * Validation for granting student reward
 */
export const validateGrantStudentReward = [
  param('teacherWalletAddress')
    .notEmpty()
    .withMessage('Teacher wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Teacher wallet address must be a valid Ethereum address'),
    
  body('studentWalletAddress')
    .notEmpty()
    .withMessage('Student wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Student wallet address must be a valid Ethereum address'),
    
  body('rewardType')
    .notEmpty()
    .withMessage('Reward type is required')
    .isIn(['tokens', 'badge'])
    .withMessage('Reward type must be either "tokens" or "badge"'),
    
  body('amount')
    .if(body('rewardType').equals('tokens'))
    .notEmpty()
    .withMessage('Amount is required for token rewards')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Amount must be between 0.1 and 1000'),
    
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

/**
 * Validation for issuing certificate
 */
export const validateIssueCertificate = [
  param('teacherWalletAddress')
    .notEmpty()
    .withMessage('Teacher wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Teacher wallet address must be a valid Ethereum address'),
    
  body('studentWalletAddress')
    .notEmpty()
    .withMessage('Student wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Student wallet address must be a valid Ethereum address'),
    
  body('courseName')
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
    
  body('courseDescription')
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Course description must be between 10 and 500 characters'),
    
  body('completionDate')
    .optional()
    .isISO8601()
    .withMessage('Completion date must be a valid ISO 8601 date')
];

/**
 * Validation for teacher registration
 */
export const validateRegisterTeacher = [
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
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('credentials')
    .isObject()
    .withMessage('Credentials must be an object'),
    
  body('credentials.education')
    .notEmpty()
    .withMessage('Education credentials are required'),
    
  body('credentials.experience')
    .notEmpty()
    .withMessage('Experience credentials are required')
];

/**
 * Validation for updating teacher profile
 */
export const validateUpdateTeacherProfile = [
  param('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isUUID()
    .withMessage('Teacher ID must be a valid UUID'),
    
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
    
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be at most 500 characters'),
    
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
    
  body('walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address')
];
