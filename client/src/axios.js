import axios from "axios";

export const makeRequest = axios.create({

  // baseURL: "https://api-uvmk.onrender.com/api/",
  baseURL: "http://localhost:8800/api/",
  withCredentials: true,
});
