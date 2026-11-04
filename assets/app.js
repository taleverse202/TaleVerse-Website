
const FEATHER='<svg viewBox="0 0 64 64" fill="none" stroke="#c9a24b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M52 6C30 8 14 24 12 46l-6 12 4-1 8-9c20-1 34-16 34-42z" fill="#c9a24b22"/><path d="M12 46C24 34 36 22 52 6M24 40l10-1M30 32l10-1M37 24l9-2"/></svg>';

const ICONS={
  Facebook:'M14 8V6c0-1 .3-1.5 1.6-1.5H17V1h-2.8C11 1 10 3 10 5.5V8H7.5v3.5H10V23h4V11.5h2.8L17 8z',
  Instagram:'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM17.5 6a1 1 0 110 2 1 1 0 010-2z',
  TikTok:'M16 2h-3.2v13a2.8 2.8 0 11-2.8-2.8c.3 0 .6 0 .8.1V9.1A6 6 0 1016 15V8.5A7 7 0 0020 10V6.8A4 4 0 0116 2z',
  'Game Jolt':'M3 9h18v9a3 3 0 01-3 3H6a3 3 0 01-3-3zm3 2v3h2v2h2v-2h2v-3zm9 1.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM9 3h6l1 4H8z'
};

const $=(s,r=document)=>r.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>/^https?:\/\//.test(u||'')?esc(u):'#';
const load=n=>fetch('/content/'+n+'.json').then(r=>{
  if(!r.ok) throw new Error('Could not load '+n);
  return r.json();
});
const img=(src,alt)=>src?`<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`:FEATHER;
const fmt=d=>new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

function gameCard(g,feat){
  return `<article class="card${feat?' featured':''}">
    <div class="img">${img(g.cover,g.title+' cover')}</div>
    <div class="body">
      <h3>${esc(g.title)}</h3>
      <span class="meta">${esc(g.genre)} — ${esc(g.status)}</span>
      <p>${esc(g.description)}</p>
      <p>${esc(g.format)}. ${esc(g.chapters)}</p>
      <a class="btn solid" href="${safeUrl(g.link)}" target="_blank" rel="noopener">${esc(g.button_label||'Play now')}</a>
    </div>
  </article>`;
}

function newsCard(a,i){
  return `<article class="card">
    <div class="img">${img(a.cover,a.title)}</div>
    <div class="body">
      <span class="meta">${fmt(a.date)}</span>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.summary)}</p>
      <button class="btn" data-i="${i}">Read article</button>
    </div>
  </article>`;
}

function renderPrivacy(policy){
  const container=$('#privacy-content');
  if(!container) return;

  const title=policy.title||'Privacy Policy';
  const updated=policy.last_updated;
  const intro=policy.introduction||'';

  document.title=title+' | TaleVerse';

  const sections=(policy.sections||[]).map((section,i)=>`
    <h2>${esc(section.heading||'')}</h2>
    ${String(section.body||'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('')}
  `).join('');

  container.innerHTML=`
    <section>
      <h1>${esc(title)}</h1>
      ${updated?`<p class="meta">Last updated: ${esc(fmt(updated))}</p>`:''}
      ${intro?`<p>${esc(intro).replace(/\n/g,'<br>')}</p>`:''}
      ${sections}
      ${policy.contact_text?`<h2>Contact Us</h2><p>${esc(policy.contact_text).replace(/\n/g,'<br>')} <a href="contact.html">Contact Page</a>.</p>`:''}
    </section>
  `;
}

async function init(){
  const [site,gd,nw,privacy]=await Promise.all([
    load('site'),
    load('games'),
    load('news'),
    load('privacy')
  ]);

  document.querySelectorAll('.logo').forEach(e=>e.innerHTML=FEATHER);

  document.querySelectorAll('[data-site]').forEach(e=>{
    e.textContent=site[e.dataset.site]||'';
  });

  const soc=site.socials.map(s=>
    `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}" title="${esc(s.name)}"><svg viewBox="0 0 24 24"><path d="${ICONS[s.name]||ICONS['Game Jolt']}"/></svg></a>`
  ).join('');

  document.querySelectorAll('.socials').forEach(e=>e.innerHTML=soc);

  const games=gd.games;
  const news=[...nw.articles].sort((a,b)=>new Date(b.date)-new Date(a.date));

  const fg=$('#featured-games');
  if(fg){
    const f=games.filter(g=>g.featured);
    fg.innerHTML=(f.length?f:games.slice(0,2)).map((g,i)=>gameCard(g,i===0)).join('');
  }

  const ag=$('#all-games');
  if(ag) ag.innerHTML=games.map(g=>gameCard(g,false)).join('');

  const nl=$('#news-list');
  if(nl){
    const lim=nl.dataset.limit?+nl.dataset.limit:99;
    nl.innerHTML=news.slice(0,lim).map(newsCard).join('');

    const dlg=$('#article');
    nl.addEventListener('click',e=>{
      const b=e.target.closest('button');
      if(!b) return;
      const a=news[b.dataset.i];

      dlg.innerHTML=`<button class="btn" onclick="this.closest('dialog').close()">Close</button>${a.cover?`<p><img src="${esc(a.cover)}" alt=""></p>`:''}<h2>${esc(a.title)}</h2><span class="meta">${fmt(a.date)}</span>${String(a.body).split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('')}${a.link?`<p><a class="btn" href="${safeUrl(a.link)}" target="_blank" rel="noopener">${esc(a.link_label||'Learn more')}</a></p>`:''}`;

      dlg.showModal();
    });
  }

  renderPrivacy(privacy);

  const f=$('#contact-form');
  if(f){
    f.access_key.value=site.form_access_key;
    f.addEventListener('submit',async e=>{
      e.preventDefault();
      const s=$('#status');
      s.textContent='Sending…';

      try{
        const r=await fetch(site.form_endpoint,{
          method:'POST',
          headers:{Accept:'application/json'},
          body:new FormData(f)
        });
        const j=await r.json();

        if(j.success){
          f.reset();
          f.access_key.value=site.form_access_key;
          s.textContent='Message sent. Thank you — we will reply by email.';
        }else throw 0;
      }catch{
        s.textContent='Message not sent. Check your connection and try again.';
      }
    });
  }
}

init().catch(error=>console.error('TaleVerse error:',error));
