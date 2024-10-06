// Replace with your actual API key
const apiKey = 'R0g54xQ8yB';

const lat = 35.6895; // Replace with your latitude
const lon = 139.6917; // Replace with your longitude
const date = '2023-10-06'; // Replace with your date

async function fetchWeatherData(lat, lon, date) {
    const url = `https://api.meteomatics.com/weather?lat=${lat}&lon=${lon}&date=${date}&api_key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function translateWeatherData(data) {
    return {
        date: `Date: ${data.date}`,
        location: `Location: Latitude ${data.lat}, Longitude ${data.lon}`,
        temperature: `Temperature: ${data.temperature} °C`,
        precipitation: `Precipitation: ${data.precipitation} mm`,
        windSpeed: `Wind Speed: ${data.windSpeed} km/h`,
        weatherCondition: `Weather Condition: ${data.weatherCondition}`,
    };
}

async function getWeatherInfo(lat, lon, date) {
    const weatherData = await fetchWeatherData(lat, lon, date);
    const simplifiedData = translateWeatherData(weatherData);
    console.log('Simplified Weather Data:', simplifiedData);
}

// Example usage
getWeatherInfo(lat, lon, date);