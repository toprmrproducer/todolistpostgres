"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAudio = uploadAudio;
exports.deleteAudio = deleteAudio;
const node_cloudflare_r2_1 = require("node-cloudflare-r2");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const r2 = new node_cloudflare_r2_1.R2({
    accountId: process.env.CF_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY || '',
});
const BUCKET = process.env.CF_R2_BUCKET_NAME || '';
const PUBLIC_BASE = process.env.CF_R2_PUBLIC_BASE_URL || '';
async function uploadAudio(userId, fileBuffer, mimeType) {
    const key = `audio/${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.webm`;
    const bucket = r2.bucket(BUCKET);
    await bucket.upload(fileBuffer, key, {}, mimeType);
    const publicUrl = `${PUBLIC_BASE}/${key}`;
    return { key, publicUrl };
}
async function deleteAudio(key) {
    const bucket = r2.bucket(BUCKET);
    await bucket.deleteObject(key);
}
