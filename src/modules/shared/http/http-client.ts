import axios from "axios";

export class HttpClient {
    private TMDB_API_KEY: string;
    private TMDB_BASE_URL: string;

    constructor() {
        this.TMDB_API_KEY = process.env.TMDB_API_KEY;
        this.TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    }

    public async get(absolute_url: string): Promise<any> {
        const url = `${this.TMDB_BASE_URL}${absolute_url}?api_key=${this.TMDB_API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    }
}
