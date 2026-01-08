import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost/backend/src/routes",
    withCredentials: true
});

export default api;
