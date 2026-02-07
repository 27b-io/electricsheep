/**
 * Electric Sheep — Worker entry point
 *
 * Serves static assets (Zola output) with API routes for future features.
 */

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API routes (future)
    if (url.pathname.startsWith('/api/')) {
      return handleApi(url, request);
    }

    // Static assets
    try {
      const response = await env.ASSETS.fetch(request);

      // Add security headers
      const headers = new Headers(response.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (err) {
      console.error(`Asset fetch failed: ${url.pathname}`, err);
      return new Response('Not Found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;

function handleApi(url: URL, request: Request): Response {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  return new Response(JSON.stringify({
    message: 'Electric Sheep API — not yet implemented',
    endpoints: {
      'GET /api/comments/:dream': 'List comments on a dream',
      'POST /api/comments/:dream': 'Add a comment (requires auth)',
    },
  }), {
    status: 501,
    headers,
  });
}
