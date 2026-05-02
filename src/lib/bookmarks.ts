const KEY = "ssn_bookmarks_v1";

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().includes(id);
}

export function toggleBookmark(id: string): boolean {
  const cur = new Set(getBookmarks());
  let added: boolean;
  if (cur.has(id)) {
    cur.delete(id);
    added = false;
  } else {
    cur.add(id);
    added = true;
  }
  localStorage.setItem(KEY, JSON.stringify([...cur]));
  window.dispatchEvent(new Event("ssn:bookmarks"));
  return added;
}
