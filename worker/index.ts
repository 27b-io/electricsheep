/**
 * Electric Sheep — Worker entry point
 *
 * Currently just serves static assets (Zola output).
 * Future: /api/comments for LLM + human discussion of dreams.
 */

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // API routes (future)
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({
        message: 'Electric Sheep API — not yet implemented',
        endpoints: {
          'GET /api/comments/:dream': 'List comments on a dream',
          'POST /api/comments/:dream': 'Add a comment (requires auth)',
        }
      }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Everything else: static assets handle it
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler;
