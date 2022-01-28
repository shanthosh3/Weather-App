var searchBtnEl = document.getElementById('searchBtn');
var currentWeatherContainerEl = document.getElementById("current-weather");
var recentSearchesContainerEl = document.getElementById("recent-searches");
var currentDate = dayjs().format('M-DD-YYYY');
var searchHistory = [];


var weatherSearch = function(searchTerm) {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + searchTerm + '&appid=460baac12caacdeca58e7bae8f1299bc')
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + response.coord.lat + '&lon=' + response.coord.lon + '&units=metric&appid=460baac12caacdeca58e7bae8f1299bc')
        .then(function(weather) {
            console.log(weather);
            return weather.json();
        })
        .then(function(weather) {
            if ($('#current-weather').html('') && $('#five-day').html('')) {
                displayWeather(weather, searchTerm);
                fiveDayForecast(weather);
                saveSearch(searchTerm);
            } else {
                $('#current-weather').empty();
                $('#five-day').empty();
                displayWeather(weather, searchTerm);
                fiveDayForecast(weather);
            }        
            
        })
    })
};

var displayWeather = function(weather, cityName) {
    var titleEl = $('<h2></h2>')
    .text(cityName + " (" + currentDate + ")");
    var weatherConditionEl = $('<img>')
    .attr('src', 'http://openweathermap.org/img/wn/' + weather.current.weather[0].icon + '@2x.png')
    .attr('alt', '');

    var titleContainerEl = $('<div></div>')
    .addClass('row col-12 justify-content-start align-items-center')
    .attr('id', 'titleContainer');

    $(titleContainerEl).append(titleEl, weatherConditionEl);
    $(currentWeatherContainerEl).append(titleContainerEl);

    var tempEl = $('<p></p>')
    .text("Temp: " + weather.current.temp + " °C");
    var windEl = $('<p></p>')
    .text('Wind: ' + weather.current.wind_speed + " metres/sec");
    var humidityEl = $('<p></p>')
    .text("Humidity: " + weather.current.humidity + "%");
    var uvIndexEl = $('<p></p>')
    .text("UV Index: " + weather.current.uvi);

    if (weather.current.uvi < 3) {
        uvIndexEl.addClass('bg-success text-white p-2 rounded col-3');
    } else if (weather.current.uvi < 6 && weather.current.uvi > 3) {
        uvIndexEl.addClass('bg-warning text-dark p-2 rounded col-3');
    } else if (weather.current.uvi > 6) {
        uvIndexEl.addClass('bg-danger text-white p-2 rounded col-3');
    }

    $(currentWeatherContainerEl).append(tempEl, windEl, humidityEl, uvIndexEl);
};

var fiveDayForecast = function(weather) {
    var fiveDayContainerEl = document.getElementById('five-day');

    for (var i = 1; i < 6; i++) {
        var forcastCardEl = $('<div></div>')
        .addClass('col-2 forcast p-3 text-light rounded')
        .attr('data-forcast-id', i);

        var dateEl = $('<h4></h4>')
        .text(dayjs().add(i, 'day').format('M-DD-YYYY'));
        var weatherConditionEl = $("<img>")
        .attr('src', 'http://openweathermap.org/img/wn/' + weather.daily[i].weather[0].icon + '@2x.png')
        .attr('alt', '');
        var tempEl = $('<p></p>')
        .text('Temp: ' + weather.daily[i].temp.day + " °C");
        var windEl = $('<p></p>')
        .text('Wind: ' + weather.daily[i].wind_speed + " m/sec");
        var humidityEl = $('<p></p>')
        .text('Humidity: ' + weather.daily[i].humidity + '%');

        $(forcastCardEl).append(dateEl, weatherConditionEl, tempEl, windEl, humidityEl);
        $(fiveDayContainerEl).append(forcastCardEl);
    }
};

var saveSearch = function(searchTerm) {
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    
    if (searchHistory === null) {
        var tempArr = [];
        var recentSearch = {
            city: searchTerm,
        };
        tempArr.push(recentSearch);
    
        localStorage.setItem('searchHistory', JSON.stringify(tempArr));
    
        loadSearchHistory();
    } else {
        var matching = searchHistory.find(({ city }) => city === searchTerm);
        console.log(matching);

        if (matching === undefined) {
            var recentSearch = {
                city: searchTerm,
            };
            searchHistory.push(recentSearch);
        
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        
            loadSearchHistory();
        } else {
            return;
        }
    }
};

var loadSearchHistory = function() {
    var recentSearches = JSON.parse(localStorage.getItem('searchHistory'));
    console.log(recentSearches);

    $(recentSearchesContainerEl).empty();

    if (recentSearches === null){
        return;
    } else {
        for (i = 0; i < recentSearches.length; i ++) {
            var recentSearchEl = $('<a></a>')
            .text(recentSearches[i].city)
            .addClass('rounded p-2 searchHistory text-white text-center mt-2');
    
            $(recentSearchesContainerEl).append(recentSearchEl);
        }
    }
};

$('#recent-searches').on('click', '.searchHistory', function() {
    var city = $(this).text().trim();
    weatherSearch(city);
});

$(searchBtnEl).on('click', function(event) {
    event.preventDefault();
    var searchTerm = document.querySelector("input[name='citySearchTerm']").value;
    weatherSearch(searchTerm);
})

loadSearchHistory();