const config = window.SLEEP_APP_CONFIG;

function formatMinutes(minutes) {
  if (minutes == null) return "--";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}時間${mins}分`;
}

function formatNumber(value, suffix) {
  return value == null ? "--" : `${Number(value).toFixed(1)}${suffix}`;
}

function renderChart(items) {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  if (!items.some(item => item.score_percent != null)) {
    chart.innerHTML = '<p class="muted">今週の記録がありません。</p>';
    return;
  }

  items.forEach(item => {
    const column = document.createElement("div");
    column.className = "chart-column";

    const valueLabel = document.createElement("span");
    valueLabel.className = "chart-value";
    valueLabel.textContent = item.score_percent == null ? "-" : item.score_percent;

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${item.score_percent ?? 0}%`;

    const day = document.createElement("span");
    day.className = "chart-day";
    day.textContent = item.date.slice(5).replace("-", "/");

    column.append(valueLabel, bar, day);
    chart.appendChild(column);
  });
}

function renderAdvice(items) {
  const container = document.getElementById("adviceList");
  container.innerHTML = "";
  items.forEach((text, index) => {
    const item = document.createElement("article");
    item.className = "advice-item";
    item.innerHTML = `<span>${index + 1}</span><p>${text}</p>`;
    container.appendChild(item);
  });
}

async function loadDashboard() {
  const errorMessage = document.getElementById("errorMessage");
  try {
    const url = new URL(`${config.apiBaseUrl}/weekly`);
    url.searchParams.set("device_id", config.deviceId);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();

    document.getElementById("weekRange").textContent =
      `${data.week_start} ～ ${data.week_end}`;
    document.getElementById("weeklyScore").textContent =
      data.weekly_score_percent ?? "--";
    document.getElementById("recordCount").textContent =
      `記録 ${data.record_count} 件`;
    document.getElementById("sleepDuration").textContent =
      formatMinutes(data.average_sleep_minutes);
    document.getElementById("temperature").textContent =
      formatNumber(data.average_temperature, "℃");
    document.getElementById("humidity").textContent =
      formatNumber(data.average_humidity, "%");

    renderChart(data.daily_scores);
    renderAdvice(data.advice);
  } catch (error) {
    console.error(error);
    errorMessage.hidden = false;
    errorMessage.textContent =
      "読み込みに失敗しました。API URLとFunction AppのCORS設定を確認してください。";
  }
}

loadDashboard();
