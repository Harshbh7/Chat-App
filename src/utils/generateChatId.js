// src/utils/generateChatId.js
export const generateChatId = (user1, user2) => {
    const users = [user1, user2].sort();
    return `${users[0]}_${users[1]}`; // Generates a unique chat ID
  };
  
  