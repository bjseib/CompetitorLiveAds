const categories = [
  { value: 'online_casino', label: 'Online Casino' },
  { value: 'online_sportsbook', label: 'Online Sportsbook' },
  { value: 'sweepstakes_social', label: 'Sweepstakes/Social Casino' },
  { value: 'dfs', label: 'DFS' }
];

const publisherGroups = {
  'Online Casino': [
    'Caesars Palace Online Casino',
    'FanDuel Casino',
    'BetMGM Casino',
    'DraftKings Casino',
    'BetRivers Casino',
    'Betfred Casino',
    'Golden Nugget Casino',
    'Bet365 Casino',
    'PointsBet Casino',
    'Sugarhouse Casino',
    'Hard Rock Casino',
    'Betway Casino',
    'Wild Casino',
    'Barstool Casino & Sportsbook',
    'Ignition Casino'
  ],
  'Online Sportsbook': [
    'Caesars Sportsbook',
    'FanDuel Sportsbook',
    'DraftKings Sportsbook',
    'BetMGM Sportsbook',
    'BetRivers Sportsbook',
    'Betfred Sportsbook',
    'Bet365 Sportsbook',
    'PointsBet Sportsbook',
    'Barstool Sportsbook',
    'Tipico Sportsbook'
  ],
  'Sweepstakes/Social Casino': [
    'Chumba Casino',
    'WOW Vegas',
    'McLuck',
    'Fortune Coins',
    'Pulsz',
    'Zynga',
    'Jackpocket',
    'Gold Lounge Casino & Spa',
    'Bally Social Casino'
  ],
  DFS: [
    'DraftKings DFS',
    'FanDuel DFS',
    'Underdog Fantasy',
    'Prize Picks',
    'Chalkboard',
    'Monkey Knife Fight',
    'OwnersBox',
    'No House Advantage'
  ]
};

const mockAds = [
  {
    page_name: 'FanDuel Sportsbook',
    ad_creation_time: '2024-01-18T15:35:22+0000',
    ad_body: 'Bet $5 and get $150 in bonus bets. New customers only. Terms apply.',
    ad_creative_link_title: 'Live In-Play Betting',
    ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=999999',
    impressions: '10K-20K',
    spend: '$2K-$3K',
    publisher_platforms: ['facebook', 'instagram'],
    demographic_distribution: [{ country: 'US' }]
  },
  {
    page_name: 'BetMGM Casino',
    ad_creation_time: '2024-02-01T09:10:00+0000',
    ad_body: 'Try our exclusive slots with a $50 deposit match.',
    ad_creative_link_title: 'Slots & Table Games',
    ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=888888',
    impressions: '5K-10K',
    spend: '$800-$1K',
    publisher_platforms: ['facebook'],
    demographic_distribution: [{ country: 'US' }]
  },
  {
    page_name: 'Chumba Casino',
    ad_creation_time: '2024-01-28T12:05:00+0000',
    ad_body: 'Play free sweepstakes slots for real cash prizes.',
    ad_creative_link_title: 'Sweeps Cash Prizes',
    ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=777777',
    impressions: '15K-30K',
    spend: '$1K-$2K',
    publisher_platforms: ['instagram'],
    demographic_distribution: [{ country: 'US' }]
  }
];

const includedCategories = new Set();
const excludedCategories = new Set();

const activeFiltersEl = document.getElementById('activeFilters');
const categorySelect = document.getElementById('categorySelect');
const includeSelect = document.getElementById('includeSelect');
const addFilterBtn = document.getElementById('addFilter');
const publisherListEl = document.getElementById('publisherList');
const fetchAdsBtn = document.getElementById('fetchAds');
const loadMockBtn = document.getElementById('loadMock');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const tokenInput = document.getElementById('tokenInput');
const limitInput = document.getElementById('limitInput');
const searchInput = document.getElementById('searchTerms');

function init() {
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    categorySelect.appendChild(option);
  });

  renderPublisherSelectors();
  renderActiveFilters();
  hydrateToken();
}

function hydrateToken() {
  const saved = localStorage.getItem('graph_token');
  if (saved) tokenInput.value = saved;
}

