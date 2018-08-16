import React, { Component } from 'react';

import './App.css';

import request from 'superagent';

class App extends Component {
  constructor() {
    super();

    this.state = {
      cities: [{
        id: 1,
        name: 'France'
      }],
      show: false,
      timezone: 'Timezone',
      summary: 'Add a new city.',
      weekly: [],
      hourly: []
    };
  }

  showInput = () => {
    this.setState({
      show: true
    });
  }

  addCity = (e) => {
    // I. If ENTER was pressed
    const ENTER_KEY = 13;

    if (e.keyCode === ENTER_KEY) {
      // II. Save new city in `cities`.
      this.setState({
        cities: [
          // III. Get past data.
          ...this.state.cities,
          {
            id: this.state.cities.length + 1,
            name: e.target.value
          }
        ],
        show: false
      });

      // IV. Clean the input.
      e.target.value = '';
    }
  }

  getCoords = (ENDPOINT) => {
    return request.get(ENDPOINT);
  }

  fetchWeather = (response) => {
    const coords = response.body.results[0].geometry.location;

    const ENDPOINT = `https://api.darksky.net/forecast/8c6c8467512243aac21331fe2e8d328e/${ coords.lat }, ${ coords.lng }`;

    request
      .get(ENDPOINT)
      .then(response => {
        this.setState({
          weekly: response.body.daily.data,
          hourly: response.body.hourly.data,
          timezone: response.body.timezone,
          summary: response.body.currently.summary
        });
      });
  }

  fetchLocation = (e) => {
    e.preventDefault();

    const COUNTRY = e.target.textContent;
    const ENDPOINT = `https://maps.googleapis.com/maps/api/geocode/json?address=${ COUNTRY }`;

    this
      .getCoords(ENDPOINT)
      .then(this.fetchWeather)
      .catch(error => {
        this.setState({
          timezone: 'Timezone',
          summary: 'Something went wrong. Try again.'
        });
      });
  }

  renderIcon = iconName => {
    const icons = {
      'clear-day': 'https://www.amcharts.com/wp-content/themes/amcharts2/css/img/icons/weather/animated/day.svg',
      'partly-cloudy-day': 'https://www.amcharts.com/wp-content/themes/amcharts2/css/img/icons/weather/animated/cloudy-day-1.svg',
      'partly-cloudy-night': 'https://www.amcharts.com/wp-content/themes/amcharts2/css/img/icons/weather/animated/cloudy-night-1.svg',
      'rain': 'https://www.amcharts.com/wp-content/themes/amcharts2/css/img/icons/weather/animated/rainy-1.svg',
      'cloudy': 'https://www.amcharts.com/wp-content/themes/amcharts2/css/img/icons/weather/animated/cloudy.svg',
      'fog': 'https://raw.githubusercontent.com/rickellis/SVG-Weather-Icons/7824dc80e8b35f651186a63c98c861e470deeed6/DarkSky/fog.svg'
    };

    return <img src={ icons[iconName] } />
  }

  dateToString = date => {
    return new Date(date * 1000).toLocaleString();
  }

  render() {
    return (
      <div className='app'>
        <header className='app__header'>
          <button onClick={ this.showInput } className='app__add'>
            <i className='fa fa-plus-circle' /> New city
          </button>
        </header>
        <div className='grid'>
          <aside className='app__aside'>
            <h1 className='app__title'>All countries</h1>
            { this.state.cities.map(city => {
              return <a
                       onClick={ this.fetchLocation }
                       key={ city.id }
                       href='#'
                       className='app__country'
                      >
                        { city.name }
                      </a>
            }) }
            { this.state.show && <input onKeyUp={ this.addCity } autoFocus type='text' placeholder='Location' className='app__input' /> }
          </aside>
          <section className='app__view'>
            <div>
              <h3>{ this.state.timezone }</h3>
              <p>{ this.state.summary }</p>
              <h5>Weekly</h5>
              <div className='week'>
                { this.state.weekly.map(day => {
                  return (
                    <div className='day'>
                      <div className='day__icon'>
                        { this.renderIcon(day.icon) }
                      </div>
                      <p className='day__temp'>{ this.dateToString(day.sunriseTime) }</p>
                      <p className='day__temp'>{ this.dateToString(day.sunsetTime) }</p>
                      <p className='day__wind'>{ day.windSpeed } m/s</p>
                      <p className='day__press'>{ day.pressure } hpa</p>
                    </div>
                  );
                }) }
              </div>
              <h5>Hourly</h5>
              <table className=''>
                <thead>
                  <tr>
                    <th>{ new Date().toLocaleString().split(',')[0] }</th>
                  </tr>
                </thead>
                <tbody>
                  { this.state.hourly.map((hour, index) => {
                    return (
                      <tr>
                        <td>
                          <small>{ index + 1 }</small>
                          <strong> { new Date(hour.time * 1000).getHours() }:00</strong>,
                          { hour.temperature } ºF,
                          <em>{ hour.summary.toLowerCase() }</em>,
                          { hour.windSpeed } m/s,
                          { hour.pressure }
                        </td>
                      </tr>
                    );
                  }) }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default App;
