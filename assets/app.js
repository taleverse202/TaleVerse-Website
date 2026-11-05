
const FEATHER = '<svg viewBox="0 0 64 64" fill="none" stroke="#c9a24b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M52 6C30 8 14 24 12 46l-6 12 4-1 8-9c20-1 34-16 34-42z" fill="#c9a24b22"/><path d="M12 46C24 34 36 22 52 6M24 40l10-1M30 32l10-1M37 24l9-2"/></svg>';

const ICONS = {
  Facebook: 'M14 8V6c0-1 .3-1.5 1.6-1.5H17V1h-2.8C11 1 10 3 10 5.5V8H7.5v3.5H10V23h4V11.5h2.8L17 8z',
  Instagram: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM17.5 6a1 1 0 110 2 1 1 0 010-2z',
  TikTok: 'M16 2h-3.2v13a2.8 2.8 0 11-2.8-2.8c.3 0 .6 0 .8.1V9.1A6 6 0 1016 15V8.5A7 7 0 0020 10V6.8A4 4 0 0116 2z',
  'Game Jolt': 'M3 9h18v9a3 3 0 01-3 3H6a3 3 0 01-3-3zm3 2v3h2v2h2v-2h2v-3zm9 1.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM9 3h6l1 4H8z'
};

const $ = (selector, root = document) => root.querySelector(selector);

const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

const safeUrl = url =>
  /^(https?:\/\/|\/)/i.test(url || '') ? esc(url) : '#';

const load = name =>
  fetch('/content/' + name + '.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load ' + name);
      return response.json();
    });

const img = (src, alt) =>
  src
    ? `<img src="${safeUrl(src)}" alt="${esc(alt)}" loading="lazy">`
    : FEATHER;

const fmt = date =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

/* SHARED SOCIAL ICON RENDERING */

function renderSocialLinks(socials) {
  if (!Array.isArray(socials)) return '';

  return socials.map(social => {
    const icon = ICONS[social.name] || ICONS['Game Jolt'];

    return `
      <a
        href="${safeUrl(social.url)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${esc(social.name)}"
        title="${esc(social.name)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="${icon}"/>
        </svg>
      </a>
    `;
  }).join('');
}

/* GAME CARDS */

function gameCard(game, featured) {
  return `<article class="card${featured ? ' featured' : ''}">
    <div class="img">${img(game.cover, game.title + ' cover')}</div>
    <div class="body">
      <h3>${esc(game.title)}</h3>
      <span class="meta">${esc(game.genre)} — ${esc(game.status)}</span>
      <p>${esc(game.description)}</p>
      <p>${esc(game.format)}. ${esc(game.chapters)}</p>
      <a class="btn solid" href="${safeUrl(game.link)}" target="_blank" rel="noopener">${esc(game.button_label || 'Play now')}</a>
    </div>
  </article>`;
}

/* NEWS CARDS */

function newsCard(article, index) {
  return `<article class="card">
    <div class="img">${img(article.cover, article.title)}</div>
    <div class="body">
      <span class="meta">${fmt(article.date)}</span>
      <h3>${esc(article.title)}</h3>
      <p>${esc(article.summary)}</p>
      <button class="btn" data-i="${index}">Read article</button>
    </div>
  </article>`;
}

/* YOUTUBE */

function getYouTubeEmbed(url) {
  try {
    const parsed = new URL(url);
    let id = '';

    if (parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtu.be')) {
      id = parsed.pathname.slice(1).split('/')[0];
    } else if (
      parsed.hostname === 'youtube.com' ||
      parsed.hostname.endsWith('.youtube.com')
    ) {
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v') || '';
      } else if (
        parsed.pathname.startsWith('/embed/') ||
        parsed.pathname.startsWith('/shorts/')
      ) {
        id = parsed.pathname.split('/')[2] || '';
      }
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return '';

    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return '';
  }
}

/* SHARED GAME PAGE: BEHIND TIME + HOLLOWMERE */

