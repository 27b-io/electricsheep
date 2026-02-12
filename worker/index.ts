/**
 * Electric Sheep — Worker entry point
 *
 * Serves static assets (Zola output) with API routes for future features.
 */

interface Env {
  ASSETS: Fetcher;
  AUDIO: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Audio files from R2
    if (url.pathname.startsWith('/audio/')) {
      return handleAudio(url, env);
    }

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

async function handleAudio(url: URL, env: Env): Promise<Response> {
  // Strip /audio/ prefix
  const key = url.pathname.replace(/^\/audio\//, '');

  try {
    const object = await env.AUDIO.get(key);

    if (!object) {
      return new Response('Audio file not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'audio/mpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Accept-Ranges', 'bytes');

    // CORS for audio streaming
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(`R2 fetch failed: ${key}`, err);
    return new Response('Internal server error', { status: 500 });
  }
}

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
