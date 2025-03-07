console.log("Iniciando o bot...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: process.env.WHATSAPP_SESSION_PATH || '/tmp/session' })
});


let usuariosAtendidos = new Map();

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code usando esta string:');
    console.log(qr); // Exibe a string bruta do QR code
    console.log('Copie o texto acima e use um gerador de QR como https://qr.io/');
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
    "7️⃣ - Encerrar atendimento";

client.on('message', async message => {
    const msg = message.body.trim().toLowerCase();
    const numeroCliente = message.from;

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
                    "🛒 Para comprar, é super fácil! Acesse *www.boutiqueomni.com.br*, escolha suas peças favoritas, adicione ao carrinho e finalize o pedido. " +
                    "Dúvidas?\n" +
                    "a) Rastrear pedido\n" +
                    "b) Prazos de entrega\n" +
                    "c) Voltar ao menu principal"
                ).then(() => usuariosAtendidos.set(numeroCliente, { etapa: 'como_comprar', ativo: true }));
            case "2":
                return message.reply(
                    "🔄 Trocas e devoluções são tranquilas! Você tem até 7 dias após o recebimento para solicitar. " +
                    "Veja mais em *www.boutiqueomni.com.br/politica-troca*.\n" +
                    "Quer ajuda com:\n" +
                    "a) Como iniciar uma troca\n" +
                    "b) Reembolso\n" +
                    "c) Voltar ao menu principal"
                ).then(() => usuariosAtendidos.set(numeroCliente, { etapa: 'trocas', ativo: true }));
            case "3":
                return message.reply(
                    "💳 Temos várias opções pra você: PIX, crédito em até 5x sem juros\n" +
                    "Escolha na hora de finalizar!\n" +
                    "Mais detalhes?\n" +
                    "a) PIX\n" +
                    "b) Parcelamento\n" +
                    "c) Voltar ao menu principal"
                ).then(() => usuariosAtendidos.set(numeroCliente, { etapa: 'pagamento', ativo: true }));
            case "4":
                return message.reply(
                    "👗 Quer saber se aquela peça dos sonhos está disponível? Me diz:\n" +
                    "a) Consultar tamanho\n" +
                    "b) Verificar estoque\n" +
                    "c) Voltar ao menu principal"
                ).then(() => usuariosAtendidos.set(numeroCliente, { etapa: 'tamanhos_estoque', ativo: true }));
            case "5":
                return message.reply(
                    "✨ Temos novidades toda semana! Quer conferir?\n" +
                    "a) Lançamentos\n" +
                    "b) Promoções do mês\n" +
                    "c) Voltar ao menu principal"
                ).then(() => usuariosAtendidos.set(numeroCliente, { etapa: 'novidades', ativo: true }));
            case "6":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: false });
                return message.reply(
                    "📞 Beleza, vou chamar um atendente pra te ajudar! Nosso horário é de segunda a sexta, das 9h às 17h. " +
                    "Aguarde um pouquinho!"
                );
            case "7":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: false });
                return message.reply(
                    "👋 Atendimento encerrado! Foi um prazer te ajudar. Volte quando quiser, viu? 💖"
                );
            default:
                return message.reply(
                    "Ops, opção inválida! Escolha entre 1 e 7 para continuar. 😊"
                );
        }
    }
});

client.initialize();