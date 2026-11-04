// True client-side E2E encryption using Web Crypto API
// Room key is derived from the 6-digit code. Server never sees plaintext.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(code: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`chatsy-salt-v1-${code}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('chatsy-room-key'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(plaintext: string, code: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await deriveKey(code);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer)
  };
}

export async function decryptMessage(ciphertext: string, iv: string, code: string): Promise<string> {
  try {
    const key = await deriveKey(code);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuffer(iv) },
      key,
      base64ToBuffer(ciphertext)
    );
    return decoder.decode(decrypted);
  } catch {
    return '[Unable to decrypt — wrong room or corrupted]';
  }
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
