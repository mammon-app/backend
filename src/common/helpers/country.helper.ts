import { Country, State, City } from 'country-state-city';

export class CountryHandler {
  /**
   * Retrieves a list of countries with their states and cities.
   * @returns {Array} - An array of countries with nested states and cities.
   */
  static getCountries(): Array<any> {
    const countries = Country.getAllCountries();
    return countries.map((country) => {
      const states = State.getStatesOfCountry(country.isoCode);
      const mappedStates = states.map((state: any) => {
        const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
        const mappedCities = cities.map((city: any) => {
          return {
            name: city.name,
            state_code: city.stateCode,
          };
        });
        return {
          name: state.name,
          iso_code: state.isoCode,
          cities: mappedCities,
        };
      });
      return {
        iso_code: country.isoCode,
        name: country.name,
        phone_code: `+${country.phonecode}`,
        flag: country.flag,
        currency: country.currency,
        states: mappedStates,
      };
    });
  }

  /**
   * Retrieves detailed information about a specific country.
   * @param {string} iso_code - The ISO code of the country.
   * @returns {object} - Information about the country, including its states and cities.
   */
  static getCountryInfo(iso_code: string): any {
    const country = Country.getCountryByCode(iso_code);
    const states = State.getStatesOfCountry(country.isoCode);
    const mappedStates = states.map((state) => {
      const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
      const mappedCities = cities.map((city) => {
        return {
          name: city.name,
          state_code: city.stateCode,
        };
      });
      return {
        name: state.name,
        iso_code: state.isoCode,
        cities: mappedCities,
      };
    });
    return {
      iso_code: country.isoCode,
      name: country.name,
      phone_code: `+${country.phonecode}`,
      flag: country.flag,
      currency: country.currency,
      states: mappedStates,
    };
  }
}
