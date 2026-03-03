import { R2 } from 'node-cloudflare-r2';
import dotenv from 'dotenv';
dotenv.config();

const r2 = new R2({
    accountId: process.env.CF_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY || '',
});

const BUCKET = process.env.CF_R2_BUCKET_NAME || '';
const PUBLIC_BASE = process.env.CF_R2_PUBLIC_BASE_URL || '';

export async function uploadAudio(
    userId: string,
    fileBuffer: Buffer,
    mimeType: string
) {
    const key = `audio/${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.webm`;

    const bucket = r2.bucket(BUCKET);
    await bucket.putObject(key, fileBuffer, { contentType: mimeType });

    const publicUrl = `${PUBLIC_BASE}/${key}`;
    return { key, publicUrl };
}

export async function deleteAudio(key: string) {
    const bucket = r2.bucket(BUCKET);
    await bucket.deleteObject(key);
}
