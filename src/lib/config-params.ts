// OpenAI API Parameters
export const AI_PARAMS = {
  // Model selection
  HINTS_MODEL: "gpt-3.5-turbo",
  FOLLOW_UP_MODEL: "gpt-3.5-turbo",
  OPEN_ENDED_MODEL: "gpt-3.5-turbo",
  
  // Model parameters
  HINTS_TEMPERATURE: 0.2,
  FOLLOW_UP_TEMPERATURE: 0.3,
  OPEN_ENDED_TEMPERATURE: 0.2,
  HINTS_MAX_TOKENS: 800,
  FOLLOW_UP_MAX_TOKENS: 400,
  MAX_TOKENS: 800,
  TEMPERATURE: 0.3,
  
  // Request timeouts
  HINTS_TIMEOUT_MS: 20000, // 20 seconds
  FOLLOW_UP_TIMEOUT_MS: 15000, // 15 seconds
  API_TIMEOUT_MS: 30000, // 30 seconds
  OPEN_ENDED_TIMEOUT_MS: 25000, // 25 seconds
}

// Hints Generation Parameters
export const HINTS_PARAMS = {
  MIN_STEPS: 3,
  MAX_STEPS: 8, // Allow up to 8 steps per your request
  MIN_MISCONCEPTIONS: 1,
  MAX_MISCONCEPTIONS: 2,
}

// Caching Parameters
export const CACHE_PARAMS = {
  HINTS_CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes
  FOLLOW_UP_CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes
  QUESTIONS_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  MAX_QUESTIONS_CACHE_SIZE: 20,
}

// UI Parameters
export const UI_PARAMS = {
  CORRECT_ANSWER_DELAY_MS: 1500, // Delay after correct answer
  AUTO_PROCEED_AFTER_CORRECT: false, // Don't automatically go to next question
  FIRST_HINT_LABEL: "İşte Bir İpucu",
  MORE_HINTS_LABEL: "Daha Fazla İpucu",
  SHOW_MORE_HINTS_BUTTON_LABEL: "Biraz Daha İpucu Ver",
  LOADING_MORE_HINTS_BUTTON_LABEL: "İpucu Yükleniyor...",
  FULL_EXPLANATION_LABEL: "Tam Açıklama",
  ASK_FOLLOW_UP_BUTTON_LABEL: "Anlamadığım Bir Şey Var",
  OPEN_ENDED_MAX_CHARS: 1000,
}

// Question Type Parameters
export const QUESTION_TYPE_PARAMS = {
  OPEN_QUESTION_WEIGHT_PREP: 50, // 50% open-ended questions in preparation mode
  OPEN_QUESTION_WEIGHT_TEST: 50, // 50% open-ended questions in test mode
}

// Testing Mode Parameters
export const TESTING_PARAMS = {
  QUESTIONS_PER_TEST: 10,
  TIME_WARNING_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes warning
  MAX_TEST_TIME_MS: 20 * 60 * 1000, // 20 minutes maximum
  SAVE_TEST_RESULTS: true,
}

// Default Messages
export const DEFAULT_MESSAGES = {
  DEFAULT_HINT: "Bu soru için adım adım çözümü yüklerken bir sorun oluştu.",
  DEFAULT_EXPLANATION: "Açıklama yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
  LOADING_HINTS: "İpuçları yükleniyor...",
  ERROR_LOADING_HINTS: "İpucu yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
  FOLLOW_UP_ERROR: "Üzgünüm, sorunuzu işlerken bir hata oluştu. Lütfen tekrar deneyin.",
  NO_QUESTIONS_FOUND: "Bu konu ve sınıf seviyesi için soru bulunamadı. Lütfen başka bir seçim yapın.",
  QUESTION_LOAD_ERROR: "Soru yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
  TEST_COMPLETE: "Sınavınız tamamlandı! Sonuçlarınızı görmek için aşağıdaki butona tıklayın.",
  TIME_WARNING: "Dikkat! Sınavınızın bitmesine 5 dakika kaldı.",
  CORRECT_ANSWER_FEEDBACK: [
    "Mükemmel! Doğru cevap verdin.",
    "Harika! Tam da böyle olmalıydı.",
    "Doğru! Çok iyi çalışıyorsun.",
    "Tebrikler! Doğru cevabı buldun.",
    "Harika iş! Doğru cevap için tebrikler."
  ],
  INCORRECT_ANSWER_FEEDBACK: [
    "Bu cevap doğru değil. Bir daha düşünmeye ne dersin?",
    "Maalesef doğru değil. Adım adım düşünmeyi dene.",
    "Neredeyse! Ama tam olarak doğru değil.",
    "Bu doğru değil. İpuçlarına göz atmak ister misin?",
    "Doğru cevaba yaklaştın, ama tam olarak değil."
  ],
  OPEN_ENDED_EVALUATION_ERROR: "Yanıtınızı değerlendirirken bir hata oluştu. Lütfen tekrar deneyin.",
} 