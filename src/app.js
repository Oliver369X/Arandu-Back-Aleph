import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import http from 'http';
import { specs, swaggerUi } from './config/swagger.js';
// Blockchain services
import AranduContractService from './services/AranduContractService.js';
import BlockchainEventService from './services/BlockchainEventService.js';

export class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001; // Usamos un solo puerto
    this.server = http.createServer(this.app); // Usamos el servidor HTTP compartido
    this.routerMain = "/api-v1"; 

    // Configuración de Socket.IO
   /* this.io = new socketio(this.server, {
      cors: {
        origin: "http://localhost:3000", // La URL del cliente React
        methods: ["GET", "POST"]
      }
    });*/
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'School AI Documentation'
    }));
    
    this.app.use(this.routerMain, router);
  }

  configureSockets() {
  //  new Sockets(this.io);
  }

  async initializeBlockchain() {
    try {
      console.log('🔗 Initializing blockchain services...');
      
      // Initialize ARANDU contracts
      await AranduContractService.initialize();
      console.log('✅ ARANDU contracts initialized');
      
      // Start blockchain event listening
      await BlockchainEventService.startEventListening();
      console.log('✅ Blockchain event listening started');
      
    } catch (error) {
      console.error('❌ Failed to initialize blockchain services:', error.message);
      console.warn('⚠️ Server will continue without blockchain features');
    }
  }

  async execute() {
    this.middlewares();
   // this.configureSockets();

    // Initialize blockchain services
    await this.initializeBlockchain();

    // Iniciamos el servidor HTTP que manejará tanto la API como los WebSockets
    this.server.listen(this.port, () => {
      console.log(`🚀 ARANDU Backend running on port ${this.port}`);
      console.log(`📚 API documentation available at http://localhost:${this.port}/api-docs`);
      console.log(`🔗 Blockchain integration: ${AranduContractService.contracts ? 'Active' : 'Inactive'}`);
      console.log(`🎧 Event listening: ${BlockchainEventService.isListening ? 'Active' : 'Inactive'}`);
    });
  }
}
