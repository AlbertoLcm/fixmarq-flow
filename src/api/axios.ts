import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fixmarq.keleo.app'
});

export default api;
