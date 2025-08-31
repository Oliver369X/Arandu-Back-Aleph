import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School AI - Educational Platform API',
      version: '1.0.0',
      description: 'API documentation for School AI - A hyper-personalized educational platform with AI integration',
      contact: {
        name: 'School AI Support',
        email: 'support@schoolai.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api-v1',
        description: 'Development server'
      },
      {
        url: 'https://api.schoolai.com/api-v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/components/**/*.swagger.js',
    './src/components/**/*.routes.js',
    './src/components/**/*.controllers.js',
    './src/services/**/*.swagger.js',
    // Rutas específicas para asegurar que se carguen
    './src/components/user/user.swagger.js',
    './src/components/role/role.swagger.js',
    './src/components/subject/subject.swagger.js',
    './src/components/aiFeedback/aiFeedback.swagger.js',
    './src/components/AI/aiWritingAssistant.swagger.js',
    './src/components/progress/progress.swagger.js',
    './src/components/AIGame/aiGame.swagger.js',
    './src/services/auth/auth.swagger.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 