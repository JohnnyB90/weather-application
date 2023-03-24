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
    .catch((error) => {});
});
// event handler for search button
searchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  let cityInput = searchFormCity.value;
  let stateInput = searchFormState.value;
  console.log(cityInput);
  console.log(stateInput);

  // Show the table
  const tables = document.getElementsByClassName("trth");
  for (let i = 0; i < tables.length; i++) {
    tables[i].style.display = "table";
    tables[i].style.width = "100%";
  }

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
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error fetching data");
            }
            return response.json();
          })
          .then((data) => {
            const weatherArray = [];
            const mainArray = [];
            const windArray = [];
            var forecastData = data.list.splice(0, 5);
            console.log(data);

            // Loop through the weather data and push the weather data to the weatherArray
            for (let i = 0; i < data.list.length; i++) {
              const forecast = data.list[i];
              const date = new Date(forecast.dt_txt);
              if (date.getHours() === 12) {
                const weatherObj = {
                  description: forecast.weather[0].description,
                  icon: forecast.weather[0].icon,
                };
                weatherArray.push(weatherObj);
              }
            }

            // Loop through the weather data and push the filtered and converted main data to the mainArray
            for (let i = 0; i < data.list.length; i++) {
              const forecast = data.list[i];
              const date = new Date(forecast.dt_txt);
              if (date.getHours() === 12) {
                const tempF = (
                  ((forecast.main.temp - 273.15) * 9) / 5 +
                  32
                ).toFixed(1);
                const feelsLikeF = (
                  ((forecast.main.feels_like - 273.15) * 9) / 5 +
                  32
                ).toFixed(1);
                const mainObj = {
                  temp: tempF,
                  feels_like: feelsLikeF,
                };
                mainArray.push(mainObj);
              }
            }
            // Define a function to convert wind direction in degrees to direction string
            function degToCompass(num) {
              const val = Math.floor(num / 22.5 + 0.5);
              const arr = [
                "N",
                "NNE",
                "NE",
                "ENE",
                "E",
                "ESE",
                "SE",
                "SSE",
                "S",
                "SSW",
                "SW",
                "WSW",
                "W",
                "WNW",
                "NW",
                "NNW",
              ];
              return arr[val % 16];
            }

            // Loop through the weather data and push the wind data to the windArray
            for (let i = 0; i < data.list.length; i++) {
              const forecast = data.list[i];
              const date = new Date(forecast.dt_txt);
              if (date.getHours() === 12) {
                const windObj = {
                  speed: forecast.wind.speed,
                  direction: degToCompass(forecast.wind.deg),
                };
                windArray.push(windObj);
              }
            }

            // Log the forecast data
            console.log("Weather:", weatherArray);
            console.log("Main:", mainArray);
            console.log("Wind:", windArray);
            // Loop through the forecastData array and extract the day of the week for each date
            const daysOfWeek = [];
            forecastData.forEach((day) => {
              const date = dayjs(day.dt_txt);
              const dayOfWeek = date.format("MM/DD/YYYY");
              daysOfWeek.push(dayOfWeek);
            });

            // Loop through the forecastData array and group the weather data by day
            const weatherByDay = {};
            forecastData.forEach((day) => {
              const date = dayjs(day.dt_txt);
              const dayOfWeek = date.format("MM/DD/YYYY");
              const weather = day.weather[0];

              if (!weatherByDay[dayOfWeek]) {
                weatherByDay[dayOfWeek] = [];
              }

              weatherByDay[dayOfWeek].push(weather);
            });

            // Loop through the daysOfWeek array and assign one day per table header
            for (let i = 1; i <= daysOfWeek.length; i++) {
              const header = document.getElementById(`day${i}`);
              header.textContent = daysOfWeek[i - 1];
            }
            console.log(daysOfWeek);
            
            // Loop through each day of the week and append the weather data to the corresponding table cell
            for (let i = 1; i <= daysOfWeek.length; i++) {
              const dayOfWeek = daysOfWeek[i - 1];
              const weatherData = weatherByDay[dayOfWeek];
              const weatherCell = document.getElementById(`day${i}weather`);
              let weatherText = "";
              if (weatherData) {
                
                const weather = weatherData[0]; 
                const index = i - 1;
                const tempF = mainArray[index].temp;
                const feelsLikeF = mainArray[index].feels_like;
                const windSpeed = windArray[index].speed;
                const windDirection = windArray[index].direction;
                const iconCode = weather.icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
                const weatherDesc = weather.description;
                const weatherString = `<img src="${iconUrl}" alt="${weatherDesc}"> ${weatherDesc}<br>Temp: ${tempF}&deg;F / Feels like: ${feelsLikeF}&deg;F<br>Wind: ${windSpeed} mph ${windDirection}`;
                weatherText = weatherString;
              }

              weatherCell.innerHTML = weatherText;
            }
            
          })

          .catch((error) => {
            console.error(error);
          });
      } else {
        // If no results were returned, display an error message
        console.log("Error: City not found");
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "City not found";
        errorMessage.style.color = "red";
        searchFormCity.insertAdjacentElement("afterend", errorMessage);
      }
    });
});
