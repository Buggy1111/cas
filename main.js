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

// 4. Pro animace – přiřazení CSS třídy podle typu počasí vč. oparu
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
        const windKmh = Math.round(wind * 3.6); // převod m/s na km/h

        // Barva rámečku a glow animace
        const color = getWeatherColor(desc);
        card.style.setProperty('--weather-color', color + '80');
        card.style.borderColor = color;
        card.style.boxShadow = `0 0 16px 6px ${color}80,0 2px 24px 0 ${color}40,0 8px 40px 0 rgba(60,60,60,0.07)`;
        card.classList.add('animated');

        // Overlay pro mlhu a opar
        const foggy = desc.toLowerCase().includes("mlha");
        const misty = desc.toLowerCase().includes("opar") || desc.toLowerCase().includes("mist") || desc.toLowerCase().includes("haze");
        // Smazat staré overlaye
        const fogOverlay = card.querySelector('.fog-overlay');
        if (fogOverlay) fogOverlay.remove();
        const mistOverlay = card.querySelector('.mist-overlay');
        if (mistOverlay) mistOverlay.remove();
        // Přidat overlay dle počasí
        if (foggy) {
          const overlay = document.createElement('div');
          overlay.className = 'fog-overlay';
          card.appendChild(overlay);
        } else if (misty) {
          const overlay = document.createElement('div');
          overlay.className = 'mist-overlay';
          card.appendChild(overlay);
        }

        // Výpis dat ve dvou řádcích (přehledně, wrap!)
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
              <span class="feelslike-badge" title="Pocitová teplota: takto to skutečně působí na člověka!">Pocitově: ${feelsLike}°C</span>
              <span class="humidity-badge" title="Relativní vlhkost vzduchu">Vlhkost: ${humidity}%</span>
              <span class="wind-badge" title="Rychlost větru v kilometrech za hodinu">Vítr: ${windKmh} km/h</span>
            </div>
          `;
        }
      })
      .catch(err => {
        console.warn("Nepodařilo se načíst počasí pro", city.name, err);
      });
  });
}

// 7. První načtení počasí po loadu
updateAllWeather();

// 8. Automatická aktualizace počasí každou hodinu (60 * 60 * 1000 ms)
setInterval(updateAllWeather, 60 * 60 * 1000);
