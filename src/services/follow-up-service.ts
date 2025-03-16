export async function generateFollowUpResponse(
  originalQuestion: string,
  originalAnswer: string,
  studentQuestion: string,
  subject: string
): Promise<string> {
  try {
    const response = await fetch('/api/follow-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalQuestion,
        originalAnswer,
        studentQuestion,
        subject,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate follow-up response');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.response;
  } catch (error) {
    console.error("Error generating follow-up response:", error);
    return "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
  }
} 