function renderPublisherSelectors() {
  publisherListEl.innerHTML = '';
  Object.entries(publisherGroups).forEach(([group, publishers]) => {
    const card = document.createElement('div');
    card.className = 'publisher-card';

    const heading = document.createElement('h3');
    heading.textContent = group;
    card.appendChild(heading);

    publishers.forEach((name) => {
      const id = `${group}-${name}`.replace(/\s+/g, '-').toLowerCase();
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = name;
      checkbox.id = id;
      checkbox.name = 'publisher';

      label.setAttribute('for', id);
      label.appendChild(checkbox);
      const text = document.createElement('span');
      text.textContent = name;
      label.appendChild(text);

      card.appendChild(label);
    });

    publisherListEl.appendChild(card);
  });
}

function renderActiveFilters() {
  activeFiltersEl.innerHTML = '';
  if (!includedCategories.size && !excludedCategories.size) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No active category filters yet.';
    activeFiltersEl.appendChild(empty);
    return;
  }

  includedCategories.forEach((val) => {
    activeFiltersEl.appendChild(createChip(val, 'include'));
  });
  excludedCategories.forEach((val) => {
    activeFiltersEl.appendChild(createChip(val, 'exclude'));
  });
}

function createChip(value, mode) {
  const cat = categories.find((c) => c.value === value);
  const chip = document.createElement('span');
  chip.className = `chip ${mode === 'exclude' ? 'chip--exclude' : ''}`;
  chip.textContent = `${mode === 'exclude' ? 'Exclude' : 'Include'}: ${cat?.label || value}`;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.ariaLabel = `Remove ${value}`;
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    if (mode === 'exclude') {
      excludedCategories.delete(value);
    } else {
      includedCategories.delete(value);
    }
    renderActiveFilters();
  });
  chip.appendChild(removeBtn);
  return chip;
}

function addCategoryFilter() {
  const value = categorySelect.value;
  const mode = includeSelect.value;
  if (!value) return;

  if (mode === 'include') {
    includedCategories.add(value);
    excludedCategories.delete(value);
  } else {
    excludedCategories.add(value);
    includedCategories.delete(value);
  }
  renderActiveFilters();
}

function getSelectedPublishers() {
  return Array.from(document.querySelectorAll('input[name="publisher"]:checked')).map((i) => i.value);
}

function computeCategoryForPublisher(name) {
  const entry = Object.entries(publisherGroups).find(([, publishers]) => publishers.includes(name));
  if (!entry) return 'Uncategorized';
  return entry[0];
}

function status(message, variant = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.variant = variant;
}

async function fetchAdsFromMeta() {
  const token = tokenInput.value.trim();
  const limit = Math.min(Number(limitInput.value) || 25, 100);
  const searchTerms = searchInput.value.trim();
  const publishers = getSelectedPublishers();

  if (!token) {
    status('Add a Meta Graph API token to run a live query.', 'error');
    return [];
  }

  localStorage.setItem('graph_token', token);
  status('Requesting ads from the Meta Graph API...');

  const terms = publishers.length ? publishers.join(', ') : (searchTerms || 'real money gaming');
  const params = new URLSearchParams({
    access_token: token,
    ad_reached_countries: JSON.stringify(['US']),
    fields: [
      'ad_creation_time',
      'ad_snapshot_url',
      'ad_creative_bodies',
      'ad_creative_link_titles',
      'bylines',
      'page_name',
      'publisher_platforms',
      'impressions',
      'spend',
      'demographic_distribution'
    ].join(','),
    search_terms: terms,
    ad_active_status: 'ALL',
    limit: String(limit)
  });

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/ads_archive?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Graph API responded with ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data.data)) {
      throw new Error('Graph API response missing data array');
    }
    status(`Received ${data.data.length} ads from Meta.`);
    return data.data.map(normalizeAd);
  } catch (err) {
    console.error(err);
    status(`Live request failed: ${err.message}. Showing mock data instead.`, 'error');
    return mockAds.map(normalizeAd);
  }
}

