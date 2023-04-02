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

function addCityToLocalStorage(city) {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!recentCities.includes(city)) {
    recentCities.push(city);

    if (recentCities.length > 6) {
      recentCities.shift();
    }

    localStorage.setItem("recentCities", JSON.stringify(recentCities));
  }

  renderCityButtons();
}

function getRecentCitiesFromLocalStorage() {
  const storedCities = localStorage.getItem("recentCities");
  return storedCities ? JSON.parse(storedCities) : [];
}

function renderCityButtons() {
  const recentCitiesButtons = document.getElementById("recent-cities-buttons");
  recentCitiesButtons.innerHTML = ""; // Clear any existing buttons

  const recentCities = getRecentCitiesFromLocalStorage();
  recentCities.forEach((city, index) => {
    const cityButton = document.createElement("button");
    cityButton.textContent = city;
    cityButton.classList.add(
      "bg-blue-400",
      "text-white",
      "rounded",
      "py-2",
      "px-4",
      "mb-2",
      "text-center"
    );
    cityButton.style.width = "150px"; // Set fixed width for the button
    cityButton.setAttribute("data-index", index);
    cityButton.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      const city = recentCities[index];
      const [cityInputValue, stateInputValue] = city.split(", ");
      searchFormCity.value = cityInputValue;
      searchFormState.value = stateInputValue;
      searchBtn.click();
    });
    recentCitiesButtons.appendChild(cityButton);

    // Add a line break after each button
    const lineBreak = document.createElement("br");
    recentCitiesButtons.appendChild(lineBreak);
  });
}

renderCityButtons();

searchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  let cityInput = searchFormCity.value;
  let stateInput = searchFormState.value;

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
          if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            console.log("Latitude:", lat);
            console.log("Longitude:", lon);
    
            // Add city to local storage
            addCityToLocalStorage(`${cityInput}, ${stateInput}`);
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
            const cityName = data.city.name;
            const cityState = `${cityInput}, ${stateInput}`;
            addCityToLocalStorage(cityState);
            console.log(cityName);
            const weatherArray = [];
            const mainArray = [];
            const windArray = [];
            const forecastData = [];

            // Keep track of the date of the most recent data
            let lastDate = null;

            // Loop through each item in the data list
            for (const item of data.list) {
              // Extract the date from the item's dt_txt property
              const date = item.dt_txt.split(" ")[0];

              // If this is a new date that hasn't been included yet, add it to the forecastData array
              if (date !== lastDate) {
                forecastData.push(item);
                lastDate = date;
              }

              // If we've collected data for 5 days, stop collecting more data
              if (forecastData.length >= 5) {
                break;
              }
            }

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
              console.log(forecast);
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
                  humidity: forecast.main.humidity,
                };
                mainArray.push(mainObj);
                console.log(tempF);
                console.log(feelsLikeF);
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

            // Loop through each day of the week and update the table data with the weather
            for (let i = 0; i < daysOfWeek.length; i++) {
              const dayOfWeek = daysOfWeek[i];
              const weatherData = weatherByDay[dayOfWeek];
              const weatherCell = document.getElementById(`day${i + 1}weather`);
              let weatherText = "";

              if (weatherData) {
                const weather = weatherData[0];
                const mainData = mainArray[i];
                const windData = windArray[i];

                // Get the date for the current day
                const date = dayjs(dayOfWeek, "MM/DD/YYYY").format(
                  "MMMM DD, YYYY"
                );

                // Construct the icon URL using the icon code
                const iconCode = weather.icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

                // Build the weather string to display in the table cell
                weatherText = `
                  <div class="text-center mb-2">${date}</div>
                  <div class="flex justify-center items-center">
                    <div class="mr-2"><img src="${iconUrl}" alt="${weather.description}" class="w-10 h-10"></div>
                    <div class="text-left">
                      <div class="font-semibold">${weather.description}</div>
                      <div>Temp: ${mainData.temp}&deg;F</div>
                      <div>Feels like: ${mainData.feels_like}&deg;F</div>
                      <div>Humidity: ${mainData.humidity}%</div>
                      <div>Wind: ${windData.speed}mph ${windData.direction}</div>
                    </div>
                  </div>
                `;
              } else {
                // Handle case where no weather data is available for the current day
                weatherText = `
                  <div class="text-center mb-2">${dayOfWeek}</div>
                  <div>No weather data available</div>
                `;
              }

              // Update the weather table cell with the weather string
              document.getElementById("city-name").innerHTML = cityName;
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

// City search button for Charlotte
const charlotteButton = document.getElementById("charlotte");
charlotteButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(35.2271, -80.8431);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});
// City search button for Atlanta
const atlantaButton = document.getElementById("atlanta");
atlantaButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(33.7488, -84.3877);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for Denver
const denverButton = document.getElementById("denver");
denverButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(39.7392, -104.9903);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for Seattle
const seattleButton = document.getElementById("seattle");
seattleButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(47.6062, -122.3321);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for San Francisco
const sanfranciscoButton = document.getElementById("sanfran");
sanfranciscoButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(37.7749, -122.4194);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for Orlando
const orlandoButton = document.getElementById("orlando");
orlandoButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(28.5383, -81.3792);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for New York
const newyorkButton = document.getElementById("newyork");
newyorkButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(40.7128, -74.0060);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for Chicago
const chicagoButton = document.getElementById("chicago");
chicagoButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(41.8781, -87.6298);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});

