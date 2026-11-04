/**
 * Short identifier for the deployment serving this request. Shown in the
 * footer so "is this the new version?" is answerable by looking, rather than
 * by clearing a cache and hoping.
 */
export function buildStamp(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : "local";
}
