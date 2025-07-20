import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// Interfaz para la respuesta de ipstack
interface IpstackResponse {
    country_name?: string;
}

export async function getUserLocation(ip: string): Promise<string> {
    const apiKey = process.env.IPSTACK_API_KEY;
    if (!apiKey) {
        console.error("Falta la API Key de ipstack en las variables de entorno.");
        return "Desconocido";
    }

    try {
        const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${apiKey}`);
        const data = (await response.json()) as IpstackResponse;

        return data.country_name || "Desconocido";
    } catch (error) {
        console.error("Error al obtener la ubicación:", error);
        return "Error al obtener la ubicación";
    }
}