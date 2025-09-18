const express = require('express');
const app = express();
require('dotenv').config();
const errorHandler = require('./middlewares/errorHandler');

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./openapi.yaml'); // archivo que hicimos

app.use(express.json());

// Rutas de la API
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/follows', require('./routes/follows'));

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/status', (req, res) => {
    res.json({ status: "API running 🚀", timestamp: new Date().toISOString() });
});

// Middleware de errores
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📖 API Docs available at http://localhost:${port}/api/docs`);
});
