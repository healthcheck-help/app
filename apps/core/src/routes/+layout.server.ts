export function load({ url, locals }) {
  return {
    version: "0.0.1",
    path: url.pathname,
    session: locals.session,
  };
}
