const apiKey = 'e1b5b03240866eff92324bff901e5f85'; 
const weatherInfo = document.getElementById('weatherInfo');
const extendedForecast = document.getElementById('extendedForecast');
const cityInput = document.getElementById('cityInput');
const dropdown = document.getElementById('dropdown');

//recently searched cities from local storage
function loadRecentCities() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    return recentCities;
}

// Save city to local storage
function saveCity(city) {
    const recentCities = loadRecentCities();
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
}

// Display recent cities in the dropdown
function displayDropdown(cities) {
    dropdown.innerHTML = '';
    if (cities.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }
    dropdown.classList.remove('hidden');
    cities.forEach(city => {
        const cityOption = document.createElement('div');
        cityOption.textContent = city;
        cityOption.classList.add('p-2', 'hover:bg-blue-100', 'cursor-pointer');
        cityOption.onclick = () => {
            cityInput.value = city; 
            getWeather(city);
            dropdown.classList.add('hidden'); 
        };
        dropdown.appendChild(cityOption);
    });
}

//fetch weather data by city name
function getWeather(city) {
    showLoadingWeather();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                weatherInfo.innerHTML = `<p class="text-red-500">${data.message}</p>`;
                return;
            }
            displayWeather(data);
            saveCity(city); 
            getExtendedForecast(city); 
        })
        .catch(error => {
            weatherInfo.innerHTML = `<p class="text-red-500">Error fetching weather data</p>`;
        });
}

// Function to display weather
function displayWeather(data) {
    const { name, main: { temp, humidity }, wind: { speed }, weather } = data;
    const weatherCondition = weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`; 

    weatherInfo.innerHTML = `
        <div class="sm:bg-purple-300 shadow-md md:bg-teal-300 rounded-lg lg:bg-yellow-100 p-4 flex flex-col items-center"> <!-- Flexbox for vertical alignment -->
            <img src="${iconUrl}" alt="Weather icon" class="w-20 h-20 mb-4"> <!-- Updated size for the weather icon -->
            <h2 class="text-2xl font-bold text-center">Weather in ${name}</h2>
            <p class="text-lg">Temperature: ${temp} °C</p>
            <p class="text-lg">Humidity: ${humidity}%</p>
            <p class="text-lg">Wind Speed: ${speed} m/s</p>
            <p class="text-lg capitalize">Condition: ${weatherCondition}</p> <!-- Ensure condition text is capitalized -->
        </div>
    `;
}


// Function to fetch extended forecast (5-day forecast)
function getExtendedForecast(city) {
    showLoadingForecast();
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== '200') {
                extendedForecast.innerHTML = `<p class="text-red-500">${data.message}</p>`;
                return;
            }
            displayExtendedForecast(data);
        })
        .catch(error => {
            extendedForecast.innerHTML = `<p class="text-red-500">Error fetching extended forecast</p>`;
        });
}

//display extended forecast
function displayExtendedForecast(data) {
    const forecastItems = data.list.filter((item, index) => index % 8 === 0); 

    let forecastHtml = ''; 
    forecastItems.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString();
        const { temp, humidity } = item.main;
        const windSpeed = item.wind.speed;
        const weatherCondition = item.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        //div block for each day's forecast
        forecastHtml += `
            <div class="sm:bg-red-300 md:bg-yellow-400 shadow-md rounded-lg lg:bg-blue-500 p-4 flex flex-col items-center"> <!-- Added flex and flex-col for vertical alignment -->
                <p class="font-bold">${date}</p>
                <img src="${iconUrl}" alt="Weather icon" class="mb-2"> <!-- Aligned vertically with flexbox -->
                <p>${weatherCondition}</p>
                <p>Temp: ${temp} °C</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind: ${windSpeed} m/s</p>
            </div>
        `;
    });

    
    extendedForecast.querySelector('.grid').innerHTML = forecastHtml;
}


function showLoadingWeather() {
    weatherInfo.innerHTML = `<p class="text-blue-500">Loading weather data...</p>`;
    dropdown.classList.add('hidden'); 
}


function showLoadingForecast() {
    extendedForecast.querySelector('.grid').innerHTML = `<p class="text-blue-500">Loading extended forecast...</p>`;
}


document.getElementById('searchBtn').addEventListener('click', () => {
    const city = cityInput.value;
    if (city.trim() === '') {
        weatherInfo.innerHTML = `<p class="text-red-500">Please enter a city name</p>`;
    } else {
        getWeather(city); 
        cityInput.value = ''; 
        dropdown.classList.add('hidden'); 
    }
});


cityInput.addEventListener('input', () => {
    const city = cityInput.value;
    const recentCities = loadRecentCities();
    const filteredCities = recentCities.filter(recentCity => recentCity.toLowerCase().includes(city.toLowerCase()));
    displayDropdown(filteredCities);
});


document.querySelector('.searchBtn').addEventListener('click', () => {
    getCurrentLocationWeather();
});


function getCurrentLocationWeather() {
    showLoadingWeather();
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
                getExtendedForecast(data.name); 
            })
            .catch(error => {
                weatherInfo.innerHTML = `<p class="text-red-500">Error fetching weather data for current location</p>`;
            });
    }, (error) => {
        weatherInfo.innerHTML = `<p class="text-red-500">Error getting location: ${error.message}</p>`;
    });
}












