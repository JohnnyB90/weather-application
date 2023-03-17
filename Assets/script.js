apiKey = "015b0ce1972981e980b4d813137568cb";
const searchBtn = document.getElementById("search-city");
const searchFormCity = document.getElementById("city");
const searchFormState = document.getElementById("state");
// Display the current day and time
function dateDisplay() {
  var currentDate = dayjs().format("dddd hh:mm A");
  var aquireCurrentTime = document.getElementById("currentTime");
  aquireCurrentTime.appendChild(document.createTextNode(currentDate));
}
dateDisplay();
// Get the user's current position using the Geolocation API
navigator.geolocation.getCurrentPosition(function (position) {
  // Get the latitude and longitude from the position object
  var latDisplay = position.coords.latitude;
  var lonDisplay = position.coords.longitude;
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
      latDisplay +
      "&lon=" +
      lonDisplay +
      "&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      // Displaying available data to console
      //   console.log(data);
      // Displaying five day forecasts to console
      var forecastData = data.list.splice(0, 5);
      //   console.log(forecastData);
      // Pulling out the current city based on long/lat coordinates
      var currentCity = data.city.name;
      var currentCityDiv = document.getElementById("current-city");
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
      var temperatureInFahrenheit = Math.round(
        ((temperatureInKelvin - 273.15) * 9) / 5 + 32
      );
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
    .catch((error) => {
      //   console.log("Unable to fetch that!");
    });
  // event handler for search button
  searchBtn.addEventListener("click", (event) => {
    event.preventDefault();
    let cityInput = searchFormCity.value;
    let stateInput = searchFormState.value;
    console.log(cityInput);
    console.log(stateInput);
    // Construct the API URL with the city and state as the search query
    fetch(
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
        cityInput +
        "," +
        stateInput +
        "&limit=1&appid=" +
        apiKey
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Check if the API call returned any results
        if (data.length > 0) {
          // Get the latitude and longitude from the first result
          const lat = data[0].lat;
          const lon = data[0].lon;
          // Log results
          console.log("Latitude:", lat);
          console.log("Longitude:", lon);
          fetch(
            "https://api.openweathermap.org/data/2.5/forecast?lat=" +
              lat +
              "&lon=" +
              lon +
              "&appid=" +
              apiKey
          )
            .then((response) => response.json())
            .then((data) => {
                const weatherData = data.list;
                const forecastData = [];
              
                // Loop through the weather data and only add data for each day at 12:00 PM
                for (let i = 0; i < weatherData.length; i++) {
                  const weather = weatherData[i];
                  const date = new Date(weather.dt_txt);
                  if (date.getHours() === 12) {
                    forecastData.push(weather);
                  }
                }
              console.log(forecastData);
                // Loop through the forecastData array and extract the day of the week for each date
                const daysOfWeek = [];
                forecastData.forEach((day) => {
                  const date = dayjs(day.dt_txt);
                  const dayOfWeek = date.format('dddd');
                  daysOfWeek.push(dayOfWeek);
                });
                // Loop through the forecastData once again and assign one day per table header
                for (let i = 1; i <= daysOfWeek.length; i++) {
                    const header = document.getElementById(`day${i}`);
                    header.textContent = daysOfWeek[i-1];
                  }
                console.log(daysOfWeek);
              });
        } else {
          console.log("No results found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
});
