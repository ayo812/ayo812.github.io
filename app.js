const dataUrl = "./data/dashboard.json";

const escapeHtml = (value = "") => {
  const safeValue = value === null || value === undefined ? "" : String(value);
  return safeValue
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
};

const renderEmpty = (container) => {
  const template = document.getElementById("empty-state");
  container.replaceChildren(template.content.cloneNode(true));
};

const renderHero = (data) => {
  const hero = document.getElementById("hero");
  hero.innerHTML = `
    <div class="hero__copy">
      <p class="eyebrow">Public signal dashboard</p>
      <h1>${escapeHtml(data.publication.name)}</h1>
      <p class="hero__lede">
        ${escapeHtml(data.publication.description)}
      </p>
      <div class="tag-list">
        <span class="tag">${escapeHtml(data.publication.author)}</span>
        <span class="tag">${escapeHtml(data.overview.bestPublishingSlot)}</span>
        <span class="tag">${escapeHtml(data.overview.bestNoteSlot)}</span>
        <span class="tag">Built ${escapeHtml(data.generatedLabel)}</span>
      </div>
    </div>
  `;
};

const renderMetrics = (metrics) => {
  const container = document.getElementById("metrics");
  const items = asArray(metrics);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = items
    .map(
      (metric) => `
        <article class="metric">
          <span class="metric__label">${escapeHtml(metric.label)}</span>
          <div class="metric__value">${escapeHtml(metric.value)}</div>
          <p class="metric__detail">${escapeHtml(metric.detail)}</p>
        </article>
      `
    )
    .join("");
};

const renderTopics = (topics) => {
  const container = document.getElementById("topics");
  const items = asArray(topics);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  const maxCount = Math.max(...items.map((topic) => topic.count), 1);
  container.innerHTML = items
    .map(
      (topic, index) => `
        <div class="stack-row">
          <div class="stack-row__rank">${index + 1}</div>
          <div>
            <strong>${escapeHtml(topic.label)}</strong>
            <div
              class="stack-row__bar"
              style="width: ${Math.max(18, (topic.count / maxCount) * 100)}%;"
            ></div>
          </div>
          <div class="stack-row__value">${topic.count}</div>
        </div>
      `
    )
    .join("");
};

const renderFormats = (formats) => {
  const container = document.getElementById("formats");
  const items = asArray(formats);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = items
    .map(
      (format) => `
        <article class="format-card">
          <h3>${escapeHtml(format.label)}</h3>
          <div class="format-card__count">${format.count}</div>
          <p class="metric__detail">${escapeHtml(format.detail)}</p>
        </article>
      `
    )
    .join("");
};

const renderSuggestions = (suggestions) => {
  const container = document.getElementById("suggestions");
  const items = asArray(suggestions);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = items
    .map(
      (suggestion, index) => `
        <article class="suggestion-card">
          <div class="suggestion-card__head">
            <div>
              <p class="eyebrow">Suggestion ${index + 1}</p>
              <h3>${escapeHtml(suggestion.headline)}</h3>
            </div>
            <span class="status-pill">${escapeHtml(suggestion.bestTime)}</span>
          </div>
          <p>${escapeHtml(suggestion.reason)}</p>
          <div class="tag-list">
            <span class="tag">${escapeHtml(suggestion.format)}</span>
            <span class="tag">${escapeHtml(suggestion.targetPost)}</span>
            ${suggestion.sources
              .map((source) => `<span class="tag">${escapeHtml(source)}</span>`)
              .join("")}
          </div>
          <div class="draft" id="draft-${index}">${escapeHtml(suggestion.draft)}</div>
          <button class="copy-button" type="button" data-copy-target="draft-${index}">
            Copy note draft
          </button>
        </article>
      `
    )
    .join("");
};

const renderPosts = (posts) => {
  const container = document.getElementById("posts");
  const items = asArray(posts);
  if (!items.length) {
    container.innerHTML = `<tr><td colspan="4">No posts found.</td></tr>`;
    return;
  }

  container.innerHTML = items
    .map(
      (post) => `
        <tr>
          <td>
            <strong><a href="${escapeHtml(post.url)}" target="_blank" rel="noreferrer">${escapeHtml(post.title)}</a></strong>
            <div class="metric__detail">${escapeHtml(post.dateLabel)}</div>
          </td>
          <td>${escapeHtml(post.theme)}</td>
          <td><span class="score-pill">${post.score}</span></td>
          <td><span class="coverage-pill">${escapeHtml(post.coverage)}</span></td>
        </tr>
      `
    )
    .join("");
};

const renderCalendar = (calendar) => {
  const container = document.getElementById("calendar");
  const items = asArray(calendar);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = items
    .map(
      (slot) => `
        <article class="calendar-card">
          <h3>${escapeHtml(slot.title)}</h3>
          <p class="metric__detail">${escapeHtml(slot.detail)}</p>
        </article>
      `
    )
    .join("");
};

const renderWatchlist = (watchlist) => {
  const container = document.getElementById("watchlist");
  const items = asArray(watchlist);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = items
    .map(
      (watch) => `
        <article class="watch-card">
          <div class="watch-card__head">
            <div>
              <h3>${escapeHtml(watch.name)}</h3>
              <p class="watch-card__meta">${escapeHtml(watch.meta)}</p>
            </div>
            <span class="score-pill">${watch.signalScore}</span>
          </div>
          <ul class="watch-card__notes">
            ${watch.topNotes
              .map((note) => `<li>${escapeHtml(note)}</li>`)
              .join("")}
          </ul>
        </article>
      `
    )
    .join("");
};

const renderNotes = (notes) => {
  const container = document.getElementById("notes");
  const items = asArray(notes);
  if (!items.length) {
    renderEmpty(container);
    return;
  }

  container.innerHTML = items
    .map(
      (note) => `
        <article class="history-card">
          <div class="history-card__head">
            <div>
              <h3>${escapeHtml(note.postTitle || "Standalone note")}</h3>
              <p class="history-card__meta">${escapeHtml(note.dateLabel)} · ${escapeHtml(note.format)}</p>
            </div>
            <span class="coverage-pill">${escapeHtml(note.scoreLabel)}</span>
          </div>
          <p>${escapeHtml(note.body)}</p>
        </article>
      `
    )
    .join("");
};

const attachCopyHandlers = () => {
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) {
        return;
      }

      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Copy note draft";
        }, 1200);
      } catch {
        button.textContent = "Copy failed";
      }
    });
  });
};

const renderDashboard = (data) => {
  renderHero(data);
  renderMetrics(data.metrics);
  renderTopics(data.topicBreakdown);
  renderFormats(data.formats);
  renderSuggestions(data.suggestions);
  renderPosts(data.postLeaderboard);
  renderCalendar(data.calendar);
  renderWatchlist(data.watchlist);
  renderNotes(data.noteHistory);

  document.getElementById("build-status").textContent = data.statusLine;
  document.getElementById("refresh-command").textContent = data.refreshCommand;

  attachCopyHandlers();
};

const renderFailure = (error) => {
  document.getElementById("hero").innerHTML = `
    <div class="hero__copy">
      <p class="eyebrow">Data load failed</p>
      <h1>Dashboard snapshot is missing</h1>
      <p class="hero__lede">${escapeHtml(error.message)}</p>
    </div>
  `;
};

if (window.__DASHBOARD_SNAPSHOT__) {
  renderDashboard(window.__DASHBOARD_SNAPSHOT__);
} else {
  fetch(dataUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${dataUrl}`);
      }
      return response.json();
    })
    .then(renderDashboard)
    .catch(renderFailure);
}


