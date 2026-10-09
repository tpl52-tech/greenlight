  const S = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICON = {
    check: S('<path d="M5 12.5l4 4 10-10.5"/>'),
    x: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    flag: S('<path d="M5 21V4M5 4.5h11l-2.2 4 2.2 4H5"/>'),
    info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.2"/>'),
    back: S('<path d="M15 5l-7 7 7 7"/>'),
    sun: S('<circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M4.3 4.3l1.7 1.7M18 18l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.3 19.7L6 18M18 6l1.7-1.7"/>'),
    moon: S('<path d="M20.5 14.8A8.3 8.3 0 1 1 9.2 3.5a6.6 6.6 0 0 0 11.3 11.3z"/>'),
  };
  const PEOPLE = {
    'Enaika Kishnani':'#0071e3', 'Hyunsuh':'#af52de', 'Kenan Tat':'#ff9500',
    'Willow Chen':'#34c759', 'Neha Bommireddy':'#ff2d55', 'Lahari Bandaru':'#5e5ce6',
  };
  const avaFor = (color, ch, cls='ava') => `<span class="${cls}" style="background:${color}">${escapeHtml(ch)}</span>`;
  const avaHTML = (name, cls='ava') => avaFor(PEOPLE[name] || '#8e8e93', (name || '?')[0], cls);

  // The QA testers (the non-technical team). Which one "you" are is a per-viewer choice saved in this browser.
  const TESTERS = [
    { id:'renee', name:'Renee', color:'#ff9500' },
    { id:'dana',  name:'Dana',  color:'#0071e3' },
  ];
  const testerById = id => TESTERS.find(t => t.id === id);
  const testerName = id => (testerById(id) || {}).name || id; // display name, else the raw id (escaped at render)
  const verdictCredit = r => r.verdict && r.verdictBy ? ' · recorded by ' + escapeHtml(testerName(r.verdictBy)) + (r.verdictAt ? ' ' + timeAgo(r.verdictAt) : '') : '';
  let me = null; // this viewer's tester id

  // ReUse App — Fall 2026; the queue is the project's `manual-qa`-labeled sub-issues.
  const PROJECT_UUID = 'ee39f4b9-275e-40c1-a55e-1ead80ec5a94';
  const LINEAR_SERVER = 'Linear';

  // ---------- baked run sheets (resting state; refreshed from Linear) ----------
  const INITIAL_TICKETS = [
    {
      id:'COR-91', parent:'COR-17', comp:'Search', milestone:'Phase 1a — Search & Home', assignee:'Unassigned',
      priority:'normal', labels:['manual-qa'], url:'https://linear.app/cornell-ewb-softdev/issue/COR-91/qa-verify-search-screen-results-list',
      title:'Search screen: results list',
      summary:'The Search tab shows a live results list from the database — typing filters results, each card shows image, title, condition stars and price, with proper loading, empty and no-match states.',
      pre:[
        'Signed in, with the app running on your phone in Expo Go.',
        'The database has seeded items (Home shows items). If Home says "No items available," tell the lead to seed items first.',
      ],
      steps:[
        { n:1, title:'Open Search, before typing', do:['Tap the Search tab and look at the screen before you type anything.'],
          expect:'A suggested / browse state shows — not a blank screen.' },
        { n:2, title:'Type a matching query', do:['Type a word from an item you know exists on Home.'],
          expect:'The list filters live to matching items as you type — results come from the database, not a fixed list.',
          failif:'Results never change, or the same items show no matter what you type.' },
        { n:3, title:'Check a result card', do:['Look closely at one result card.'],
          expect:'Image on the left; title, condition stars and price on the right, matching the Figma. Price shows the price and stars show the condition — not swapped.',
          failif:'Price and stars are swapped, or a field is missing.' },
        { n:4, title:'Type fast, then search for nothing', do:['Type several characters quickly, then change the query to something that matches no items.'],
          expect:'No stale results flash in (a slower earlier response never overwrites a newer one), and a friendly "no results" state appears.',
          failif:'Older results flicker back in, or you get a blank or error screen.' },
        { n:5, title:'Loading and errors', do:['Watch the moment right after you type. If you can, turn on airplane mode and search once.'],
          expect:'A spinner shows while results load; with no network you get a readable error state, not a crash.' },
      ],
    },
    {
      id:'COR-93', parent:'COR-19', comp:'Home', milestone:'Phase 1a — Search & Home', assignee:'Unassigned',
      priority:'normal', labels:['manual-qa'], url:'https://linear.app/cornell-ewb-softdev/issue/COR-93/qa-verify-home-item-sections-from-real-data',
      title:'Home: item sections from real data',
      summary:'The Home tab renders its Recommended/Deals and New Additions sections from the database — no mock data — with price and condition shown correctly, plus loading and empty states.',
      pre:['Signed in, with the app running in Expo Go.', 'The database has seeded active items.'],
      steps:[
        { n:1, title:'Sections render from real data', do:['Open the Home tab.'],
          expect:'The Recommended/Deals and New Additions sections fill with real items from the database.',
          failif:'You see placeholder / mock items, or the old hardcoded list.' },
        { n:2, title:'Price and condition are correct (the bug fix)', do:['Pick an item and check its price and its stars against what you expect.'],
          expect:'Price shows the price and stars show the condition — the two are not swapped (the old condition-as-price bug is gone).',
          failif:'The price looks like a 1–5 number, or the stars track the price.' },
        { n:3, title:'Loading state', do:['Reopen Home or pull to refresh and watch the first moment.'],
          expect:'A loading indicator shows while items fetch, then content replaces it.' },
        { n:4, title:'Empty state', do:['If you can, view Home with no active items (ask the lead to clear them).'],
          expect:'A friendly empty state shows — not a blank screen or a crash.' },
      ],
    },
    {
      id:'COR-94', parent:'COR-54', comp:'Components', milestone:'Phase 1a — Search & Home', assignee:'Unassigned',
      priority:'normal', labels:['manual-qa'], url:'https://linear.app/cornell-ewb-softdev/issue/COR-94/qa-verify-conditionstars-1-5-star-rating',
      title:'ConditionStars: 1–5 star rating component',
      summary:'A reusable 1–5 star rating that renders an item’s condition — "condition" stars filled out of five — matching the Figma, and never crashing on missing or out-of-range input.',
      pre:['Signed in, with Home or Search showing items that span a range of condition values.'],
      steps:[
        { n:1, title:'Stars match the data', do:['Find an item whose condition you know, or compare a few cards.'],
          expect:'Exactly that many of 5 stars are filled (condition 4 → ★★★★☆); the rest are empty.',
          failif:'The wrong number is filled, or all 5 are always filled.' },
        { n:2, title:'Matches the Figma style', do:['Compare a card’s stars to the Figma star style.'],
          expect:'Filled and empty stars match the design — same glyph, size and color feel.' },
        { n:3, title:'Bad input doesn’t crash', do:['Find or ask the lead to seed an item with no condition or an out-of-range value.'],
          expect:'It clamps to a sensible default and still renders — no crash, no "NaN", no blank.',
          failif:'The card crashes, shows a red error, or renders garbage.' },
        { n:4, title:'Consistent everywhere', do:['Compare the same item’s stars on Home vs Search.'],
          expect:'Identical rendering in both places — it’s one shared component.' },
      ],
    },
    {
      id:'COR-95', parent:'COR-23', comp:'Auth', milestone:'Phase 1b — Auth', assignee:'Unassigned',
      priority:'normal', labels:['manual-qa'], url:'https://linear.app/cornell-ewb-softdev/issue/COR-95/qa-verify-login-screen-sign-in',
      title:'Login screen → sign-in',
      summary:'The Login screen signs a user in with email and password, lands on the home tabs, shows human error messages for bad credentials, presents SSO as "coming soon", and keeps the session across an app restart.',
      pre:['A seeded test account (email + password) from the lead.', 'The app running in Expo Go, signed out.'],
      steps:[
        { n:1, title:'Successful sign-in', do:['Enter the test email and password, then tap Sign In.'],
          expect:'You land on the home tabs within a second or two.', failif:'It hangs on a spinner, or shows a raw error.' },
        { n:2, title:'Wrong password', do:['Sign out, then enter the right email with a wrong password.'],
          expect:'A clear, human message ("Incorrect password" style) — not a raw Firebase code like auth/wrong-password.',
          failif:'A raw Firebase error code shows, or nothing happens.' },
        { n:3, title:'No such account', do:['Try to sign in with an email that has no account.'],
          expect:'A friendly "no account found" style message.' },
        { n:4, title:'SSO buttons', do:['Look at the Google and Facebook buttons.'],
          expect:'They’re visible but disabled, labeled "coming soon".', failif:'They’re missing, or tapping one does something.' },
        { n:5, title:'Session survives a restart', do:['While signed in, fully close the app and reopen it.'],
          expect:'You’re still signed in and land on home — no need to log in again.', failif:'You’re kicked back to the login screen.' },
      ],
    },
    {
      id:'COR-96', parent:'COR-35', comp:'Favorites', milestone:'Phase 3 — Profile & notifications', assignee:'Unassigned',
      priority:'normal', labels:['manual-qa'], url:'https://linear.app/cornell-ewb-softdev/issue/COR-96/qa-verify-favorites-heart-toggle-list',
      title:'Favorites — heart toggle + Favorited Items list',
      summary:'Tapping a heart favorites an item, it shows up in the Favorites tab, un-tapping removes it, and favorites survive an app reload. Everything here is visible on screen — no database poking.',
      pre:[
        'Be signed in — favorites are per-user, and a signed-out app shows none.',
        'The Home tab must show items. If Home says "No items available," stop and tell the lead to seed items first — there’s nothing to favorite.',
      ],
      headsup:'The ticket text says "Profile › Favorited Items," but the shipped build put it as its own "Favorites" tab (heart icon) in the bottom bar. Look there, not under Profile.',
      steps:[
        { n:1, title:'Find the hearts',
          do:['Open the Home tab (house icon, bottom-left).', 'Scroll to the "New Additions" row. Each item card has a small heart in a dark circle, top-right of the photo.'],
          expect:'All hearts start as a white outline — not filled.' },
        { n:2, title:'Favorite an item',
          do:['Tap the heart on one card, and note the item’s name.'],
          expect:'The heart immediately turns solid red — no lag, no reload needed.',
          failif:'Nothing happens, or it flips red then snaps back to outline (a failed save reverting).' },
        { n:3, title:'See it in the Favorites tab',
          do:['Tap the Favorites tab (heart icon, bottom center-left).'],
          expect:'The heading reads "Favorited Items," and the item you just hearted appears in the two-column grid with its heart red.',
          failif:'The grid is empty, or the item is missing.' },
        { n:4, title:'Favorite a few more, confirm they stack up',
          do:['Go back to Home, tap hearts on 2 more cards, then return to Favorites.'],
          expect:'All three items are now in the grid.' },
        { n:5, title:'Un-favorite, confirm it disappears',
          do:['In the Favorites grid, tap a red heart.', 'Go to Home and find that same item.'],
          expect:'The heart goes to outline and the card drops out of the grid — and on Home the same item’s heart is now outline too (the two screens stay in sync).',
          failif:'It still shows red on Home, or still sits in the Favorites grid.' },
        { n:6, title:'The empty state',
          do:['Un-favorite everything.'],
          expect:'Favorites shows "No favorited items yet."' },
        { n:7, title:'Persistence across a reload (the important one)',
          do:['Favorite 2 items.', 'Fully close the app (swipe it away in Expo Go / force-quit), then reopen it.'],
          expect:'You’re still signed in, and those 2 items are still red on Home and still in the Favorites grid — proving favorites are saved to the database, not just held in memory.',
          failif:'Favorites are gone after reopening.' },
      ],
    },
  ];
  const BAKED = Object.fromEntries(INITIAL_TICKETS.map(t => [t.id, t]));
  let tickets = INITIAL_TICKETS.slice();
  const ticketById = id => tickets.find(t => t.id === id);

  // ---------- run state ----------
  // runs[ticketId] = { pre:{}, steps:{}, notes:{}, verdict }. Shared via `db`; local fallback.
  let db = null;           // db capability namespace, or null
  let dbWritable = true;   // flips false if a well-formed write is rejected at runtime
  let canWrite = null;     // user.can('data.write'): null = unknown (stay optimistic), false = read-only
  let serverRuns = {};     // latest snapshot from db (stays {} in local-only mode)
  let pending = {};        // id -> { 'steps.1':'pass', 'pre.0':true, 'notes.2':'…', 'verdict':'fail' } — writes not yet confirmed by the server
  let runs = {};           // render view = serverRuns deep-merged with the pending overlay
  let dbNote = '';         // transient "couldn't save" notice (quota full / access revoked)
  const inflight = {};     // id -> promise: serializes writes per ticket doc (one at a time)

  async function getCap(name) {
    try { return window.claude && window.claude.use ? await window.claude.use(name) : null; }
    catch (e) { return null; }
  }
  const readOnly = () => canWrite === false || (!!db && !dbWritable);

  const EMPTY_RUN = Object.freeze({ pre: Object.freeze({}), steps: Object.freeze({}), notes: Object.freeze({}), verdict: undefined });
  function readRun(id) { // read-only view for render + status; never creates or mutates state
    const r = runs[id];
    return r ? { pre: r.pre || {}, steps: r.steps || {}, notes: r.notes || {}, verdict: r.verdict, verdictBy: r.verdictBy, verdictAt: r.verdictAt } : EMPTY_RUN;
  }
  function applyPath(obj, path, val) { const [a, b] = path.split('.'); if (b === undefined) obj[a] = val; else { obj[a] = obj[a] || {}; obj[a][b] = val; } }
  function atPath(obj, path) { const [a, b] = path.split('.'); const v = obj ? obj[a] : undefined; return b === undefined ? v : (v ? v[b] : undefined); }
  function patchObj(patch) { const out = {}; for (const path in patch) applyPath(out, path, patch[path]); return out; } // flat {path:val} -> one nested-merge object for update()
  function rebuildRuns() { // merge the pending overlay over the server snapshot
    const merged = {};
    new Set([...Object.keys(serverRuns), ...Object.keys(pending)]).forEach(id => {
      const base = serverRuns[id] ? JSON.parse(JSON.stringify(serverRuns[id])) : {};
      base.pre = base.pre || {}; base.steps = base.steps || {}; base.notes = base.notes || {};
      const p = pending[id] || {};
      for (const path in p) applyPath(base, path, p[path]);
      merged[id] = base;
    });
    runs = merged;
  }

  function loadLocalRuns() { try { const s = JSON.parse(localStorage.getItem('cueqa-pending-v4') || 'null'); if (s && typeof s === 'object') pending = s; } catch (e) {} rebuildRuns(); }
  function saveLocalRuns() { try { localStorage.setItem('cueqa-pending-v4', JSON.stringify(pending)); } catch (e) {} }

  // Record a change (one or more fields) as an optimistic overlay and send it as a single write.
  // `patch` is a flat map of path -> value: {'steps.1':'pass'}, {'pre.0':true}, or {verdict, verdictBy, verdictAt}.
  function edit(id, patch) {
    pending[id] = pending[id] || {};
    for (const k in patch) pending[id][k] = patch[k];
    dbNote = '';
    rebuildRuns();
    renderQueue(); renderSheet();
    if (db && dbWritable) persistFields(id, patch);
    else saveLocalRuns();
  }
  // The whole gesture in ONE update() (nested-merge), so a verdict + who + when land atomically and writes to
  // a ticket never overlap (chained on inflight[id]). set() only to create the doc. The pending overlay keeps
  // the edit visible across snapshots until the server confirms it (then onSnapshot drops it).
  function persistFields(id, patch, retried) {
    if (!db || !dbWritable) { saveLocalRuns(); return; } // bridge may have died before a scheduled retry fired
    inflight[id] = Promise.resolve(inflight[id]).catch(() => {}).then(() => writeFields(id, patch, retried));
    return inflight[id];
  }
  const patchStillPending = (id, patch) => !!pending[id] && Object.keys(patch).every(k => pending[id][k] === patch[k]);
  async function writeFields(id, patch, retried) {
    if (!db || !dbWritable) return; // may have flipped while queued; overlay keeps the edit
    const ref = db.doc('runs/' + id);
    try {
      await ref.update(Object.assign({ updatedAt: Date.now() }, patchObj(patch)));
    } catch (err) {
      const code = err && err.code;
      if (code === 'unavailable' && !retried) { // exactly one retry, jittered; the overlay keeps the edit visible meanwhile
        setTimeout(() => { if (db && dbWritable && patchStillPending(id, patch)) persistFields(id, patch, true); }, 800 + Math.random() * 800);
        return;
      }
      if (code === 'unavailable' || code === 'resource_exhausted') return; // give up — overlay stays, next edit/snapshot reconciles (resource_exhausted must never loop)
      if (code === 'quota_exceeded' || code === 'revoked') { // surface it: the tester's result did not save
        dbNote = code === 'quota_exceeded' ? 'Couldn’t save — the shared database is full. Tell the lead.' : 'Lost write access — your latest change may not have saved.';
        if (code === 'revoked') dbWritable = false;
        renderSheet(); return;
      }
      if (code !== 'invalid_argument') return;
      try { // doc missing (update needs it to exist) — or a read-only viewer. set() is a full replace, so a
            // first-write race on a brand-new doc can clobber (no transactions); rare, and self-heals on the next edit.
        const r = runs[id] || {};
        await ref.set({ pre: r.pre || {}, steps: r.steps || {}, notes: r.notes || {}, verdict: r.verdict || null, verdictBy: r.verdictBy || null, verdictAt: r.verdictAt || null, updatedAt: Date.now() });
      } catch (e2) {
        if (e2 && e2.code === 'invalid_argument') { dbWritable = false; renderAll(); } // read-only: lock the controls
      }
    }
  }

  function renderPreservingFocus() { // a snapshot mustn't destroy a note the viewer is mid-typing
    const a = document.activeElement;
    const key = (a && a.classList && a.classList.contains('step-note')) ? a.getAttribute('data-note') : null;
    const s0 = key != null ? a.selectionStart : 0, s1 = key != null ? a.selectionEnd : 0;
    renderAll();
    if (key != null) { const el = document.querySelector('.step-note[data-note="' + key + '"]'); if (el) { el.focus(); try { el.setSelectionRange(s0, s1); } catch (e) {} } }
  }

  async function initDb() {
    db = await getCap('db');
    if (!db) { loadLocalRuns(); renderAll(); return; }
    try {
      db.collection('runs').onSnapshot(
        snap => {
          const next = {};
          snap.docs.forEach(d => { if (d.exists) next[d.id] = d.data(); }); // frozen; only ever read via atPath, and rebuildRuns clones before mutating
          serverRuns = next;
          for (const id in pending) { // drop overlay entries the server now reflects
            for (const path in pending[id]) { const want = pending[id][path], got = atPath(serverRuns[id], path); if (got === want || (got == null && want == null)) delete pending[id][path]; }
            if (!Object.keys(pending[id]).length) delete pending[id];
          }
          rebuildRuns(); renderPreservingFocus();
        },
        err => { db = null; saveLocalRuns(); rebuildRuns(); renderAll(); } // any error here is terminal (incl. dead-bridge 'unavailable'); keep edits, continue local
      );
    } catch (e) { db = null; saveLocalRuns(); rebuildRuns(); renderAll(); }
  }
  async function initUser() { // learn write capability up front so read-only viewers get a read-only sheet, not reverted clicks
    const user = await getCap('user');
    if (!user || !user.can) return;
    try { canWrite = await user.can('data.write'); } catch (e) { canWrite = null; }
    if (canWrite === false) { dbWritable = false; renderAll(); }
  }

  // ---------- refresh from Linear (mcp) ----------
  let mcpCap = undefined;   // undefined=unchecked, null=unavailable, object=ready
  let refreshing = false;
  let refreshError = null;
  let lastRefreshed = null;

  function stripMd(s) {
    return String(s || '')
      .replace(/<issue[^>]*>([^<]*)<\/issue>/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_#>]/g, '').replace(/\s+/g, ' ').trim();
  }
  function cleanDesc(d) {
    if (!d) return '';
    let s = String(d).split(/\*\*Acceptance criteria/i)[0];
    s = s.replace(/\(truncated[^)]*\)/gi, '');
    s = s.split('\n').filter(l => !/^\s*[-*]\s*\[/.test(l)).join(' ');
    s = stripMd(s);
    if (s.length > 240) s = s.slice(0, 237).replace(/\s+\S*$/, '') + '…';
    return s;
  }
  function parseCriteria(d) {
    if (!d) return [];
    const out = []; const re = /[-*]\s*\[[ xX]?\]\s*(.+)/g; let m;
    while ((m = re.exec(d))) { const t = stripMd(m[1]); if (t) out.push(t); }
    return out;
  }
  // Parse the run sheet out of a manual-qa ticket's description — the format the authoring step writes:
  //   ## What "working" means / ## Before you start (bullets) / optional "> **Heads up:** …" / ## Steps with
  //   "**N. Title**" blocks whose bullets carry "✅ Expect — …" and "❌ Fail if — …". Linear is the source of truth.
  function parseRunSheet(desc) {
    if (!desc) return null;
    const text = String(desc).replace(/\r/g, '');
    const hu = text.match(/^>\s*\*\*Heads up:\*\*\s*(.+)$/mi);
    const sm = text.match(/##\s*What\s*["“]?working["”]?\s*means\s*\n+([\s\S]*?)(?=\n##\s|\n>|\n---|$)/i);
    const pb = text.match(/##\s*Before you start\s*\n+([\s\S]*?)(?=\n##\s|\n---|$)/i);
    const pre = pb ? pb[1].split('\n').filter(l => /^\s*[*-]\s+/.test(l)).map(l => l.replace(/^\s*[*-]\s+/, '').trim()).filter(Boolean) : [];
    const block = text.split(/##\s*Steps\s*\n/i)[1] || '';
    const steps = []; const re = /\*\*(\d+)\.\s*(.+?)\*\*\s*\n([\s\S]*?)(?=\n\*\*\d+\.|\n##\s|\n---|$)/g; let m;
    while ((m = re.exec(block))) {
      const step = { n: steps.length + 1, title: stripMd(m[2]), do: [] }; // number/key by POSITION — an author's typed numbers can repeat
      m[3].split('\n').map(l => l.trim()).filter(l => /^[*-]\s+/.test(l)).map(l => l.replace(/^[*-]\s+/, '')).forEach(l => {
        if (/^✅\s*Expect\s*[—–-]\s*/.test(l)) step.expect = l.replace(/^✅\s*Expect\s*[—–-]\s*/, '').trim();
        else if (/^❌\s*Fail if\s*[—–-]\s*/.test(l)) step.failif = l.replace(/^❌\s*Fail if\s*[—–-]\s*/, '').trim();
        else step.do.push(l);
      });
      if (!step.expect) step.expect = 'It behaves as described.';
      steps.push(step);
    }
    if (!steps.length) return null;
    return { summary: sm ? stripMd(sm[1]).trim() : '', pre, headsup: hu ? hu[1].trim() : null, steps };
  }
  // Fallback when a ticket's description has no run-sheet structure (e.g. a plain acceptance-criteria list).
  function autoSheet(issue) {
    const crit = parseCriteria(issue.description);
    const steps = crit.length
      ? crit.map((c, i) => ({ n:i+1, title:'Acceptance check ' + (i+1), do:[], expect:c }))
      : [{ n:1, title:'Verify the feature', do:['Exercise the behavior described in the ticket.'], expect:'It works as the ticket describes.' }];
    return { summary: cleanDesc(issue.description) || issue.title, pre:['Signed in, with the app running on your phone in Expo Go.'], steps };
  }
  // Normalize Linear fields defensively: list_issues returns priority {value,name}, assignee string,
  // labels string[], parentId the parent identifier — but accept object/scalar either way.
  function personName(a) { return (a && typeof a === 'object') ? (a.name || a.displayName || a.email || null) : (a || null); }
  function labelNames(ls) { return Array.isArray(ls) ? ls.map(l => (l && typeof l === 'object') ? (l.name || '') : l).filter(Boolean) : null; }
  function priorityRank(p) { const v = (p && typeof p === 'object') ? p.value : p; return (v === 1 || v === 2) ? 'high' : 'normal'; }
  // A ticket here IS a manual-qa sub-issue; its run sheet comes from its own description (baked offline fallback).
  function buildTicket(issue) {
    const baked = BAKED[issue.id];
    const sheet = parseRunSheet(issue.description) || baked || autoSheet(issue);
    const hasPriority = issue.priority !== undefined && issue.priority !== null;
    return {
      id: issue.id,
      parent: issue.parentId || (baked && baked.parent) || null,
      title: (issue.title || '').replace(/^\s*QA verify:\s*/i, '').trim() || (baked && baked.title) || issue.id,
      comp: (baked && baked.comp) || 'Manual QA',
      milestone: (issue.projectMilestone && issue.projectMilestone.name) || (baked && baked.milestone) || '',
      assignee: personName(issue.assignee) || (baked && baked.assignee) || 'Unassigned',
      priority: hasPriority ? priorityRank(issue.priority) : ((baked && baked.priority) || 'normal'),
      labels: labelNames(issue.labels) || (baked && baked.labels) || [],
      url: issue.url || (baked && baked.url) || '#',
      summary: sheet.summary, pre: sheet.pre || [], headsup: sheet.headsup, steps: sheet.steps,
    };
  }
  const byPriority = (a, b) => (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1);

  // Which tickets a tester should work is decided upstream (the sweep classifies ui/backend/mixed and a
  // `manual-qa` sub-issue is authored for the screen-testable ones). Cue QA just lists the manual-qa tickets —
  // no in-app classification. Keep only the active ones (a Done/Canceled sub-issue is off the queue).
  const QA_LABEL = 'manual-qa'; // the one marker the whole pipeline agrees on
  const isActiveManualQa = i => (labelNames(i.labels) || []).includes(QA_LABEL) && i.statusType !== 'completed' && i.statusType !== 'canceled';

  function errText(code) {
    switch (code) {
      case 'nocap': case 'not_granted': case 'capability_disabled':
      case 'server_not_connected': return 'Connect Linear in claude.ai → Settings → Connectors, then refresh.';
      case 'needs_reauth': return 'Reconnect Linear in claude.ai → Settings → Connectors.';
      case 'selection_required': return 'Choose which Linear connector to use, then refresh.';
      case 'not_in_manifest': case 'consent_required': return 'Allow Linear for this page, then refresh.';
      case 'blocked_by_policy': return 'Your organization blocks the Linear connector for this page.';
      case 'tool_error': return 'Linear returned an error for that query.';
      default: return 'Couldn’t reach Linear just now — try again.';
    }
  }
  function timeAgo(t) {
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 45) return 'just now';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    return Math.round(s / 3600) + 'h ago';
  }
  async function refreshTickets() {
    if (refreshing) return;
    if (mcpCap === undefined) mcpCap = await getCap('mcp');
    if (!mcpCap) { refreshError = 'nocap'; renderStatus(); return; }
    refreshing = true; refreshError = null; renderStatus();
    try {
      // The queue is the project's active `manual-qa` tickets. Filter by label SERVER-side so none falls off a
      // later page; list_issues truncates descriptions, so fetch each full body with get_issue before parsing.
      const res = await mcpCap.callTool(LINEAR_SERVER, 'list_issues',
        { project: PROJECT_UUID, label: QA_LABEL, limit: 100 });
      const payload = res && res.payload;
      const issues = payload && (payload.issues || (Array.isArray(payload) ? payload : null));
      if (!Array.isArray(issues)) throw { code: 'tool_error' }; // unexpected shape: keep current list, show error
      const active = issues.filter(isActiveManualQa); // defensive (a connector ignoring `label`) + drop Done/Canceled
      const full = await Promise.all(active.map(async i => {
        try { const g = await mcpCap.callTool(LINEAR_SERVER, 'get_issue', { id: i.id }); const gp = g && g.payload; return (gp && gp.id) ? gp : i; }
        catch (e) { return i; } // get_issue unavailable/denied → keep the truncated row; buildTicket falls back to baked
      }));
      tickets = full.map(buildTicket).sort(byPriority);
      if (!ticketById(current)) current = tickets[0] ? tickets[0].id : null;
      lastRefreshed = Date.now(); refreshing = false; renderAll();
    } catch (err) {
      refreshing = false; refreshError = (err && err.code) || 'error'; renderStatus();
    }
  }

  // ---------- queue state ----------
  const FILTERS = [
    { id:'all', name:'All' }, { id:'todo', name:'To Do' },
    { id:'prog', name:'In Progress' }, { id:'done', name:'Done' },
  ];
  let queueFilter = 'all';
  let current = 'COR-96';
  let searchQ = '';

  function statusOf(id) {
    const r = readRun(id);
    if (r.verdict === 'pass') return { k:'pass', label:'Passed' };
    if (r.verdict === 'fail') return { k:'fail', label:'Failed' };
    if (r.verdict === 'blocked') return { k:'blocked', label:'Blocked' };
    const anyStep = r.steps && Object.values(r.steps).some(Boolean);
    const anyPre = r.pre && Object.values(r.pre).some(Boolean);
    return (anyStep || anyPre) ? { k:'prog', label:'In Progress' } : { k:'todo', label:'To Do' };
  }
  function inFilter(id, f) {
    const s = statusOf(id).k;
    if (f === 'all') return true;
    if (f === 'done') return s === 'pass' || s === 'fail' || s === 'blocked';
    return s === f;
  }
  function matchSearch(t) {
    if (!searchQ) return true;
    return (t.id + ' ' + t.title + ' ' + t.comp + ' ' + t.assignee).toLowerCase().includes(searchQ);
  }
  function checkedCount(t) { const r = readRun(t.id); return t.steps.filter(s => r.steps[s.n]).length; }
  const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

  // ---------- render ----------
  function renderStatus() {
    const b = document.getElementById('refreshBtn');
    b.classList.toggle('spin', refreshing);
    const el = document.getElementById('qStatus');
    el.className = 'q-status';
    if (refreshing) { el.textContent = 'Refreshing from Linear…'; return; }
    if (refreshError) { el.textContent = errText(refreshError); el.className = 'q-status err'; return; }
    if (lastRefreshed) { el.textContent = 'Updated from Linear ' + timeAgo(lastRefreshed); return; }
    if (mcpCap === null) { el.textContent = 'Connect Linear to refresh'; return; }
    el.textContent = 'Baked snapshot · tap ↻ to sync with Linear';
  }
  function renderFilters() {
    document.getElementById('qfilter').innerHTML = FILTERS.map(f => {
      const n = tickets.filter(t => inFilter(t.id, f.id)).length;
      return `<button class="fchip" data-filter="${f.id}" aria-current="${queueFilter === f.id}">${f.name}<span class="n">${n}</span></button>`;
    }).join('');
  }
  function renderQueue() {
    renderFilters();
    const list = tickets.filter(t => inFilter(t.id, queueFilter) && matchSearch(t));
    const el = document.getElementById('qList');
    const verified = tickets.filter(t => ['pass','fail','blocked'].includes(statusOf(t.id).k)).length;
    document.getElementById('qSub').textContent =
      `ReUse App — Fall 2026 · ${tickets.length} to verify · ${verified} done`;
    renderStatus();
    if (!list.length) { el.innerHTML = `<div style="color:var(--muted);font-size:14px;padding:24px 8px;text-align:center">No tickets match.</div>`; return; }
    el.innerHTML = list.map(t => {
      const st = statusOf(t.id);
      const rb = readRun(t.id);
      const done = checkedCount(t), total = t.steps.length;
      const prio = t.priority === 'high' ? '<span class="pdot" title="High priority"></span>' : '';
      const by = rb.verdict && rb.verdictBy ? ' · ' + escapeHtml(testerName(rb.verdictBy)) : '';
      return `<button class="q-card" data-id="${escapeHtml(t.id)}" aria-current="${current === t.id}">
        <div class="q-top">
          <span class="q-id">${prio}${escapeHtml(t.id)}</span>
          <span class="pill ${st.k}">${st.label}</span>
        </div>
        <div class="q-name">${escapeHtml(t.title)}</div>
        <div class="q-bottom">
          <span class="q-steps">${done}/${total} steps${by}</span>
          <span class="who">${t.parent ? '↳ ' + escapeHtml(t.parent) : ''}</span>
        </div>
      </button>`;
    }).join('');
  }

  const C = 2 * Math.PI * 40;
  function renderSheet() {
    const t = ticketById(current);
    const inner = document.getElementById('sheetInner');
    const bar = document.getElementById('verdictBar');
    if (!t) { inner.innerHTML = `<div class="empty">Select a ticket to begin.</div>`; bar.hidden = true; return; }
    const r = readRun(t.id);
    const done = checkedCount(t), total = t.steps.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const ro = readOnly();
    const url = /^https:\/\//.test(t.url || '') ? t.url : '#';

    const pre = t.pre.map((p, i) => `
      <button class="pre-row ${r.pre[i] ? 'on' : ''}" data-pre="${i}"${ro ? ' disabled' : ''}>
        <span class="pre-check">${ICON.check}</span>
        <span class="pre-text">${escapeHtml(p)}</span>
      </button>`).join('');

    const headsup = t.headsup ? `
      <div class="note-card">
        <span class="ic">${ICON.info}</span>
        <div><div class="nt-label">Heads up</div><div class="nt-body">${escapeHtml(t.headsup)}</div></div>
      </div>` : '';

    const steps = t.steps.map(s => {
      const res = r.steps[s.n];
      const doList = (s.do || []).map(d => `<li>${escapeHtml(d)}</li>`).join('');
      const expect = `<div class="crit expect"><span class="ic">${ICON.check}</span><div><span class="lbl">Expect —</span> ${escapeHtml(s.expect)}</div></div>`;
      const failif = s.failif ? `<div class="crit failif"><span class="ic">${ICON.x}</span><div><span class="lbl">Fail if —</span> ${escapeHtml(s.failif)}</div></div>` : '';
      const note = res === 'fail'
        ? `<textarea class="step-note" data-note="${s.n}"${ro ? ' readonly' : ''} placeholder="What went wrong? (note for the lead)">${escapeHtml(r.notes[s.n] || '')}</textarea>` : '';
      return `<div class="step ${res || ''}">
        <div class="step-top">
          <span class="step-n">${s.n}</span>
          <div class="step-h">${escapeHtml(s.title)}</div>
        </div>
        ${doList ? `<ul class="do">${doList}</ul>` : ''}
        ${expect}${failif}
        <div class="step-actions">
          <button class="res-btn pass ${res === 'pass' ? 'on' : ''}" data-step="${s.n}" data-res="pass"${ro ? ' disabled' : ''}>${ICON.check} Pass</button>
          <button class="res-btn fail ${res === 'fail' ? 'on' : ''}" data-step="${s.n}" data-res="fail"${ro ? ' disabled' : ''}>${ICON.x} Fail</button>
        </div>
        ${note}
      </div>`;
    }).join('');

    inner.innerHTML = `
      <button class="back" id="backBtn">${ICON.back} Queue</button>
      <div class="sh-head">
        <div style="min-width:0">
          <div class="sh-eyebrow">${escapeHtml(t.id)} · ${escapeHtml(t.comp)}${t.parent ? ' · verifying ' + escapeHtml(t.parent) : ''}</div>
          <h1 class="sh-title">${escapeHtml(t.title)}</h1>
          <div class="sh-meta">
            <span class="who"><span class="wl">Tester</span> ${avaHTML(t.assignee)} ${escapeHtml(t.assignee)}</span>
            ${t.priority === 'high' ? `<span class="prio">${ICON.flag} High</span>` : ''}
            ${t.milestone ? `<span>${escapeHtml(t.milestone)}</span>` : ''}
            ${(t.labels || []).map(l => `<span class="ltag">${escapeHtml(l)}</span>`).join('')}
            <a class="sh-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">View in Linear ↗</a>
          </div>
        </div>
        <div class="ring-wrap" role="img" aria-label="${done} of ${total} steps checked">
          <svg viewBox="0 0 92 92">
            <circle class="ring-track" cx="46" cy="46" r="40"/>
            <circle class="ring-bar" cx="46" cy="46" r="40" style="stroke-dasharray:${C};stroke-dashoffset:${C * (1 - pct / 100)}"/>
          </svg>
          <div class="ring-label"><div class="ring-pct">${done}/${total}</div><div class="ring-cap">Checked</div></div>
        </div>
      </div>

      <div class="lead"><div class="lead-label">What “working” means</div><p>${escapeHtml(t.summary)}</p></div>

      <div class="section-h">Before you start</div>
      <div class="card pre-list">${pre}</div>
      ${headsup}

      <div class="section-h">Steps</div>
      <div class="steps">${steps}</div>
    `;

    const pass = t.steps.filter(s => r.steps[s.n] === 'pass').length;
    const fail = t.steps.filter(s => r.steps[s.n] === 'fail').length;
    const roNote = ro ? ' · view-only — ask the lead for edit access to record' : '';
    bar.hidden = false;
    document.getElementById('verdictInner').innerHTML = `
      <div class="tally"><b>${pass}</b> pass · <b>${fail}</b> fail · ${done}/${total} checked${roNote}${verdictCredit(r)}${dbNote ? ' · ⚠ ' + escapeHtml(dbNote) : ''}</div>
      <span class="verdict-spacer"></span>
      <span class="verdict-label">Record result:</span>
      <button class="v-btn pass ${r.verdict === 'pass' ? 'on' : ''}" data-verdict="pass"${ro ? ' disabled' : ''}>Pass</button>
      <button class="v-btn fail ${r.verdict === 'fail' ? 'on' : ''}" data-verdict="fail"${ro ? ' disabled' : ''}>Fail</button>
      <button class="v-btn blocked ${r.verdict === 'blocked' ? 'on' : ''}" data-verdict="blocked"${ro ? ' disabled' : ''}>Blocked</button>
    `;
  }

  const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  function renderWho() {
    const btn = document.getElementById('whoBtn');
    const t = testerById(me);
    if (t) { btn.classList.remove('unset'); btn.innerHTML = avaFor(t.color, t.name[0]) + '<span>' + escapeHtml(t.name) + '</span>' + CHEV; }
    else { btn.classList.add('unset'); btn.innerHTML = '<span>Sign in</span>' + CHEV; }
    const menu = document.getElementById('whoMenu');
    if (menu.hidden) menu.innerHTML = '<div class="who-head">You are testing as</div>' + // don't rebuild (and drop focus) while it's open
      TESTERS.map(x => `<button class="who-opt" data-tester="${x.id}" aria-current="${me === x.id}">${avaFor(x.color, x.name[0])}<span>${escapeHtml(x.name)}</span><span class="check">${ICON.check}</span></button>`).join('');
  }
  function toggleWhoMenu(open) {
    const menu = document.getElementById('whoMenu'), btn = document.getElementById('whoBtn');
    const show = open === undefined ? menu.hidden : open;
    menu.hidden = !show; btn.setAttribute('aria-expanded', String(show));
    if (show) { const first = menu.querySelector('.who-opt'); if (first) first.focus(); }
  }

  function renderAll() { renderQueue(); renderSheet(); updateThemeBtn(); renderWho(); }

  // ---------- interactions ----------
  function selectTicket(id) {
    current = id;
    document.getElementById('workspace').setAttribute('data-view', 'detail');
    renderQueue(); renderSheet();
    const sc = document.querySelector('.sheet-scroll'); if (sc) sc.scrollTop = 0;
  }

  document.body.addEventListener('click', e => {
    if (e.target.closest('#whoBtn')) { toggleWhoMenu(); return; }
    const whoOpt = e.target.closest('.who-opt');
    if (whoOpt) { me = whoOpt.getAttribute('data-tester'); try { localStorage.setItem('cueqa-me', me); } catch (e2) {} toggleWhoMenu(false); renderWho(); return; }
    if (!e.target.closest('.who-wrap')) toggleWhoMenu(false); // click anywhere else closes the menu, then falls through
    if (e.target.closest('#refreshBtn')) { refreshTickets(); return; }
    const qc = e.target.closest('.q-card');
    if (qc) { selectTicket(qc.getAttribute('data-id')); return; }
    const fc = e.target.closest('.fchip');
    if (fc) { queueFilter = fc.getAttribute('data-filter'); renderQueue(); return; }
    if (e.target.closest('#backBtn')) { document.getElementById('workspace').setAttribute('data-view', 'list'); return; }

    if (readOnly()) return; // controls render disabled; this guards the data-editing branches only
    const pre = e.target.closest('.pre-row');
    if (pre) { const i = pre.getAttribute('data-pre'); edit(current, { ['pre.' + i]: !readRun(current).pre[i] }); return; }
    const rb = e.target.closest('.res-btn');
    if (rb) { const n = rb.getAttribute('data-step'), v = rb.getAttribute('data-res'); edit(current, { ['steps.' + n]: readRun(current).steps[n] === v ? null : v }); return; }
    const vb = e.target.closest('.v-btn');
    if (vb) {
      if (!me) { toggleWhoMenu(true); return; } // record who's signing off before a verdict
      const v = vb.getAttribute('data-verdict'), nv = readRun(current).verdict === v ? null : v;
      edit(current, { verdict: nv, verdictBy: nv ? me : null, verdictAt: nv ? Date.now() : null });
      return;
    }
  });

  let noteTimer = null;
  document.body.addEventListener('input', e => {
    const nt = e.target.closest('.step-note');
    if (nt) { // overlay the note locally without a re-render (keeps focus/caret), persist debounced
      if (readOnly()) return;
      const id = current, n = nt.getAttribute('data-note'), val = nt.value;
      (pending[id] = pending[id] || {})['notes.' + n] = val; rebuildRuns();
      clearTimeout(noteTimer); noteTimer = setTimeout(() => { if (db && dbWritable) persistFields(id, { ['notes.' + n]: val }); else saveLocalRuns(); }, 500);
    }
  });

  document.getElementById('search').addEventListener('input', e => { searchQ = e.target.value.trim().toLowerCase(); renderQueue(); });

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function updateThemeBtn() { document.getElementById('themeBtn').innerHTML = currentTheme() === 'dark' ? ICON.sun : ICON.moon; }
  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('cueqa-theme', next); } catch (e) {}
    updateThemeBtn();
  });

  document.addEventListener('keydown', e => { // Escape closes the identity menu and returns focus to its button
    if (e.key === 'Escape' && !document.getElementById('whoMenu').hidden) { toggleWhoMenu(false); document.getElementById('whoBtn').focus(); }
  });

  // ---------- boot ----------
  try { const th = localStorage.getItem('cueqa-theme'); if (th === 'dark' || th === 'light') document.documentElement.setAttribute('data-theme', th); } catch (e) {}
  try { const m = localStorage.getItem('cueqa-me'); if (testerById(m)) me = m; } catch (e) {}
  renderAll();
  initDb();
  initUser();
  getCap('mcp').then(c => { mcpCap = c; renderStatus(); });
