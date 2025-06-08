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

// Start okamžitě
updateAllCityTimes();
// Pak každou sekundu
setInterval(updateAllCityTimes, 1000);
