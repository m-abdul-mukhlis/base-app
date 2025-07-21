type ResultCallback<T = unknown> = (data: T) => void;
type FailedCallback = (error: Error) => void;

interface RNFile {
  uri: string;
  type?: string;
  name?: string;
}

const _send = async (url: string, opts?: RequestInit) => {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const e = new Error(res.statusText || `HTTP ${res.status}`);
    (e as any).status = res.status;
    throw e;
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
};

/* ---------- public API ---------- */
function curl(
  url: string,
  postData?: Record<string, unknown> | null,
  onResult?: ResultCallback,
  onFailed?: FailedCallback
): void {
  const isGet = postData === undefined || postData === null;
  const opts: RequestInit = isGet
    ? { method: 'GET', headers: { Accept: 'application/json' } }
    : {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    };

  _send(url, opts)
    .then(onResult ?? (() => { }))
    .catch(onFailed ?? console.error);
}

curl.upload = (
  url: string,
  image: RNFile,
  onResult?: ResultCallback,
  onFailed?: FailedCallback
): void => {
  const form = new FormData();
  form.append('image', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.name || 'image.jpg',
  } as any);

  fetch(url, { method: 'POST', body: form, headers: { Accept: 'application/json' } })
    .then(res => {
      if (!res.ok) throw new Error(res.statusText || `HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      return ct.includes('application/json') ? res.json() : res.text();
    })
    .then(onResult ?? (() => { }))
    .catch(onFailed ?? console.error);
};

export default curl;