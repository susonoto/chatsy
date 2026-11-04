/**
 * Message persistence is INTENTIONALLY DISABLED.
 *
 * Chatsy is a pure ephemeral chat:
 * - No messages are saved on the server
 * - No messages are saved in the browser
 * - Late joiners always see an empty chat
 * - Refreshing the page clears all messages
 *
 * Only the UI theme preference is stored in localStorage.
 */

export function clearAllChatData() {
  // Remove any leftover keys from older versions
  Object.keys(localStorage)
    .filter(k => k.startsWith('chatsy_chat_') || k.startsWith('ephemera_chat_'))
    .forEach(k => localStorage.removeItem(k))
}
