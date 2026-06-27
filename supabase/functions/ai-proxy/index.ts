import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error("API Key não configurada no servidor.")
    }

    if (action === 'generateContent') {
      const { prompt } = payload
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || "Erro na API Gemini")

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'chat') {
      const { message, history } = payload
      
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))

      formattedHistory.push({ role: 'user', parts: [{ text: message }] })

      const systemInstruction = 'Você é o "Assistente Reduca", um assistente virtual para ajudar professores, alunos e gestores na rede social educacional Reduca. Seja amigável, prestativo e use uma linguagem clara.'

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: formattedHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error?.message || "Erro na API Gemini")

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error("Ação não reconhecida")

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