function normalizeAd(ad) {
  return {
    page_name: ad.page_name || 'Unknown publisher',
    ad_creation_time: ad.ad_creation_time,
    ad_body: Array.isArray(ad.ad_creative_bodies) ? ad.ad_creative_bodies[0] : ad.ad_body || '',
    ad_creative_link_title: Array.isArray(ad.ad_creative_link_titles) ? ad.ad_creative_link_titles[0] : ad.ad_creative_link_title,
    ad_snapshot_url: ad.ad_snapshot_url,
    impressions: ad.impressions || 'n/a',
    spend: ad.spend || 'n/a',
    publisher_platforms: ad.publisher_platforms || [],
    demographic_distribution: ad.demographic_distribution || []
  };
}

function passesCategoryFilters(publisherName) {
  const category = computeCategoryForPublisher(publisherName);
  const key = categories.find((c) => c.label === category)?.value;

  if (excludedCategories.size && key && excludedCategories.has(key)) return false;
  if (includedCategories.size && key && !includedCategories.has(key)) return false;
  if (includedCategories.size && !key) return false;
  return true;
}

function groupAdsByPublisher(ads) {
  return ads.reduce((acc, ad) => {
    if (!passesCategoryFilters(ad.page_name)) return acc;

    const publisher = ad.page_name || 'Unknown';
    if (!acc[publisher]) {
      acc[publisher] = { category: computeCategoryForPublisher(publisher), ads: [] };
    }
    acc[publisher].ads.push(ad);
    return acc;
  }, {});
}

function renderAds(grouped) {
  resultsEl.innerHTML = '';
  const publishers = Object.keys(grouped);

  if (!publishers.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No ads found for the current filters.';
    resultsEl.appendChild(empty);
    return;
  }

  publishers.sort().forEach((publisher) => {
    const { category, ads } = grouped[publisher];
    const section = document.createElement('div');
    section.className = 'publisher-section';

    const header = document.createElement('h3');
    const title = document.createElement('span');
    title.textContent = publisher;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = category;
    header.appendChild(title);
    header.appendChild(tag);
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'ads-grid';

    ads.forEach((ad) => {
      const card = document.createElement('article');
      card.className = 'ad-card';

      const timestamp = document.createElement('p');
      timestamp.className = 'timestamp';
      timestamp.textContent = ad.ad_creation_time
        ? new Date(ad.ad_creation_time).toLocaleString()
        : 'Unknown start date';
      card.appendChild(timestamp);

      const body = document.createElement('p');
      body.className = 'ad-body';
      body.textContent = ad.ad_body || 'No body copy available.';
      card.appendChild(body);

      if (ad.ad_snapshot_url) {
        const img = document.createElement('img');
        img.src = `${ad.ad_snapshot_url}&redirect=0`;
        img.alt = 'Ad snapshot';
        img.loading = 'lazy';
        img.className = 'snapshot';
        card.appendChild(img);
      }

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `Impressions: ${ad.impressions} • Spend: ${ad.spend}`;
      card.appendChild(meta);

      const links = document.createElement('div');
      links.className = 'links';

      const platforms = document.createElement('span');
      platforms.className = 'badge';
      platforms.textContent = (ad.publisher_platforms || []).join(', ') || 'Unknown platform';
      links.appendChild(platforms);

      if (ad.ad_snapshot_url) {
        const anchor = document.createElement('a');
        anchor.href = ad.ad_snapshot_url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = 'Open snapshot';
        links.appendChild(anchor);
      }

      card.appendChild(links);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    resultsEl.appendChild(section);
  });
}

function withLoading(fn) {
  return async () => {
    fetchAdsBtn.disabled = true;
    loadMockBtn.disabled = true;
    fetchAdsBtn.textContent = 'Loading...';
    try {
      const ads = await fn();
      const grouped = groupAdsByPublisher(ads);
      renderAds(grouped);
    } finally {
      fetchAdsBtn.disabled = false;
      loadMockBtn.disabled = false;
      fetchAdsBtn.textContent = 'Fetch live ads';
    }
  };
}

addFilterBtn.addEventListener('click', addCategoryFilter);
fetchAdsBtn.addEventListener('click', withLoading(fetchAdsFromMeta));
loadMockBtn.addEventListener(
  'click',
  withLoading(async () => {
    status('Showing mock data for quick preview.');
    return mockAds.map(normalizeAd);
  })
);

document.addEventListener('DOMContentLoaded', init);
