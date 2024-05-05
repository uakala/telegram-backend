const TelegramBot = require('node-telegram-bot-api');

class TelegramAPI {
    constructor(token) {
        this.bot = new TelegramBot(token, { polling: true });
    }

    // Enviar un mensaje simple a un chat específico
    sendMessage(chatId, text) {
        return this.bot.sendMessage(chatId, text);
    }

    // Enviar un mensaje con opciones de teclado (markup)
    sendMessageWithKeyboard(chatId, text, keyboard) {
        const opts = {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
                one_time_keyboard: true
            }
        };
        return this.bot.sendMessage(chatId, text, opts);
    }

    // Función para configurar el manejador de comandos específicos
    onCommand(commandRegex, callback) {
        this.bot.onText(commandRegex, (msg, match) => {
            const chatId = msg.chat.id;
            const response = match[1];  // Los grupos capturados en el regex se pasan como segundo argumento
            callback(chatId, response);
        });
    }

    // Función para manejar cualquier mensaje
    onMessage(callback) {
        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            callback(chatId, text);
        });
    }
}

module.exports = TelegramAPI;

