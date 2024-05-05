const TelegramAPI = require('./service/TelegramAPI');
const token = '6982924941:AAEnNmDlLi8LR7DI3VdwHi-UsUFSKbEOWyE'; // Asegúrate de reemplazar esto con el token real de tu bot
const axios = require('axios');

// Instancia del servicio de Telegram
const telegramService = new TelegramAPI(token);

// Objeto para mantener el estado de cada chat
const chatStates = {};

function setupBot() {
    telegramService.onCommand(/^\/start$/, (chatId, response) => {
        telegramService.sendMessage(chatId, "Welcome to our Telegram bot! How can I help you today?");
        delete chatStates[chatId]; // Limpiar cualquier estado anterior
    });

    telegramService.onCommand(/^\/orders$/, (chatId, response) => {
        telegramService.sendMessage(chatId, "Please send your phone number to fetch your orders.");
        chatStates[chatId] = { awaiting: 'phone_number' }; // Establecer estado esperando número
    });

    telegramService.onMessage((chatId, text) => {
        if (text.startsWith('/')) return; // Ignorar si es un comando

        if (chatStates[chatId] && chatStates[chatId].awaiting === 'phone_number') {
            const normalizedPhone = text.replace(/[^+\d]/g, ''); // Elimina caracteres no numéricos excepto +
            if (normalizedPhone.match(/^\+?\d{10,}$/)) { // Validar número de teléfono
                fetchOrders(chatId, normalizedPhone);
                delete chatStates[chatId]; // Limpiar el estado después de procesar
            } else {
                telegramService.sendMessage(chatId, "Please send a valid phone number.");
            }
        } else {
            if (text.toLowerCase().includes("help")) {
                telegramService.sendMessage(chatId, "You can use commands like /start and /orders to interact with me.");
            } else {
                telegramService.sendMessage(chatId, "Sorry, I didn't understand that. Try asking for /help.");
            }
        }
    });

    console.log('Bot has been set up and is running!');
}

function fetchOrders(chatId, phoneNumber) {
    const url = `https://xwj39pysal.execute-api.us-east-1.amazonaws.com/dev/api/orders/pending?phone=${phoneNumber}`;
    axios.get(url)
        .then(response => {
            const orders = response.data;
            const message = orders.map(order => `Order ${order.orderid}, Total cost: ${order.total}$`).join('\n');
            telegramService.sendMessage(chatId, message || "No orders found for this number.");
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            telegramService.sendMessage(chatId, "Failed to fetch orders. Please try again.");
        });
}

setupBot();