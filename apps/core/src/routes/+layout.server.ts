import pkg from "../../package.json";

export function load({ url, locals }) {
  return {
    version: pkg.version,
    path: url.pathname,
    session: locals.session,
  };
}
