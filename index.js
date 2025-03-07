console.log("Iniciando o bot...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode'); 

const client = new Client({
    authStrategy: new LocalAuth()
});

let usuariosAtendidos = new Map();

client.on('qr', async (qr) => {
    console.log('Gerando QR Code...');
    try {
        // Gera o QR Code com um tamanho personalizado (exemplo: 200px de largura)
        const qrCodeUrl = await qrcode.toDataURL(qr, { width: 200 });
        console.log('Escaneie o QR Code acessando este link ou copie-o para o navegador:');
        console.log(qrCodeUrl);
        
    
    } catch (err) {
        console.error('Erro ao gerar QR Code:', err);
    }
});

client.on('ready', () => {
    console.log('Bot conectado e pronto para responder!');
});

// Mensagem do menu inicial como uma constante para reutilização
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

    // Submenu: Como Comprar
    if (estadoAtual.etapa === 'como_comprar') {
        switch (msg) {
            case "a":
                usuariosAtendidos.set(numeroCliente, { etapa: 'como_comprar', ativo: false });
                return message.reply("📦 Para rastrear seu pedido, use o código que enviamos no seu e-mail após a compra. Um atendente vai te ajudar agora!");
            case "b":
                usuariosAtendidos.set(numeroCliente, { etapa: 'como_comprar', ativo: false });
                return message.reply("🚚 Nosso prazo é de 5 a 15 dias úteis, dependendo da sua região. Um atendente vai te ajudar com o número do pedido!");
            case "c":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(MENU_INICIAL);
            default:
                return message.reply("Escolha entre 'a', 'b' ou 'c', por favor!");
        }
    }

    // Submenu: Trocas e Devoluções
    if (estadoAtual.etapa === 'trocas') {
        switch (msg) {
            case "a":
                usuariosAtendidos.set(numeroCliente, { etapa: 'trocas', ativo: false });
                return message.reply("🔄 Para começar uma troca, envie o código do pedido e uma foto da peça. Um atendente vai te ajudar agora!");
            case "b":
                usuariosAtendidos.set(numeroCliente, { etapa: 'trocas', ativo: false });
                return message.reply("💸 Reembolsos são feitos em até 15 dias úteis após a devolução chegar aqui. Um atendente vai te ajudar agora!");
            case "c":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(MENU_INICIAL);
            default:
                return message.reply("Escolha entre 'a', 'b' ou 'c', por favor!");
        }
    }

    // Submenu: Pagamento
    if (estadoAtual.etapa === 'pagamento') {
        switch (msg) {
            case "a":
                usuariosAtendidos.set(numeroCliente, { etapa: 'pagamento', ativo: false });
                return message.reply("💰 No PIX o QR Code aparece na finalização do pedido. Um atendente vai te ajudar agora!");
            case "b":
                usuariosAtendidos.set(numeroCliente, { etapa: 'pagamento', ativo: false });
                return message.reply("💳 Parcelamos em até 5x sem juros no crédito. Um atendente vai te ajudar agora!");
            case "c":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(MENU_INICIAL);
            default:
                return message.reply("Escolha entre 'a', 'b' ou 'c', por favor!");
        }
    }

    // Submenu: Tamanhos e Estoque
    if (estadoAtual.etapa === 'tamanhos_estoque') {
        switch (msg) {
            case "a":
                usuariosAtendidos.set(numeroCliente, { etapa: 'tamanhos_estoque', ativo: false });
                return message.reply("📏 Me fala o nome da peça que você quer e um atendente te diz os tamanhos disponíveis!");
            case "b":
                usuariosAtendidos.set(numeroCliente, { etapa: 'tamanhos_estoque', ativo: false });
                return message.reply("🛍️ Qual item você quer conferir? Um atendente vai verificar no estoque pra você!");
            case "c":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(MENU_INICIAL);
            default:
                return message.reply("Escolha entre 'a', 'b' ou 'c', por favor!");
        }
    }

    // Submenu: Novidades e Promoções
    if (estadoAtual.etapa === 'novidades') {
        switch (msg) {
            case "a":
                usuariosAtendidos.set(numeroCliente, { etapa: 'novidades', ativo: false });
                return message.reply("✨ Os lançamentos da semana estão no site! Um atendente pode te ajudar com mais detalhes!");
            case "b":
                usuariosAtendidos.set(numeroCliente, { etapa: 'novidades', ativo: false });
                return message.reply("🔥 Promo do mês: Um atendente vai te passar as ofertas atuais!");
            case "c":
                usuariosAtendidos.set(numeroCliente, { etapa: 'menu_inicial', ativo: true });
                return message.reply(MENU_INICIAL);
            default:
                return message.reply("Escolha entre 'a', 'b' ou 'c', por favor!");
        }
    }
});

client.initialize();