function renderGamePage(game) {
  if (!$('#game-title')) return;

  const title = game.title || 'TaleVerse Game';

  document.title = title + ' | TaleVerse';

  const titleElement = $('#game-title');
  const descriptionElement = $('#game-description');

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (descriptionElement) {
    descriptionElement.textContent = game.description || '';
  }

  /* VIDEO */

  const videoContainer = $('#video-content');
  const embedUrl = getYouTubeEmbed(game.youtube);

  if (videoContainer) {
    videoContainer.innerHTML = embedUrl
      ? `<iframe
          src="${esc(embedUrl)}"
          title="${esc(title)} Official Trailer"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen>
        </iframe>`
      : `<div class="video-placeholder">
          <span>▶</span>
          <p>${esc(title)} Official Trailer</p>
          <small>Promotional video coming soon</small>
        </div>`;
  }

  /* SCREENSHOTS */

  const gallery = $('#screenshot-thumbnails');
  const mainImage = $('#main-screenshot');
  const mainContainer = $('#screenshot-main');

  const screenshots = Array.isArray(game.screenshots)
    ? game.screenshots.filter(path =>
        typeof path === 'string' && path.trim()
      )
    : [];

  let currentIndex = 0;
  let slideTimer = null;
  let changing = false;

  function showScreenshot(index) {
    if (!mainImage || !gallery || changing || !screenshots.length) return;

    index = (index + screenshots.length) % screenshots.length;

    if (index === currentIndex) return;

    const path = screenshots[index];
    const preload = new Image();

    preload.onload = () => {
      changing = true;
      mainImage.classList.add('changing');

      setTimeout(() => {
        mainImage.src = path;
        mainImage.alt = `${title} screenshot ${index + 1}`;

        gallery.querySelectorAll('.screenshot-thumb').forEach((button, i) => {
          button.classList.toggle('active', i === index);
        });

        currentIndex = index;

        requestAnimationFrame(() => {
          mainImage.classList.remove('changing');
          changing = false;
        });
      }, 350);
    };

    preload.onerror = () => {
      console.error('Could not load screenshot:', path);
      changing = false;
    };

    preload.src = path;
  }

  if (gallery && mainImage) {
    gallery.innerHTML = screenshots.map((path, index) => `
      <button
        class="screenshot-thumb${index === 0 ? ' active' : ''}"
        type="button"
        data-index="${index}"
        aria-label="Show screenshot ${index + 1}">
        <img src="${safeUrl(path)}" alt="" loading="lazy">
      </button>
    `).join('');

    if (screenshots.length) {
      mainImage.src = screenshots[0];
      mainImage.alt = `${title} screenshot 1`;
    } else {
      mainImage.removeAttribute('src');
      mainImage.alt = 'No screenshots available';
    }

    gallery.addEventListener('click', event => {
      const button = event.target.closest('.screenshot-thumb');
      if (!button) return;

      showScreenshot(Number(button.dataset.index));
      startSlideshow();
    });

    function nextScreenshot() {
      if (screenshots.length > 1) {
        showScreenshot((currentIndex + 1) % screenshots.length);
      }
    }

    function startSlideshow() {
      clearInterval(slideTimer);

      if (screenshots.length > 1) {
        slideTimer = setInterval(nextScreenshot, 4000);
      }
    }

    if (mainContainer) {
      mainContainer.addEventListener('click', () => {
        if (mainImage.src) {
          window.open(mainImage.src, '_blank', 'noopener');
        }
      });
    }

    startSlideshow();
  }

  /* FEATURES */

  const featuresContainer = $('#features-list');

  if (featuresContainer) {
    featuresContainer.innerHTML = (game.features || []).map(feature => `
      <div class="feature-item">
        <h3>${esc(feature)}</h3>
      </div>
    `).join('');
  }

  /* HOW TO PLAY */

  const howToPlayContainer = $('#how-to-play-list');

  if (howToPlayContainer) {
    const steps = String(game.how_to_play || '')
      .split(/\n/)
      .map(step => step.trim())
      .filter(Boolean);

    howToPlayContainer.innerHTML = steps.map((step, index) => `
      <div class="feature-item">
        <h3>${String(index + 1).padStart(2, '0')}. ${esc(step.replace(/^\d+\.\s*/, ''))}</h3>
      </div>
    `).join('');
  }

  /* DOWNLOAD PLATFORMS */

  const platformsContainer = $('#platform-links');

  if (platformsContainer) {
    platformsContainer.innerHTML = (game.platforms || []).map((platform, index) => `
      <a class="btn${index === 0 ? ' solid' : ''}"
         href="${safeUrl(platform.url)}"
         target="_blank"
         rel="noopener noreferrer">
        ${esc(platform.name)}
      </a>
    `).join('');
  }
}

/* PRIVACY POLICY */

function renderPrivacy(policy) {
  const container = $('#privacy-content');
  if (!container) return;

  const title = policy.title || 'Privacy Policy';
  const updated = policy.last_updated;
  const intro = policy.introduction || '';

  document.title = title + ' | TaleVerse';

  const sections = (policy.sections || []).map(section => `
    <h2>${esc(section.heading || '')}</h2>
    ${String(section.body || '').split(/\n\s*\n/).filter(Boolean)
      .map(paragraph => `<p>${esc(paragraph).replace(/\n/g, '<br>')}</p>`)
      .join('')}
  `).join('');

  container.innerHTML = `
    <section>
      <h1>${esc(title)}</h1>
      ${updated ? `<p class="meta">Last updated: ${esc(fmt(updated))}</p>` : ''}
      ${intro ? `<p>${esc(intro).replace(/\n/g, '<br>')}</p>` : ''}
      ${sections}
      ${policy.contact_text
        ? `<h2>Contact Us</h2><p>${esc(policy.contact_text)} <a href="contact.html">Contact Page</a>.</p>`
        : ''}
    </section>
  `;
}

