import { resolve, sep } from "node:path";

export function resolveStaticPath(rootDir, pathname) {
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decodedPathname.includes("\0")) return null;

  const root = resolve(rootDir);
  const relativePath = decodedPathname.replace(/^\/+/, "");
  const resolvedPath = resolve(root, relativePath);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;

  if (resolvedPath !== root && !resolvedPath.startsWith(rootPrefix)) {
    return null;
  }

  return resolvedPath;
}
