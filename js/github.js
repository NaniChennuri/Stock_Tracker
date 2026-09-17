// ── GITHUB API ────────────────────────────────────────────────────────────
const API = `https://api.github.com/repos/${CONFIG.github_user}/${CONFIG.github_repo}/contents/${CONFIG.data_file}`;
const HEADERS = () => ({
  Authorization: `token ${getToken()}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

async function ghLoad() {
  try {
    const res = await fetch(API, { headers: HEADERS() });
    if (!res.ok) return false;
    const json = await res.json();
    setSHA(json.sha);
    const data = JSON.parse(decodeURIComponent(escape(atob(json.content))));
    setState(data);
    return true;
  } catch(e) { return false; }
}

async function ghSave() {
  try {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(getState(), null, 2))));
    const body = { message: `update: ${new Date().toISOString().slice(0,10)}`, content };
    if (getSHA()) body.sha = getSHA();

    const res = await fetch(API, { method: 'PUT', headers: HEADERS(), body: JSON.stringify(body) });
    if (res.ok) { const j = await res.json(); setSHA(j.content.sha); return true; }

    // conflict — refresh SHA and retry once
    if (res.status === 409 || res.status === 422) {
      const check = await fetch(API, { headers: HEADERS() });
      if (check.ok) {
        const j = await check.json(); setSHA(j.sha); body.sha = j.sha;
        const retry = await fetch(API, { method: 'PUT', headers: HEADERS(), body: JSON.stringify(body) });
        if (retry.ok) { const rj = await retry.json(); setSHA(rj.content.sha); return true; }
      }
    }
    return false;
  } catch(e) { return false; }
}

async function validateToken(token) {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });
    // 200 = file exists, 404 = repo accessible but file not yet created — both mean valid token
    return res.status === 200 || res.status === 404;
  } catch(e) { return false; }
}
