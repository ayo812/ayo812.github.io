const state = {
  unit: localStorage.getItem('wx-unit') || 'F',
  feed: 'national',
  weatherPayload: null
};

const ui = {
  locationName: document.getElementById('locationName'),
  currentTemp: document.getElementById('currentTemp'),
  conditionText: document.getElementById('conditionText'),
  feelsLike: document.getElementById('feelsLike'),
  updatedAt: document.getElementById('updatedAt'),
  hourlyList: document.getElementById('hourlyList'),
  tenDayList: document.getElementById('tenDayList'),
  layerSummary: document.getElementById('layerSummary'),
  gearList: document.getElementById('gearList'),
  alertCard: document.getElementById('alertCard'),
  newsStatus: document.getElementById('newsStatus'),
  headlineList: document.getElementById('headlineList'),
  unitToggle: document.getElementById('unitToggle')
};

const weatherCodeMap = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  56: 'Freezing drizzle', 57: 'Freezing drizzle', 61: 'Light rain', 63: 'Rain',
  65: 'Heavy rain', 66: 'Freezing rain', 67: 'Heavy freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Heavy showers', 82: 'Violent rain showers',
  85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail', 99: 'Severe thunderstorm'
};

const newsFeeds = {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  national: 'https://www.reddit.com/r/news/top.json?t=day&limit=10',
  nyc: 'https://www.reddit.com/r/nyc/top.json?t=day&limit=10',
  interesting: 'https://www.reddit.com/r/todayilearned/top.json?t=day&limit=10'
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
=======
  national: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  nyc: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml',
  interesting: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
>>>>>>> theirs
};

const cToF = (c) => (c * 9) / 5 + 32;
const toUnit = (c) => (state.unit === 'F' ? cToF(c) : c);
const unitMark = () => `°${state.unit}`;
const tempText = (c) => `${Math.round(toUnit(c))}${unitMark()}`;

