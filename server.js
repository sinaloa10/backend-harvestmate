const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

// Ruta básica de prueba
app.get('/', (req, res) => {
    res.send('ESTE ES EL API REST DE HARVESTMATE');
});



const apiKey = 'R0g54xQ8yB';

// Endpoint to fetch weather data from Meteomatics API
app.get('/api/weather', async (req, res) => {
    const lat = req.query.lat || 35.6895;
    const lon = req.query.lon || 139.6917;
    const date = req.query.date || '2023-10-06';
    const url = `https://api.meteomatics.com/weather?lat=${lat}&lon=${lon}&date=${date}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


app.get('/BD', (req, res) => {
    res.send('datito');
});

// Escuchar en el puerto definido
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
