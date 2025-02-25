console.log("Iniciando o bot...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Armazena os números que já receberam o menu
let usuariosAtendidos = new Set();

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code abaixo para conectar:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot conectado e pronto para responder!');
});

client.on('message', async message => {
    const msg = message.body.trim().toLowerCase();
    const numeroCliente = message.from; // Identifica o número do cliente

    // Se for a primeira mensagem desse cliente, envia o menu e armazena o número
    if (!usuariosAtendidos.has(numeroCliente)) {
        usuariosAtendidos.add(numeroCliente);
        return message.reply(
            "Olá, tudo bem? Como podemos te ajudar?\n\n" +
            "1️⃣ - Duvidas sobre como comprar?\n" +
            "2️⃣ - Trocas\n" +
            "3️⃣ - Para pagamentos\n" +
            "4️⃣ - Falar com atendente\n" +
            "5️⃣ - Encerrar atendimento"
        );
    }

    // Respostas para as opções escolhidas
    if (msg === "1") {
        return message.reply("🛒 Para comprar, acesse nosso site: www.boutiqueomni.com.br. Adicione os produtos ao carrinho, finalize o pagamento e aguarde a entrega. Precisa de mais ajuda?");
    } else if (msg === "2") {
        return message.reply("🔄 Confira nossa política de trocas em: https://www.boutiqueomni.com.br/politica-troca. Solicite a troca em até 7 dias após o recebimento.");
    } else if (msg === "3") {
        return message.reply("💳 Aceitamos PIX e crédito parcelado em até 5x. Escolha a melhor opção para você na finalização da compra!");
    } else if (msg === "4") {
        return message.reply("📞 Aguarde um pouco, nosso atendente retornará em instantes. Nosso atendimento funciona de segunda a sexta, das 09h às 17h.");
    } else if (msg === "5") {
        usuariosAtendidos.delete(numeroCliente); // Remove o cliente do Set para reiniciar o fluxo na próxima interação
        return message.reply("👋 Atendimento encerrado. Até a próxima! Se precisar, é só chamar novamente.");
    }

    // Se o cliente mandar algo fora das opções, avisa que é inválido
    return message.reply("Opção inválida. Por favor, escolha entre 1, 2, 3, 4 ou 5.");
});

client.initialize();