function layerTier(feelsLikeC) {
  const val = toUnit(feelsLikeC);
  if (val < (state.unit === 'F' ? 20 : -7)) return 4;
  if (val < (state.unit === 'F' ? 35 : 2)) return 3;
  if (val < (state.unit === 'F' ? 59 : 15)) return 2;
  return 1;
}

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
function renderLayerInfo(feelsLikeC, precipProb) {
  const tier = layerTier(feelsLikeC);
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
function updateAvatar(tier, rainy) {
  document.querySelectorAll('.layer-vis').forEach((el) => el.classList.remove('active'));
  for (let i = 1; i <= tier; i += 1) {
    document.querySelector(`.layer-${i}`)?.classList.add('active');
  }
  if (rainy) document.querySelector('.rain-layer')?.classList.add('active');
}

function renderLayerInfo(feelsLikeC, precipProb) {
  const tier = layerTier(feelsLikeC);
  const rainy = precipProb > 40;
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  const gear = [];

  if (tier === 1) gear.push('Tee', 'Shorts or jeans');
  if (tier === 2) gear.push('Tee', 'Black sweater', 'Jeans');
  if (tier === 3) gear.push('Tee', 'Black sweater', 'Black puffer', 'Jeans');
  if (tier === 4) gear.push('Tee', 'Black sweater', 'Extra sweater', 'Black puffer', 'Jeans');
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  if (precipProb > 40) gear.push('Black rain coat', 'Umbrella');

  ui.layerSummary.textContent = `${tier} layer${tier > 1 ? 's' : ''} recommended (walking profile)`;
  ui.gearList.innerHTML = gear.map((g) => `<li>${g}</li>`).join('');

  document.querySelectorAll('.garment').forEach((g) => g.classList.remove('active', 'overlay'));
  ['tee', 'sweater', 'sweater2', 'puffer'].slice(0, tier).forEach((name) => {
    document.querySelector(`.garment.${name}`)?.classList.add('active');
  });
  if (precipProb > 40) document.querySelector('.garment.raincoat')?.classList.add('active', 'overlay');
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  if (rainy) gear.push('Black rain coat', 'Umbrella');

  ui.layerSummary.textContent = `${tier} layer${tier > 1 ? 's' : ''} recommended (walking profile)`;
  ui.gearList.innerHTML = gear.map((g) => `<li>${g}</li>`).join('');
  updateAvatar(tier, rainy);
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
}

function renderWeather(data, locationLabel) {
  const current = data.current_weather;
  const currentIndex = Math.max(0, data.hourly.time.indexOf(current.time));
  const feelsLike = data.hourly.apparent_temperature[currentIndex] ?? current.temperature;
  const precipProb = data.hourly.precipitation_probability[currentIndex] ?? 0;

  state.weatherPayload = { data, locationLabel, updatedAt: Date.now() };
  localStorage.setItem('wx-cache', JSON.stringify(state.weatherPayload));

  ui.locationName.textContent = locationLabel;
  ui.currentTemp.textContent = tempText(current.temperature);
  ui.conditionText.textContent = weatherCodeMap[current.weathercode] || 'Conditions unavailable';
  ui.feelsLike.textContent = `Feels like ${tempText(feelsLike)} · Rain ${Math.round(precipProb)}%`;
  ui.updatedAt.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  renderLayerInfo(feelsLike, precipProb);

  const template = document.getElementById('hourTemplate');
  const frag = document.createDocumentFragment();
  ui.hourlyList.innerHTML = '';
  for (let i = 0; i < 12; i += 1) {
    const node = template.content.cloneNode(true);
    node.querySelector('.hr-time').textContent = new Date(data.hourly.time[i]).toLocaleTimeString([], { hour: 'numeric' });
    node.querySelector('.hr-temp').textContent = tempText(data.hourly.temperature_2m[i]);
    node.querySelector('.hr-rain').textContent = `Rain ${Math.round(data.hourly.precipitation_probability[i] || 0)}%`;
    frag.appendChild(node);
  }
  ui.hourlyList.appendChild(frag);

  ui.tenDayList.innerHTML = data.daily.time.slice(0, 10).map((day, idx) => {
    const label = new Date(day).toLocaleDateString([], { weekday: 'short' });
    const lo = tempText(data.daily.temperature_2m_min[idx]);
    const hi = tempText(data.daily.temperature_2m_max[idx]);
    const pop = Math.round(data.daily.precipitation_probability_max[idx] || 0);
    return `<div class="day-row"><span>${label}</span><span>${lo} / ${hi} · ${pop}%</span></div>`;
  }).join('');
}

async function fetchLocationLabel(lat, lon) {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
    url.search = new URLSearchParams({ latitude: lat, longitude: lon, language: 'en' }).toString();
    const res = await fetch(url);
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const place = data.results?.[0];
    if (!place) return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    return `${place.name}, ${place.admin1 || place.country}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
}

async function fetchWeather(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    current_weather: 'true',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,weathercode',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max'
  }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error('Open-Meteo request failed');
  return res.json();
}

async function fetchNwsAlerts(lat, lon) {
  try {
    const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
      headers: { Accept: 'application/geo+json' }
    });
    if (!res.ok) throw new Error('NWS request failed');
    const data = await res.json();
    const alert = data.features?.[0]?.properties;
    if (!alert) {
      ui.alertCard.classList.add('hidden');
      return;
    }
    ui.alertCard.classList.remove('hidden');
    const desc = alert.headline || alert.description || 'Weather alert in your area.';
    ui.alertCard.textContent = `⚠ ${alert.event}: ${desc.slice(0, 190)}`;
  } catch {
    ui.alertCard.classList.add('hidden');
  }
}

function fallbackNews(feed) {
  return {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    national: [{ title: 'Unable to load National feed right now.' }],
    nyc: [{ title: 'Unable to load NYC feed right now.' }],
    interesting: [{ title: 'Unable to load Interesting stories right now.' }]
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
=======
    national: [{ title: 'Top stories temporarily unavailable.' }],
    nyc: [{ title: 'NYC stories temporarily unavailable.' }],
    interesting: [{ title: 'Interesting stories temporarily unavailable.' }]
>>>>>>> theirs
  }[feed];
}

async function fetchNews(feed) {
  ui.newsStatus.textContent = 'Loading headlines…';
  ui.headlineList.innerHTML = '';
  try {
    const res = await fetch(newsFeeds[feed]);
    if (!res.ok) throw new Error('News request failed');
    const data = await res.json();
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    const items = data.data?.children?.slice(0, 8).map((item) => ({
      title: item.data.title,
      url: item.data.url
    })) || [];
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
    const items = (data.items || []).slice(0, 6).map((item) => ({
      title: item.title,
      url: item.link
    }));
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
    const list = items.length ? items : fallbackNews(feed);
    ui.headlineList.innerHTML = list
      .map((item) => item.url
        ? `<li><a href="${item.url}" target="_blank" rel="noreferrer noopener">${item.title}</a></li>`
        : `<li>${item.title}</li>`)
      .join('');
    ui.newsStatus.textContent = `${feed.toUpperCase()} · Updated now`;
  } catch {
    ui.headlineList.innerHTML = fallbackNews(feed).map((item) => `<li>${item.title}</li>`).join('');
    ui.newsStatus.textContent = 'Using fallback headlines';
  }
}

function loadCachedWeather() {
  const raw = localStorage.getItem('wx-cache');
  if (!raw) return false;
  try {
    const cache = JSON.parse(raw);
    renderWeather(cache.data, `${cache.locationLabel} (offline)`);
    ui.updatedAt.textContent = `Offline snapshot · ${new Date(cache.updatedAt).toLocaleString()}`;
    return true;
  } catch {
    return false;
  }
}

function bindControls() {
  ui.unitToggle.textContent = unitMark();
  ui.unitToggle.addEventListener('click', () => {
    state.unit = state.unit === 'F' ? 'C' : 'F';
    localStorage.setItem('wx-unit', state.unit);
    ui.unitToggle.textContent = unitMark();
    if (state.weatherPayload) renderWeather(state.weatherPayload.data, state.weatherPayload.locationLabel);
  });

  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.feed = btn.dataset.feed;
      document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b === btn));
      await fetchNews(state.feed);
    });
  });
}

async function init() {
  bindControls();
  await fetchNews(state.feed);

  if (!navigator.onLine) {
    loadCachedWeather();
    return;
  }

  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const { latitude, longitude } = coords;
    const [weather, label] = await Promise.all([
      fetchWeather(latitude, longitude),
      fetchLocationLabel(latitude, longitude)
    ]);
    renderWeather(weather, label);
    await fetchNwsAlerts(latitude, longitude);
  }, () => {
    if (!loadCachedWeather()) ui.locationName.textContent = 'Location blocked';
  }, { enableHighAccuracy: true, timeout: 15000 });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
init();
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
=======
init();
>>>>>>> theirs
