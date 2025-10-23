export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // O caminho que o usuário deseja buscar da API CoinGecko.
    // ex.: se a solicitação for para https://.../coins/markets, o pathname será /coins/markets
    const apiPath = url.pathname.substring(1); // remove a barra inicial '/'
    const queryString = url.search; // ex.: ?vs_currency=usd&ids=...

    // Obtém a chave de API dos segredos de ambiente.
    const apiKey = env.COINGECKO_API_KEY;

    // Manipula OPTIONS para preflight de CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
              'Access-Control-Max-Age': '86400',
            },
        });
    }

    if (!apiKey) {
      return new Response('A chave de API não está configurada.', { status: 500 });
    }

    const targetUrl = `https://api.coingecko.com/api/v3/${apiPath}${queryString}`;

    try {
      const apiRequest = new Request(targetUrl, {
        method: request.method,
        headers: { 'User-Agent': 'Cloudflare-Worker-Proxy/1.0' },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
        redirect: 'follow'
      });

      apiRequest.headers.set('x-cg-demo-api-key', apiKey);

      const response = await fetch(apiRequest);

      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      return new Response(`Erro ao buscar da CoinGecko: ${error.message}`, { status: 500 });
    }
  },
};