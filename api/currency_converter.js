const Axios = require('axios');
BASE_URL = 'https://free.currconv.com/api/v7/';


module.exports = {
    /**
     * Get the rate exchange
     * @param {*} source
     * @param {*} destination
     */
    getRate(source, destination) {
      query = `${source}_${destination}`;
      return Axios.get(`${BASE_URL}convert?q=${query}&compact=ultra&apiKey='YOUR_API_KEY'`);
    }
  };