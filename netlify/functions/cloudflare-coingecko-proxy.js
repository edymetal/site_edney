export default {
    async fetch(request, env, ctx) {
        const COINGECKO_API_KEY = env.COINGECKO_API_KEY;
        const API_BASE_URL = 'https://api.coingecko.com/api/v3';

        if (!COINGECKO_API_KEY) {
            return new Response(JSON.stringify({ error: 'COINGECKO_API_KEY not set in Cloudflare Worker environment variables.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const url = new URL(request.url);
        const path = url.pathname;
        const queryString = url.search;

        const endpoint = path.replace('/.netlify/functions/coingecko-proxy', ''); // Remove o prefixo da função
        
        let coingeckoUrl = `${API_BASE_URL}${endpoint}${queryString}`;
        if (!coingeckoUrl.includes('x_cg_demo_api_key')) {
            coingeckoUrl += `${queryString ? '&' : '?'}x_cg_demo_api_key=${COINGECKO_API_KEY}`;
        }

        console.log('Fetching CoinGecko URL:', coingeckoUrl);

        try {
            const response = await fetch(coingeckoUrl);
            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error fetching from CoinGecko:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    },
};
