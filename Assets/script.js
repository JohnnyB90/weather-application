  // Get the user's current position using the Geolocation API
  navigator.geolocation.getCurrentPosition(function(position) {
    // Get the latitude and longitude from the position object
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
fetch("https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&appid=015b0ce1972981e980b4d813137568cb"
)
.then(response => response.json())
.then(data => {
  // Displaying available data to console
  console.log(data);
  // Displaying five day forecasts to console
  var forecastData = data.list.splice(0, 5); 
  console.log(forecastData)
  // Pulling out the current city based on long/lat coordinates
  var currentCity = data.city.name;
  var currentCityDiv = document.getElementById("current-city")
  currentCityDiv.textContent = currentCity;
  currentCityDiv.style.fontWeight = "bold";
  // Adding current date to the right side of the current city
  var currentDate = new Date();
  var currentDateDiv = document.createElement("div");
  currentDateDiv.textContent = `(${currentDate.toLocaleDateString()})`;
  currentDateDiv.style.marginLeft = "1%";
  currentCityDiv.appendChild(currentDateDiv);
  currentCityDiv.style.display = "flex";
  currentCityDiv.style.alignItems = "center";
  // Retrieving weather data for the current time
  const currentWeatherData = forecastData[0];
  // Retrieving wind speed, temperature, and humidity from current weather data
  var windSpeed = currentWeatherData.wind.speed;
  var temperatureInKelvin = currentWeatherData.main.temp;
  var temperatureInFahrenheit = Math.round((temperatureInKelvin - 273.15) * 9/5 + 32);
  const humidity = currentWeatherData.main.humidity;
  // Displaying wind speed, temperature, and humidity in HTML
  var windDiv = document.getElementById("wind");
  windDiv.textContent = `Wind: ${windSpeed} mph`;
  var tempDiv = document.getElementById("temp");
  tempDiv.textContent = `Temperature: ${temperatureInFahrenheit} °F`;
  var humidityDiv = document.getElementById("humidity");
  humidityDiv.textContent = `Humidity: ${humidity}%`;
})
// Error catch that will display if something is not working properly
.catch(error => {
  console.log("Unable to fetch that!")
});
});