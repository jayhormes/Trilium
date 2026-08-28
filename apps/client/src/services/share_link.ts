/**
 * Builds the browser-openable URL for a shared note.
 *
 * Precedence: an explicitly configured sync server wins; otherwise the desktop
 * renderer uses the server-injected loopback origin (`glob.httpBaseUrl`) because it
 * loads from `trilium-app://`, where location-based derivation would yield an unusable
 * `trilium-app://app/share/...` link (#10589); everywhere else we derive from the page
 * origin (which is correct for the server build and for a browser hitting the desktop).
 */
export function buildShareLink(shareId: string, syncServerHost: string | null | undefined): string {
    if (syncServerHost) {
        return appendSharePath(syncServerHost, shareId);
    }

    if (window.glob.httpBaseUrl) {
        return appendSharePath(window.glob.httpBaseUrl, shareId);
    }

    return appendSharePath(location.href, shareId);
}

// `new URL("/share/x", base)` cannot stand in here: the leading slash makes the path absolute
// and drops the base's own path, which an instance reverse-proxied under a subpath needs.
function appendSharePath(base: string, shareId: string): string {
    const url = new URL(base);

    url.search = "";
    url.hash = "";
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/share/${shareId}`;

    return url.href;
}
