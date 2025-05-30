"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLocation = getUserLocation;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getUserLocation(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = process.env.IPSTACK_API_KEY;
        if (!apiKey) {
            console.error("Falta la API Key de ipstack en las variables de entorno.");
            return "Desconocido";
        }
        try {
            const response = yield (0, node_fetch_1.default)(`http://api.ipstack.com/${ip}?access_key=${apiKey}`);
            const data = (yield response.json());
            return data.country_name || "Desconocido";
        }
        catch (error) {
            console.error("Error al obtener la ubicación:", error);
            return "Error al obtener la ubicación";
        }
    });
}
