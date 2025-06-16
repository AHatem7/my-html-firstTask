import axios from 'axios';

const API_URL = 'http://localhost:3000/api/habits'; 

export const fetchHabits = () => axios.get(API_URL);

export const createHabit = (data) => axios.post(API_URL, data);

export const updateHabit = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const deleteHabit = (id) => axios.delete(`${API_URL}/${id}`);
