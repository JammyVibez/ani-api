import cors from 'cors';
const origin = ['https://mochitv.netlify.app', 'http://localhost:5173', 'http://localhost:8081'];
export const corsConfig = cors({ origin })