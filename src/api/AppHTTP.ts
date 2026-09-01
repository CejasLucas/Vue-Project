import axios from "axios";

export const http = axios.create({
    baseURL: "http://192.168.0.12:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

/*
export const http = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});
*/ 