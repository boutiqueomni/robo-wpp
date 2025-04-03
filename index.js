console.log("Iniciando o bot...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const client = new Client({
    authStrategy: new LocalAuth()
});

let usuariosAtendidos = new Map();
const NUMERO_ATENDENTE = "5511986480047@c.us"; 

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

client.on('qr', (qr) => {
    console.log('Gerando QR Code...');
    qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
        if (err) {
            console.error('Erro ao gerar QR Code:', err);
            return;
        }
        console.log(url);
        console.log('Escaneie o QR Code acima com o WhatsApp! (Apenas na primeira vez)');
    });
});

client.on('ready', () => {
    console.log('Bot conectado e pronto para responder!');
});

client.on('message', async (message) => {
    const msg = message.body.trim().toLowerCase();
    const numeroCliente = message.from;

    if (message.from.includes('@g.us')) {
        return;
    }

    if (numeroCliente === NUMERO_ATENDENTE && msg === 'encerrar bot') {
        console.log('Bot encerrado pelo atendente.');
        await message.reply('Bot encerrado pelo atendente. Até logo! 👋');
        await client.destroy();
        process.exit(0);
        return;
    }

    if (msg === 'iniciar') {
        usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
        return message.reply(MENU_INICIAL);
    }

    if (!usuariosAtendidos.has(numeroCliente)) {
        usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
        return message.reply(MENU_INICIAL);
    }

    const estadoAtual = usuariosAtendidos.get(numeroCliente);

    if (!estadoAtual.ativo) {
        return;
    }

    // Tratamento do menu inicial
    if (estadoAtual.etapa === 'menu_inicial') {
        switch (msg) {
            case "1":
                usuariosAtendidos.set(numeroCliente, { etapa: 'como_comprar', ativo: true });
                return message.reply(
                    "🛒 Para comprar, acesse *www.boutiqueomni.com.br*, escolha suas peças favoritas, adicione ao carrinho e finalize o pedido.\n\n" +
                    "1️⃣ - Rastrear pedido\n" +
                    "2️⃣ - Prazos de entrega\n" +
                    "3️⃣ - Voltar ao menu principal"
                );

            case "2":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(
                    "🔄 Para trocas e devoluções, acesse *www.boutiqueomni.com.br/trocas* e siga as instruções.\n" +
                    "Caso precise de mais ajuda, diga '6' para falar com um atendente."
                );

            case "3":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(
                    "💳 Aceitamos as seguintes formas de pagamento:\n\n" +
                    "✅ Cartão de crédito e débito\n" +
                    "✅ Pix\n" +
                    "Dúvidas? Diga '6' para falar com um atendente."
                );

            case "4":
                usuariosAtendidos.set(numeroCliente, { etapa: 'aguardando_atendente', ativo: false });
                return message.reply(
                    "📏 Para consultar tamanhos e estoque, nos informe qual o item você está querendo?\n\n" +
                    "A partir de agora, um atendente vai te ajudar. Para voltar ao menu, diga 'iniciar'!"
                );

            case "5":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(
                    "🔥 Para conferir as últimas novidades e promoções, visite nossa página de ofertas em *www.boutiqueomni.com.br*."
                );

            case "6":
                usuariosAtendidos.set(numeroCliente, { etapa: 'aguardando_atendente', ativo: false });
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
                    "❌ Opção inválida! Escolha entre 1 e 7 para continuar. 😊"
                );
        }
    }

    // Tratamento da etapa "como_comprar"
    if (estadoAtual.etapa === 'como_comprar') {
        switch (msg) {
            case "1":
                return message.reply(
                    "📦 Para rastrear seu pedido, verifique a sua caixa de e-mail, e procure por Boutique Omni, até no Spam"
                );

            case "2":
                return message.reply(
                    "🚚 O prazo de entrega varia de 5 a 15 dias úteis, dependendo da sua região. Confira mais detalhes no checkout!"
                );

            case "3":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(MENU_INICIAL);

            default:
                return message.reply(
                    "❌ Opção inválida! Escolha entre 1, 2 ou 3. 😊"
                );
        }
    }
});

client.on('error', (error) => {
    console.error('Erro no bot:', error);
});

client.initialize();