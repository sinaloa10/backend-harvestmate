const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
require('dotenv').config();


app.use(cors());


// Endpoint to fetch weather data from Meteomatics API
// Meteomatics password

const username = 'mendoza_karen'; // Meteomatics username
const password = 'R0g54xQ8yB'; // Meteomatics password

app.use(cors());

;

app.get('/api/weather', async (req, res) => {
    const lat = req.query.lat || 28.731373;
    const lon = req.query.lon || -106.136228;
    const date = req.query.date || '2023-10-06';
    const url = `https://api.meteomatics.com/${date}T00:00:00Z/t_2m:C,precip_1h:mm,wind_speed_10m:ms/${lat},${lon}/json`;

    const authHeader = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader
            }
        });
        const data = await response.json();
        const translatedData = translateWeatherData(data);
        res.json(translatedData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


// Middleware para parsear JSON
app.use(express.json());

// Ruta básica de prueba
app.get('/', (req, res) => {
    res.send('ESTE ES EL API REST DE HARVESTMATE');
});


app.get('/BD', (req, res) => {
    res.send('datito');
});

// Escuchar en el puerto definido
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

function translateWeatherData(data) {
    const weatherInfo = data.data[0].coordinates[0].dates[0];
    return {
        date: `Date: ${weatherInfo.date}`,
        temperature: `Temperature: ${weatherInfo.value} °C`,
        precipitation: `Precipitation: ${data.data[1].coordinates[0].dates[0].value} mm`,
        windSpeed: `Wind Speed: ${data.data[2].coordinates[0].dates[0].value} km/h`
    };
}
