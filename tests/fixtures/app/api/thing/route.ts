// A Next.js route handler: no JSDoc and no explicit return type required.
export function GET(request: Request) {
  return Response.json({ path: new URL(request.url).pathname });
}
