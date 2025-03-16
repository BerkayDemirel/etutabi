import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Map subject codes to Turkish names
const subjectNames: Record<string, string> = {
  "math": "Matematik",
  "physics": "Fizik",
  "chemistry": "Kimya",
  "biology": "Biyoloji",
  "social-studies": "Sosyal Bilgiler",
  "english": "İngilizce"
};

export async function POST(request: Request) {
  // Add CORS headers
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://yourdomain.com'];
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  try {
    const {
      subject,
      grade,
      pageNumber,
      pageContent,
      pdfUrl,
      pdfPageNumber,
      followUpQuestion,
      previousConversation,
    } = await request.json();

    // Normalize subject value
    let normalizedSubject = subject;
    if (typeof subject === 'string') {
      // Remove any quotes if they exist
      if (subject.startsWith('"') && subject.endsWith('"')) {
        normalizedSubject = subject.slice(1, -1);
      }
      
      // Check if it's a valid subject
      if (!["math", "physics", "chemistry", "biology", "social-studies", "english"].includes(normalizedSubject)) {
        console.warn(`Invalid subject received: ${subject}, normalized to: ${normalizedSubject}`);
      }
    }

    // Log request details
    console.log(`Topic follow-up request - Subject: ${normalizedSubject}, Grade: ${grade}, Page: ${pageNumber}`);
    console.log(`Question: ${followUpQuestion}`);
    
    // Validate required fields
    if (!normalizedSubject || !grade || !followUpQuestion) {
      console.error("Missing required fields:", { subject: normalizedSubject, grade });
      return NextResponse.json(
        { error: "Gerekli alanlar eksik. Lütfen konu ve sınıf seçtiğinizden emin olun." },
        { status: 400 }
      );
    }

    // Check if we have either pageContent or pdfUrl
    if (!pageContent && !pdfUrl) {
      console.error("No content provided");
      return NextResponse.json(
        { error: "Sayfa içeriği veya PDF URL'si sağlanmadı." },
        { status: 400 }
      );
    }

    // If we have pageContent, use it directly
    let contentToUse = pageContent;
    
    // If pageContent is too short or empty, log a warning
    if (!contentToUse || contentToUse.trim().length < 50) {
      console.warn("Page content is short or empty:", contentToUse);
      if (!pdfUrl) {
        return NextResponse.json(
          { error: "Sayfa içeriği çok kısa veya boş. Lütfen PDF'in doğru yüklendiğinden emin olun." },
          { status: 400 }
        );
      }
    }

    console.log(`Content length: ${contentToUse?.length || 0} characters`);

    // Format previous conversation if it exists
    const conversationHistory = previousConversation && previousConversation.length > 0
      ? previousConversation
          .map(
            (msg: { question: string; answer: string; pageNumber?: number }) =>
              `Öğrenci (Sayfa ${msg.pageNumber || "?"} hakkında): ${msg.question}\nAsistan: ${msg.answer}`
          )
          .join("\n\n")
      : "";

    // Get subject name in Turkish
    const subjectName = subjectNames[normalizedSubject] || normalizedSubject;

    // Add LaTeX formatting instructions based on subject
    let latexInstructions = "";
    if (normalizedSubject === "math" || normalizedSubject === "physics" || normalizedSubject === "chemistry") {
      latexInstructions = `
Matematiksel ifadeleri LaTeX formatında yazın. Örneğin:
- Kesirler için: \\(\\frac{a}{b}\\)
- Üs almak için: \\(a^b\\)
- Alt indis için: \\(a_b\\)
- Kök almak için: \\(\\sqrt{a}\\)
- Matematiksel denklemler için \\( ... \\) kullanın.
- Uzun denklemler için \\[ ... \\] kullanın.

Örnek: "Kesir \\(\\frac{1}{2}\\) şeklinde yazılır."
`;
    }

    // Construct the prompt
    const prompt = `Sen bir ${grade}. sınıf ${subjectName} öğretmenisin. Öğrencinin konuyu anlamasına yardımcı oluyorsun.

Şu anda öğrenci ${pageNumber}. sayfadaki içeriği inceliyor. Sayfa içeriği:

"""
${contentToUse}
"""

${
  conversationHistory
    ? `\nÖnceki konuşma:\n${conversationHistory}\n`
    : ""
}

Öğrencinin yeni sorusu: ${followUpQuestion}

${latexInstructions}

Lütfen:
1. Soruyu sadece bu sayfadaki içeriğe dayanarak yanıtla. Eğer cevap sayfada yoksa, bunu dürüstçe belirt.
2. Yanıtı öğrencinin seviyesine (${grade}. sınıf) uygun, açık ve anlaşılır bir şekilde ver.
3. Gerektiğinde örnekler kullanarak açıkla.
4. Öğrencinin konuyu daha iyi anlamasını sağlayacak ipuçları ver.
5. Yanıtın kısa ve öz olsun, gereksiz uzatma.
6. Matematiksel ifadeleri LaTeX formatında yaz.

Yanıtı:`;

    // Log prompt length
    console.log(`Prompt length: ${prompt.length} characters`);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "Sen yardımsever bir öğretmensin. Öğrencilerin sorularını sabırla ve açık bir şekilde yanıtlıyorsun. Yanıtların kısa, öz ve anlaşılır olmalı. Matematiksel ifadeleri LaTeX formatında yazmalısın.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = response.choices[0].message.content;
    console.log(`Answer generated: ${answer?.substring(0, 100)}...`);

    // Return response with CORS headers
    return NextResponse.json(
      {
        answer,
        pageNumber,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error("Error in topic-follow-up API:", error);
    
    // Determine if it's an OpenAI API error
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Bilinmeyen bir hata oluştu";
    
    // Check if it's a rate limit or quota error
    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      return NextResponse.json(
        { error: "API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin." },
        { 
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
    
    return NextResponse.json(
      { error: "Sunucu hatası: " + errorMessage },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
} 