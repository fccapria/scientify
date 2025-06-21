const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';
const config = {
    API_URL
};

export default config;
export { API_URL };
