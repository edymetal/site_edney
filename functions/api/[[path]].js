export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // No Pages Functions com [[path]].js, o subcaminho pode ser extraído do pathname.
  // Se a função está em /functions/api/[[path]].js, ela responde a /api/*
  // O apiPath que queremos para a CoinGecko deve remover o prefixo /api/
  const apiPath = url.pathname.replace(/^\/api\//, '');

  // Se o caminho estiver vazio ou apenas /api/, a solicitação é para a raiz.
  if (apiPath === "" || apiPath === "api") {
    return new Response('Bem-vindo ao proxy da API CoinGecko. Forneça um caminho de API válido. Exemplo: /api/coins/markets', {
      status: 400, // Bad Request
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const queryString = url.search;

  const apiKey = env.COINGECKO_API_KEY;

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
}