// City search button for Austin
const austinButton = document.getElementById("austin");
austinButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.7490&lon=-84.3880&appid=" +
      apiKey
  )
    .then((response) => response.json())
    .then((data) => {
      callWeather(30.2672, -97.7431);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
});


// Call weather function for the quick search buttons. It does not have the geo location part of the api in from the input field search.
function callWeather(lat, lon){
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
            const cityName = data.city.name;
            console.log(cityName);
            const weatherArray = [];
            const mainArray = [];
            const windArray = [];
            const forecastData = [];

            // Keep track of the date of the most recent data
            let lastDate = null;

            // Loop through each item in the data list
            for (const item of data.list) {
              // Extract the date from the item's dt_txt property
              const date = item.dt_txt.split(" ")[0];

              // If this is a new date that hasn't been included yet, add it to the forecastData array
              if (date !== lastDate) {
                forecastData.push(item);
                lastDate = date;
              }

              // If we've collected data for 5 days, stop collecting more data
              if (forecastData.length >= 5) {
                break;
              }
            }

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
              console.log(forecast);
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
                  humidity: forecast.main.humidity,
                };
                mainArray.push(mainObj);
                console.log(tempF);
                console.log(feelsLikeF);
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

            // Loop through each day of the week and update the table data with the weather
            for (let i = 0; i < daysOfWeek.length; i++) {
              const dayOfWeek = daysOfWeek[i];
              const weatherData = weatherByDay[dayOfWeek];
              const weatherCell = document.getElementById(`day${i + 1}weather`);
              let weatherText = "";

              if (weatherData) {
                const weather = weatherData[0];
                const mainData = mainArray[i];
                const windData = windArray[i];

                // Get the date for the current day
                const date = dayjs(dayOfWeek, "MM/DD/YYYY").format(
                  "MMMM DD, YYYY"
                );

                // Construct the icon URL using the icon code
                const iconCode = weather.icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

                // Build the weather string to display in the table cell
                weatherText = `
                  <div class="text-center mb-2">${date}</div>
                  <div class="flex justify-center items-center">
                    <div class="mr-2"><img src="${iconUrl}" alt="${weather.description}" class="w-10 h-10"></div>
                    <div class="text-left">
                      <div class="font-semibold">${weather.description}</div>
                      <div>Temp: ${mainData.temp}&deg;F</div>
                      <div>Feels like: ${mainData.feels_like}&deg;F</div>
                      <div>Humidity: ${mainData.humidity}%</div>
                      <div>Wind: ${windData.speed}mph ${windData.direction}</div>
                    </div>
                  </div>
                `;
              } else {
                // Handle case where no weather data is available for the current day
                weatherText = `
                  <div class="text-center mb-2">${dayOfWeek}</div>
                  <div>No weather data available</div>
                `;
              }

              // Update the weather table cell with the weather string
              document.getElementById("city-name").innerHTML = cityName;
              weatherCell.innerHTML = weatherText;
            }
          })

          .catch((error) => {
            console.error(error);
          });
        }