// 1. Všechna města přesně v pořadí jako v HTML
const cities = [
  { name: "Kamenka", lat: 49.73420968892261, lon: 17.796170914123223, tz: "Europe/Prague" },
  { name: "Tokio", lat: 35.6895, lon: 139.6917, tz: "Asia/Tokyo" },
  { name: "Dillí", lat: 28.6520, lon: 77.2315, tz: "Asia/Kolkata" },
  { name: "Šanghaj", lat: 31.2222, lon: 121.4581, tz: "Asia/Shanghai" },
  { name: "São Paulo", lat: -23.533773, lon: -46.625290, tz: "America/Sao_Paulo" },
  { name: "Mexico City", lat: 19.432608, lon: -99.133209, tz: "America/Mexico_City" },
  { name: "Káhira", lat: 30.057997, lon: 31.228886, tz: "Africa/Cairo" },
  { name: "Moskva", lat: 55.751667, lon: 37.617778, tz: "Europe/Moscow" },
  { name: "New York", lat: 40.7128, lon: -74.0060, tz: "America/New_York" },
  { name: "Dháka", lat: 23.7289, lon: 90.3944, tz: "Asia/Dhaka" },
  { name: "Bombaj", lat: 19.0728, lon: 72.8826, tz: "Asia/Kolkata" }
];