/* CONTACT PAGE */

function renderContactPage(contact) {
  const title = $('#contact-title');
  const introduction = $('#contact-intro');
  const socialsTitle = $('#contact-socials-title');

  if (title) {
    title.textContent = contact.title || 'Contact';
  }

  if (introduction) {
    introduction.textContent = contact.introduction || '';
  }

  if (socialsTitle) {
    socialsTitle.textContent = contact.socials_title || 'Follow TaleVerse';
  }

  document.title = (contact.title || 'Contact') + ' | TaleVerse';
}

/* MAIN INITIALIZATION */

async function init() {
  const [site, gameData, newsData, privacy] = await Promise.all([
    load('site'),
    load('games'),
    load('news'),
    load('privacy')
  ]);

  /* LOGO */

  document.querySelectorAll('.logo').forEach(element => {
    element.innerHTML = FEATHER;
  });

  /* SITE TEXT */

  document.querySelectorAll('[data-site]').forEach(element => {
    element.textContent = site[element.dataset.site] || '';
  });

  /* GLOBAL SOCIAL LINKS: FOOTER + CONTACT */

  const globalSocials = renderSocialLinks(site.socials || []);

  document.querySelectorAll('.socials').forEach(element => {
    element.innerHTML = globalSocials;
  });

  /* GAMES */

  const games = gameData.games || [];

  const featuredGames = $('#featured-games');

  if (featuredGames) {
    const featured = games.filter(game => game.featured);

    featuredGames.innerHTML = (featured.length ? featured : games.slice(0, 2))
      .map((game, index) => gameCard(game, index === 0))
      .join('');
  }

  const allGames = $('#all-games');

  if (allGames) {
    allGames.innerHTML = games.map(game => gameCard(game, false)).join('');
  }

  /* NEWS */

  const news = [...(newsData.articles || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const newsList = $('#news-list');

  if (newsList) {
    const limit = newsList.dataset.limit
      ? Number(newsList.dataset.limit)
      : 99;

    newsList.innerHTML = news.slice(0, limit).map(newsCard).join('');

    const dialog = $('#article');

    newsList.addEventListener('click', event => {
      const button = event.target.closest('button');

      if (!button || !dialog) return;

      const article = news[Number(button.dataset.i)];
      if (!article) return;

      dialog.innerHTML = `
        <button class="btn" onclick="this.closest('dialog').close()">Close</button>
        ${article.cover ? `<p><img src="${safeUrl(article.cover)}" alt=""></p>` : ''}
        <h2>${esc(article.title)}</h2>
        <span class="meta">${fmt(article.date)}</span>
        ${String(article.body || '').split(/\n\s*\n/)
          .map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}
        ${article.link
          ? `<p><a class="btn" href="${safeUrl(article.link)}" target="_blank" rel="noopener">${esc(article.link_label || 'Learn more')}</a></p>`
          : ''}
      `;

      dialog.showModal();
    });
  }

  /* PRIVACY */

  renderPrivacy(privacy);

  /* BEHIND TIME + HOLLOWMERE */

  const gamePage = document.body.dataset.game;

  if (gamePage === 'behind-time' || gamePage === 'hollowmere') {
    try {
      const game = await load(gamePage);
      renderGamePage(game);
    } catch (error) {
      console.error(gamePage + ' data error:', error);
    }
  }

  /* CONTACT PAGE CONTENT */

  if ($('#contact-form')) {
    try {
      const contact = await load('contact');
      renderContactPage(contact);
    } catch (error) {
      console.error('Contact page data error:', error);
    }
  }

  /* CONTACT FORM */

  const form = $('#contact-form');

  if (form) {
    form.access_key.value = site.form_access_key;

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const status = $('#status');
      status.textContent = 'Sending…';

      try {
        const response = await fetch(site.form_endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });

        const result = await response.json();

        if (result.success) {
          form.reset();
          form.access_key.value = site.form_access_key;
          status.textContent = 'Message sent. Thank you — we will reply by email.';
        } else {
          throw new Error('Message could not be sent');
        }
      } catch {
        status.textContent = 'Message not sent. Check your connection and try again.';
      }
    });
  }
}

init().catch(error => console.error('TaleVerse error:', error));
