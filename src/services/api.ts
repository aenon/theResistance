import axios from 'axios';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

export const getGameStatus = async (gameId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/games/${gameId}/status`);
        return response.data;
    } catch (error) {
        console.error('Error fetching game status:', error);
        throw error;
    }
};

export const startGame = async (gameData: object) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/games/start`, gameData);
        return response.data;
    } catch (error) {
        console.error('Error starting game:', error);
        throw error;
    }
};

export const joinGame = async (gameId: string, playerData: object) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/games/${gameId}/join`, playerData);
        return response.data;
    } catch (error) {
        console.error('Error joining game:', error);
        throw error;
    }
};