// 2. AKTUÁLNÍ ČAS pro každé město (běží stále)
function getCityTime(tz) {
  const now = new Date();
  return now.toLocaleString("cs-CZ", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function updateAllCityTimes() {
  document.querySelectorAll('.city-time[data-tz]').forEach(div => {
    const tz = div.getAttribute('data-tz');
    div.textContent = getCityTime(tz);
  });
}
updateAllCityTimes();
setInterval(updateAllCityTimes, 1000);

// 3. MAPOVÁNÍ POČASÍ NA BARVU PODLE LEGENDY (+ opar)
function getWeatherColor(desc) {
  desc = desc.toLowerCase();
  if (desc.includes("jasno") || desc.includes("slunečno")) return "#ffd700";
  if (desc.includes("polojasno") || desc.includes("částečně oblačno")) return "#00d0ff";
  if (desc.includes("oblačno")) return "#7ec8e3";
  if (desc.includes("zataženo")) return "#8b8b8b";
  if (desc.includes("déšť")) return "#63a4ff";
  if (desc.includes("přeháňky")) return "#4682b4";
  if (desc.includes("bouřka")) return "#9400d3";
  if (desc.includes("sníh")) return "#fffafa";
  if (
    desc.includes("mlha") ||
    desc.includes("opar") ||
    desc.includes("mist") ||
    desc.includes("haze")
  ) return "#c0c0c0";
  return "#bdbdbd";
}

function getWeatherIconClass(desc) {
  desc = desc.toLowerCase();
  if (desc.includes("slunečno") || desc.includes("jasno")) return "sunny";
  if (desc.includes("déšť")) return "rainy";
  if (desc.includes("bouřka")) return "thunder";
  if (desc.includes("sníh")) return "snowy";
  if (desc.includes("mlha")) return "foggy";
  if (desc.includes("opar") || desc.includes("mist") || desc.includes("haze")) return "misty";
  if (desc.includes("oblačno") || desc.includes("zataženo")) return "cloudy";
  return "";
}

// 5. API klíč
const apiKey = "4078c40502499b6489b8982b0930b28c";

// 6. HLAVNÍ FUNKCE – počasí, animace, overlay, pocitově, vlhkost, vítr (km/h)
function updateAllWeather() {
  cities.forEach((city, i) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=cz`)
      .then(resp => resp.json())
      .then(data => {
        const cityCards = document.querySelectorAll('.city-card');
        const card = cityCards[i];
        if (!card) return;

        const icon = data.weather[0].icon;
        const desc = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const wind = data.wind.speed;
        const windKmh = Math.round(wind * 3.6);

        const color = getWeatherColor(desc);
        card.style.setProperty('--weather-color', color + '80');
        card.style.borderColor = color;
        card.style.boxShadow = `0 0 16px 6px ${color}80,0 2px 24px 0 ${color}40,0 8px 40px 0 rgba(60,60,60,0.07)`;
        card.classList.add('animated');

        const foggy = desc.toLowerCase().includes("mlha");
        const misty = desc.toLowerCase().includes("opar") || desc.toLowerCase().includes("mist") || desc.toLowerCase().includes("haze");
        const fogOverlay = card.querySelector('.fog-overlay');
        if (fogOverlay) fogOverlay.remove();
        const mistOverlay = card.querySelector('.mist-overlay');
        if (mistOverlay) mistOverlay.remove();
        if (foggy) {
          const overlay = document.createElement('div');
          overlay.className = 'fog-overlay';
          card.appendChild(overlay);
        } else if (misty) {
          const overlay = document.createElement('div');
          overlay.className = 'mist-overlay';
          card.appendChild(overlay);
        }

        const weatherDiv = card.querySelector('.city-weather');
        if (weatherDiv) {
          const iconClass = getWeatherIconClass(desc);
          weatherDiv.innerHTML = `
            <div class="weather-main">
              <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" class="weather-icon ${iconClass}">
              <span>${temp}°C</span>
              <span class="weather-desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</span>
            </div>
            <div class="weather-badges">
              <span class="feelslike-badge" title="Pocitová teplota">Pocitově: ${feelsLike}°C</span>
              <span class="humidity-badge" title="Relativní vlhkost">Vlhkost: ${humidity}%</span>
              <span class="wind-badge" title="Rychlost větru">Vítr: ${windKmh} km/h</span>
            </div>
          `;
        }
      })
      .catch(err => {
        console.warn("Nepodařilo se načíst počasí pro", city.name, err);
      });
  });
}

updateAllWeather();
setInterval(updateAllWeather, 60 * 60 * 1000);

// -------------- MODÁLNÍ DETAIL POČASÍ PO KLIKNUTÍ --------------

// MODAL HTML + CSS (přidáme na konec <body>, pokud ještě není)
function ensureModal() {
  if (!document.getElementById("weather-modal")) {
    const modal = document.createElement("div");
    modal.id = "weather-modal";
    modal.innerHTML = `
      <div class="weather-modal-content">
        <span id="weather-modal-close">&times;</span>
        <div id="weather-modal-body">
          <div class="modal-loading">Načítám detail počasí...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Uzavření na kliknutí na křížek nebo mimo modal
    document.getElementById("weather-modal-close").onclick = () => modal.style.display = "none";
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
  }
}
ensureModal();

// CSS přidáme rovnou do <head>
function ensureModalStyle() {
  if (!document.getElementById("weather-modal-style")) {
    const style = document.createElement("style");
    style.id = "weather-modal-style";
    style.textContent = `
      #weather-modal {
        display: none; position: fixed; z-index: 99; left: 0; top: 0; width: 100vw; height: 100vh;
        background: rgba(15, 42, 56, 0.68); backdrop-filter: blur(1.5px);
      }
      .weather-modal-content {
        background: #fff;
        margin: 50px auto;
        padding: 28px 20px 23px 20px;
        border-radius: 18px;
        max-width: 510px;
        min-width: 290px;
        max-height: 84vh;
        overflow-y: auto;
        box-shadow: 0 8px 46px #12739344, 0 1.5px 6px #2a62b230;
        position: relative;
        animation: fadeIn 0.38s cubic-bezier(.77,0,.18,1);
      }
      @keyframes fadeIn { 0%{ opacity:0; transform:scale(0.96) } 100%{ opacity:1; transform:scale(1) } }
      #weather-modal-close {
        position: absolute; top: 11px; right: 16px; font-size: 2.4rem; color: #2187b2b2; font-weight: bold; cursor: pointer;
        transition: color .2s;
      }
      #weather-modal-close:hover { color: #e96d1a; }
      .modal-loading { text-align: center; color: #108; font-size: 1.14em; padding: 36px 0; }
      .forecast-hour, .forecast-day {
        display: flex; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px solid #eef1f6;
      }
      .forecast-hour:last-child, .forecast-day:last-child { border-bottom: none; }
      .forecast-hour img, .forecast-day img { width: 34px; height: 34px; }
      .forecast-main {
        font-size: 18px; font-weight: bold; margin-bottom: 7px;
      }
      .hourly-title, .daily-title { font-size: 1.13em; font-weight: 600; margin: 18px 0 6px 0; color: #138; }
      .forecast-details { font-size: 13.2px; color: #2c4560; }
      .forecast-temp { font-size: 17px; font-weight: bold; margin-right: 6px;}
      /* RESPONSIVITA PRO MOBIL */
      @media (max-width: 700px) {
        .weather-modal-content {
          max-width: 99vw;
          min-width: 0;
          margin: 8vw auto 0 auto;
          padding: 10vw 2vw 7vw 2vw;
          border-radius: 20px;
          font-size: 1em;
        }
        #weather-modal-close {
          font-size: 3.3rem;
          top: 7px;
          right: 10px;
          padding: 0 10px;
        }
      }
      @media (max-width: 430px) {
        .weather-modal-content {
          max-width: 99vw;
          min-width: 0;
          padding: 7vw 1vw 6vw 1vw;
          border-radius: 14px;
          font-size: 0.98em;
        }
        #weather-modal-close {
          font-size: 2.8rem;
          top: 4px;
          right: 4px;
          padding: 0 7px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// FUNKCE: Zobraz modal s předpovědí pro dané město (index v poli cities)
function showWeatherDetail(cityIndex) {
  ensureModal();
  ensureModalStyle();
  const modal = document.getElementById("weather-modal");
  const modalBody = document.getElementById("weather-modal-body");
  modal.style.display = "block";
  modalBody.innerHTML = `<div class="modal-loading">Načítám detail počasí...</div>`;

  const city = cities[cityIndex];

  // Hlavní fetch na One Call API 3.0 (předpověď)
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=cz`)
    .then(resp => resp.json())
    .then(data => {
      // HODINOVÁ předpověď na 24 hodin (vždy po 3h)
      let hoursHtml = '';
      const now = Date.now();
      const next24h = data.list.filter(f => (f.dt * 1000) > now && (f.dt * 1000) < now + 24 * 3600 * 1000);
      for (let h of next24h) {
        const date = new Date(h.dt * 1000);
        hoursHtml += `
          <div class="forecast-hour">
            <span>${date.getHours().toString().padStart(2, '0')}:00</span>
            <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png" alt="${h.weather[0].description}">
            <span class="forecast-temp">${Math.round(h.main.temp)}°C</span>
            <span>${h.weather[0].description.charAt(0).toUpperCase() + h.weather[0].description.slice(1)}</span>
            <span class="forecast-details">
              Pocitově: ${Math.round(h.main.feels_like)}°C,
              Vlhkost: ${h.main.humidity}%,
              Vítr: ${Math.round(h.wind.speed * 3.6)} km/h
            </span>
          </div>
        `;
      }

      // 5denní předpověď (vezmeme vždy předpověď v poledne)
      let daysHtml = '';
      let days = {};
      for (let f of data.list) {
        const date = new Date(f.dt * 1000);
        const dkey = date.toLocaleDateString('cs-CZ');
        // Bereme 12:00, pokud není, pak poprvé za den
        if (!days[dkey] && date.getHours() === 12) days[dkey] = f;
        else if (!days[dkey]) days[dkey] = f;
      }
      Object.entries(days).slice(0, 5).forEach(([dkey, f]) => {
        const date = new Date(f.dt * 1000);
        daysHtml += `
          <div class="forecast-day">
            <span style="min-width:70px">${date.toLocaleDateString('cs-CZ', {weekday:'short', day:'2-digit', month:'2-digit'})}</span>
            <img src="https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png" alt="${f.weather[0].description}">
            <span class="forecast-temp">${Math.round(f.main.temp)}°C</span>
            <span>${f.weather[0].description.charAt(0).toUpperCase() + f.weather[0].description.slice(1)}</span>
            <span class="forecast-details">
              Pocitově: ${Math.round(f.main.feels_like)}°C,
              Vlhkost: ${f.main.humidity}%,
              Vítr: ${Math.round(f.wind.speed * 3.6)} km/h
            </span>
          </div>
        `;
      });

      modalBody.innerHTML = `
        <div class="forecast-main">${city.name} – detailní předpověď</div>
        <div class="hourly-title">Hodinová předpověď na 24 hodin (každé 3 h):</div>
        ${hoursHtml}
        <div class="daily-title">Pětidenni výhled:</div>
        ${daysHtml}
      `;
    })
    .catch(err => {
      modalBody.innerHTML = `<div class="modal-loading" style="color:#d00;">Chyba načtení předpovědi: ${err}</div>`;
    });
}

// --- JEDEN BLOK pro klikání, hover a zvuky! ---
document.addEventListener("DOMContentLoaded", () => {
  const hoverAudio = document.getElementById('sound-hover');
  const clickAudio = document.getElementById('sound-click');

  document.querySelectorAll('.city-card').forEach((card, i) => {
    card.style.cursor = "pointer";
    
    card.addEventListener('mouseenter', () => {
      if (hoverAudio) {
        hoverAudio.currentTime = 0;
        hoverAudio.play();
      }
    });

    card.addEventListener('click', (e) => {
      // pokud kliknu na odkaz (mapu), modal nespouštím ani zvuk
      if (e.target.tagName === "A") return;
      if (clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play();
      }
      showWeatherDetail(i);
    });
  });
});
