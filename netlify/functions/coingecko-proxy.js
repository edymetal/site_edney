const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
    const API_BASE_URL = 'https://api.coingecko.com/api/v3';

    if (!COINGECKO_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'COINGECKO_API_KEY not set in Netlify environment variables.' })
        };
    }

    const { path, queryStringParameters } = event;
    const endpoint = path.replace('/.netlify/functions/coingecko-proxy', ''); // Remove o prefixo da função
    const query = new URLSearchParams(queryStringParameters).toString();

    // Construir a URL da API do CoinGecko
    let coingeckoUrl = `${API_BASE_URL}${endpoint}?${query}`;
    if (!coingeckoUrl.includes('x_cg_demo_api_key')) {
        coingeckoUrl += `&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    }

    try {
        const response = await fetch(coingeckoUrl);
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching from CoinGecko:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};