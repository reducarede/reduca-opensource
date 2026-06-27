const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qozmurfkmnbtryvzmayt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const generatePostFromTopic = async (topic) => {
  try {
    const prompt = `Atue como um professor ou especialista educacional. O usuário pediu para criar um post ou conteúdo sobre o seguinte tema: "${topic}".
Escreva um texto curto, dinâmico e interessante, ideal para um feed de uma rede social educacional chamada Reduca.
Use emojis apropriados. Não precisa de título longo, vá direto ao ponto. Mantenha em no máximo 3 ou 4 parágrafos pequenos.`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'generateContent',
        payload: { prompt }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na API');
    return data.text || "";
  } catch (error) {
    console.error('Erro ao gerar post:', error);
    throw new Error(`Erro da IA: ${error.message}`);
  }
};

export const chatWithAI = async (message, history = []) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'chat',
        payload: { message, history }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na API');
    return data.text || "";
  } catch (error) {
    console.error("Erro no chat IA:", error);
    throw new Error(`Erro da IA: ${error.message}`);
  }
};

export const generateContent = async (prompt) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'generateContent',
        payload: { prompt }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na API');
    return data.text || "";
  } catch (error) {
    console.error('Erro na chamada da IA:', error);
    throw new Error(`Erro da IA: ${error.message}`);
  }
};
