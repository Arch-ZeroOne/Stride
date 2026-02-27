import axios from "axios";

const client = axios.create({
  baseURL: "https://stride-deployment.onrender.com/api",
});

export default client;
