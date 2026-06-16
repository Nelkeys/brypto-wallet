import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_URL;

export const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default API;