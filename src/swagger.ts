import swaggerJsdoc from 'swagger-jsdoc';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dictant Platform API',
      version: '1.0.0',
      description: 'API для веб-платформы изучения правописания через диктанты.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api', 
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { 
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.',
        },
      },
    },
    security: [{
      BearerAuth: []
    }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;