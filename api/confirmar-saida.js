export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido"
    });
  }

  const apartamento = String(
    req.body?.apartamento || ""
  );

  if (!/^[a-zA-Z0-9-]{1,20}$/.test(apartamento)) {
    return res.status(400).json({
      erro: "Apartamento inválido"
    });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      erro: "Serviço de e-mail não configurado"
    });
  }

  try {
    const resposta = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "INDO <onboarding@resend.dev>",
          to: ["contato.felipelinos@gmail.com", "nanifisio32@gmail.com"],
          subject: `Checkout confirmado — Apartamento ${apartamento}`,
          text:
            `A saída foi confirmada.\n\n` +
            `Apartamento: ${apartamento}\n` +
            `Data e horário: ${new Date().toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo"
            })}\n\n` +
            `A equipe de limpeza foi avisada pela INDO.`
        })
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      console.error("Falha no Resend:", resultado);
      return res.status(502).json({
        erro: "Não foi possível enviar o e-mail"
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Confirmação enviada"
    });

  } catch (erro) {
    console.error("Erro no envio:", erro);

    return res.status(500).json({
      erro: "Erro interno ao enviar confirmação"
    });
  }
}
