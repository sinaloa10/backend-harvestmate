const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3001;

const username = 'mendoza_karen';
const password = 'R0g54xQ8yB';

const openai = new OpenAI();

app.use(cors());

app.get('/api/weather', async (req, res) => {
    const lat = req.query.lat || 28.731373;
    const lon = req.query.lon || -106.136228;
    const date = req.query.date || '2024-10-06';
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
        const cropSuggestion = await getCropSuggestion(translatedData);
        res.json({ weather: translatedData, suggestion: cropSuggestion });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/cultivos-get', async (req, res) => {
    try {
        // Consulta SQL para obtener todos los cultivos
        const query = 'SELECT * FROM Cultivo;';
        
        // Ejecutar la consulta
        const result = await pool.query(query);
        
        // Enviar los resultados como respuesta
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener cultivos:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener los cultivos.' });
    }
});

app.delete('/cultivos-delete/:idCultivo', async (req, res) => {
    const { idCultivo } = req.params;

    try {
        // Consulta SQL para eliminar un cultivo
        const query = 'DELETE FROM Cultivo WHERE idCultivo = $1 RETURNING *;';
        
        // Ejecutar la consulta
        const result = await pool.query(query, [idCultivo]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cultivo no encontrado.' });
        }

        // Enviar una respuesta confirmando la eliminación
        res.status(200).json({ message: 'Cultivo eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar cultivo:', error);
        res.status(500).json({ error: 'Hubo un problema al eliminar el cultivo.' });
    }
});

app.post('/cultivos-post', async (req, res) => {
    const { nombre, direccion, ciudad, pais, tipoCultivo, tamano, metodoRiego, frecuenciaRiego } = req.body;

    // Validar los datos
    if (!nombre || !tipoCultivo || !tamano || !metodoRiego || !frecuenciaRiego) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos obligatorios.' });
    }

    try {
        // Consulta SQL para insertar los datos
        const query = `
            INSERT INTO Cultivo (nombre, direccion, ciudad, pais, tipoCultivo, tamano, metodoRiego, frecuenciaRiego)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [nombre, direccion, ciudad, pais, tipoCultivo, tamano, metodoRiego, frecuenciaRiego];

        // Ejecutar la consulta
        const result = await pool.query(query, values);

        // Enviar una respuesta con los datos insertados
        res.status(201).json({ message: 'Cultivo guardado exitosamente.', cultivo: result.rows[0] });
    } catch (error) {
        console.error('Error al insertar cultivo:', error);
        res.status(500).json({ error: 'Hubo un problema al guardar el cultivo.' });
    }
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('ESTE ES EL API REST DE HARVESTMATE');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

function translateWeatherData(data) {
    const weatherInfo = data.data[0].coordinates[0].dates[0];
    return {
        date: `Date: ${weatherInfo.date}`,
        temperature: `Temperature: ${weatherInfo.value} °C`,
        precipitation: `Precipitation: ${data.data[1].coordinates[0].dates[0].value} mm`,
        windSpeed: `Wind Speed: ${(data.data[2].coordinates[0].dates[0].value * 3.6).toFixed(2)} km/h`
    };
}

async function getCropSuggestion(weatherData) {
    const prompt = `Based on the following weather data, suggest the best crop to cultivate:\n
    Temperature: ${weatherData.temperature}\n
    Precipitation: ${weatherData.precipitation}\n
    Wind Speed: ${weatherData.windSpeed}\n`;

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo-0125",
        });

        console.log('OpenAI Response:', completion.choices[0]);
        return completion.choices[0].message.content.trim();
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
        return 'Unable to provide a suggestion at this time.';
    }
}


