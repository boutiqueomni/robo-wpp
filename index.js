console.log("Iniciando o bot...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(), // Mantém a sessão salva
    puppeteer: {
        headless: true, // Garante que rode sem interface gráfica na nuvem
        args: ["--no-sandbox", "--disable-setuid-sandbox"] // Evita erros no ambiente do Render
    }
});

let usuariosAtendidos = new Map();

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code para conectar:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot conectado e pronto para responder!');
});

const MENU_INICIAL = 
    "Oi, tudo bem? Bem-vindo(a) à *Boutique Omni*! 💃🕺 Como posso te ajudar hoje?\n\n" +
    "1️⃣ - Como comprar no site\n" +
    "2️⃣ - Trocas e devoluções\n" +
    "3️⃣ - Formas de pagamento\n" +
    "4️⃣ - Consultar tamanhos e estoque\n" +
    "5️⃣ - Novidades e promoções\n" +
    "6️⃣ - Falar com um atendente\n" +
    "7️⃣ - Encerrar atendimento\n\n" +
    "Digite 'iniciar' a qualquer momento para voltar ao menu!";

client.on('message', async message => {
    const msg = message.body.trim().toLowerCase();
    const numeroCliente = message.from;
    
    // Ignorar mensagens de grupos
    if (message.from.includes('@g.us')) {
        return;
    }

    // Verificar se o cliente quer reiniciar o atendimento
    if (msg === 'iniciar') {
        usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
        return message.reply(MENU_INICIAL);
    }

    // Se o cliente não está no Map, inicia um novo atendimento
    if (!usuariosAtendidos.has(numeroCliente)) {
        usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
        return message.reply(MENU_INICIAL);
    }

    const estadoAtual = usuariosAtendidos.get(numeroCliente);

    if (!estadoAtual.ativo) {
        return;
    }

    if (estadoAtual.etapa === 'menu_inicial') {
        switch (msg) {
            case "1":
                return message.reply(
                    "🛒 Para comprar, acesse *www.boutiqueomni.com.br*, escolha suas peças favoritas, adicione ao carrinho e finalize o pedido.\n" +
                    "1️⃣ - Rastrear pedido\n" +
                    "2️⃣ - Prazos de entrega\n" +
                    "3️⃣ - Voltar ao menu principal"
                ).then(() => usuariosAtendidos.set(numeroCliente, { etapa: 'como_comprar', ativo: true }));

            case "6":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: false });
                return message.reply(
                    "📞 Um atendente foi acionado! Aguarde um momento.\n\n" +
                    "Para voltar ao menu, diga 'iniciar'!"
                );

            case "7":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: false });
                return message.reply(
                    "👋 Atendimento encerrado! Foi um prazer te ajudar. Volte quando quiser! 💖\n\n" +
                    "Para começar de novo, é só dizer 'iniciar'!"
                );

            default:
                return message.reply(
                    "Ops, opção inválida! Escolha entre 1 e 7 para continuar. 😊"
                );
        }
    }
});

client.initialize();
