export interface ExplanationResponse {
  logical_steps: string[];
  explanation: string;
  correct_answer_index: number;
  common_misconceptions?: string[];
}

export async function generateExplanation(
  question: string,
  options: string[],
  correctAnswerIndex: number,
  subject: string
): Promise<ExplanationResponse> {
  try {
    const response = await fetch('/api/explanations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        options,
        correctAnswerIndex,
        subject,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate explanation');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Error generating explanation:", error);
    return {
      logical_steps: ["Adımları oluşturmada bir hata oluştu."],
      explanation: "Açıklama oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      correct_answer_index: correctAnswerIndex,
    };
  }
}

// Mock data for demonstration purposes
function getMockExplanation(subject: string): ExplanationResponse {
  const explanations: Record<string, ExplanationResponse> = {
    math: {
      logical_steps: [
        "Öncelikle sorunun ne istediğini anlayalım: 2x + 5 = 20 denkleminde x değerini bulmamız gerekiyor.",
        "x'i yalnız bırakmak için, x'li terimi bir tarafa, diğer terimleri diğer tarafa toplayalım.",
        "Her iki taraftan 5 çıkaralım: 2x + 5 - 5 = 20 - 5, bu da bize 2x = 15 verir.",
        "Her iki tarafı 2'ye bölelim: 2x ÷ 2 = 15 ÷ 2, bu da bize x = 7.5 verir."
      ],
      explanation: "2x + 5 = 20 denklemini çözmek için, değişken x'i yalnız bırakmamız gerekiyor. Bunu yapmak için denklemin her iki tarafına aynı işlemleri uygulayarak eşitliği koruruz.\n\nİlk olarak, her iki taraftan 5 çıkararak 2x = 15 elde ederiz.\nSonra, her iki tarafı 2'ye bölerek x = 7.5 buluruz.\n\nCevabımızı kontrol etmek için x = 7.5 değerini orijinal denkleme yerleştirelim:\n2(7.5) + 5 = 15 + 5 = 20 ✓",
      correct_answer_index: 2,
      common_misconceptions: [
        "Bazı öğrenciler 5'i sadece sol taraftan çıkarabilir, bu yanlıştır çünkü her iki tarafa da aynı işlemi uygulamalıyız.",
        "Diğerleri önce 2'ye bölmeyi tercih edebilir, bu da 2x/2 + 5/2 = 20/2 verir ve hesaplamayı daha karmaşık hale getirir."
      ]
    },
    physics: {
      logical_steps: [
        "Düzgün doğrusal hareket, sabit hızla yapılan harekettir.",
        "Sabit hız demek, hızın zamanla değişmediği anlamına gelir.",
        "Hız-zaman grafiğinde, hız (y ekseni) zamanla (x ekseni) değişmiyorsa, bu bir yatay çizgi olarak görünür.",
        "Dolayısıyla, düzgün doğrusal hareketin hız-zaman grafiği yatay bir doğrudur."
      ],
      explanation: "Düzgün doğrusal hareket, bir cismin sabit hızla hareket ettiği durumu ifade eder. Sabit hız, hızın büyüklüğünün ve yönünün zamanla değişmediği anlamına gelir.\n\nHız-zaman grafiğinde, x ekseni zamanı, y ekseni ise hızı gösterir. Eğer hız sabit ise, bu grafikte yatay bir doğru olarak görünür. Çünkü zaman değişse bile hız değişmemektedir.\n\nBu nedenle, düzgün doğrusal hareketin hız-zaman grafiği yatay bir çizgidir. Eğer hız değişseydi (yani ivmeli hareket olsaydı), grafik eğimli bir doğru veya eğri olurdu.",
      correct_answer_index: 1,
      common_misconceptions: [
        "Bazı öğrenciler düzgün doğrusal hareketi, doğrusal bir yol izleyen herhangi bir hareket sanabilir, ancak hızın sabit olması gerekir.",
        "Hız-zaman grafiğindeki yatay çizgiyi, cismin durduğu şeklinde yorumlamak yaygın bir hatadır. Durma durumunda hız sıfırdır, ancak yatay çizgi herhangi bir sabit hızı gösterebilir."
      ]
    },
    chemistry: {
      logical_steps: [
        "İyonik bağ, bir metal ve bir ametal arasında elektron alışverişi ile oluşur.",
        "Metaller elektron verme eğilimindedir (elektropozitif).",
        "Ametaller elektron alma eğilimindedir (elektronegatif).",
        "Elektron transferi sonucunda, metal pozitif yüklü (katyon), ametal negatif yüklü (anyon) iyonlar oluşturur.",
        "Bu zıt yüklü iyonlar arasındaki elektrostatik çekim kuvveti, iyonik bağı oluşturur."
      ],
      explanation: "İyonik bağ, bir metal atomu ile bir ametal atomu arasında elektron transferi sonucu oluşan kimyasal bağ türüdür. Bu bağ oluşurken, metal atomu elektron vererek pozitif yüklü iyon (katyon) haline gelir, ametal atomu ise elektron alarak negatif yüklü iyon (anyon) haline gelir.\n\nÖrneğin, sodyum klorür (NaCl) bileşiğinde, sodyum (Na) metali bir elektron vererek Na+ katyonunu oluştururken, klor (Cl) ametali bir elektron alarak Cl- anyonunu oluşturur. Bu zıt yüklü iyonlar arasındaki elektrostatik çekim kuvveti, iyonik bağı meydana getirir.\n\nİyonik bağlar genellikle güçlüdür ve iyonik bileşikler tipik olarak yüksek erime ve kaynama noktalarına sahiptir. Ayrıca, katı halde elektriği iletmezler, ancak sıvı halde veya sulu çözeltide iyonlarına ayrışarak elektriği iletebilirler.",
      correct_answer_index: 1,
      common_misconceptions: [
        "Bazı öğrenciler iyonik bağın iki ametal arasında oluşabileceğini düşünür, ancak iki ametal arasında genellikle kovalent bağ oluşur.",
        "İyonik bağda elektronların paylaşıldığını düşünmek yaygın bir hatadır, oysa elektronlar bir atomdan diğerine tamamen transfer edilir."
      ]
    },
    biology: {
      logical_steps: [
        "Fotosentez, bitkilerin ışık enerjisini kimyasal enerjiye dönüştürdüğü bir süreçtir.",
        "Bu süreçte, bitkiler karbondioksit (CO₂) ve su (H₂O) kullanarak glikoz (C₆H₁₂O₆) üretir.",
        "Fotosentezin yan ürünü olarak oksijen (O₂) açığa çıkar.",
        "Oksijen, atmosfere salınır ve canlıların solunumu için hayati önem taşır."
      ],
      explanation: "Fotosentez, bitkilerin güneş ışığını kullanarak karbondioksit ve sudan besin (glikoz) ürettiği hayati bir süreçtir. Bu süreç, klorofil pigmenti içeren kloroplastlarda gerçekleşir.\n\nFotosentezin kimyasal denklemi şöyledir:\n6CO₂ + 6H₂O + ışık enerjisi → C₆H₁₂O₆ + 6O₂\n\nBu denklem, bitkilerin havadan karbondioksit ve topraktan su alarak, güneş enerjisi yardımıyla glikoz (şeker) ürettiğini ve yan ürün olarak oksijen saldığını gösterir. Üretilen bu oksijen, atmosfere salınır ve solunum yapan canlılar için yaşamsal öneme sahiptir.\n\nFotosentez, dünya üzerindeki yaşamın devamı için kritik öneme sahiptir çünkü hem besin zincirinin temelini oluşturur hem de atmosferdeki oksijen seviyesini dengeler.",
      correct_answer_index: 0,
      common_misconceptions: [
        "Bazı öğrenciler fotosentezi solunum ile karıştırır, oysa solunum fotosentezin tersi bir süreçtir.",
        "Bitkilerin sadece güneş ışığına ihtiyaç duyduğunu düşünmek yaygın bir hatadır, oysa karbondioksit ve su da gereklidir."
      ]
    },
    "social-studies": {
      logical_steps: [
        "İngiltere'deki Sanayi Devrimi'nin (1760-1840) birçok nedeni vardı.",
        "Bu nedenler arasında teknolojik yenilikler, tarım devrimi, doğal kaynaklar ve sömürge ticareti bulunuyordu.",
        "Özellikle kömür ve demir cevheri gibi doğal kaynakların bolluğu, sanayi büyümesi için gerekli hammaddeleri sağladı.",
        "Bu kaynaklar, buhar makinelerini çalıştırmak ve fabrikaları inşa etmek için gerekliydi.",
        "Diğer faktörler önemli olsa da, doğal kaynakların bolluğu olmadan sanayi devrimi gerçekleşemezdi."
      ],
      explanation: "İngiltere'deki Sanayi Devrimi (1760-1840 civarı), birbiriyle bağlantılı birçok faktörden etkilenmiştir, ancak kömür ve demir cevheri gibi doğal kaynakların bolluğu, gelişiminde temel rol oynamıştır.\n\nİngiltere'de büyük kömür yatakları bulunuyordu ve bu, yeni makineleri çalıştırmak için gereken enerjiyi sağlıyordu. Ayrıca, demir cevheri de bu makinelerin ve demiryolları gibi altyapıların inşası için gerekliydi. Bu kaynaklar genellikle birbirine yakın konumdaydı, bu da nakliye maliyetlerini azaltıyordu.\n\nBuhar makinesi gibi teknolojik yenilikler, tarımsal iyileştirmeler (işgücünü serbest bırakan) ve sömürge ticareti (pazar ve sermaye sağlayan) gibi diğer faktörler de önemliydi, ancak İngiltere'nin doğal kaynaklarının sağladığı hammaddeler olmadan yeterli olmazlardı. Örneğin, buhar makinesinin çalışması için kömür, üretim tesislerinin inşası için de demir gerekliydi.\n\nBu faktörlerin kombinasyonu, doğal kaynaklar temel alınarak, İngiltere'nin dünyanın ilk sanayileşmiş ülkesi olmasını sağladı.",
      correct_answer_index: 3,
      common_misconceptions: [
        "Bazı öğrenciler teknolojik yeniliklerin önemini abartabilir, ancak bu yenilikler mevcut kaynaklara bağlıydı.",
        "Diğerleri sömürge zenginliğine çok fazla odaklanabilir, ancak bu zenginliğin doğal kaynaklar aracılığıyla sanayi kapasitesine nasıl dönüştürüldüğünü anlamak önemlidir."
      ]
    },
    english: {
      logical_steps: [
        "Öncelikle sorunun ne istediğini anlayalım: Pasajın ana temasını bulmamız gerekiyor.",
        "Pasaj boyunca tekrarlanan fikir veya kavramları aramalıyız.",
        "Yazarın, karakterlerin zorluklara rağmen ilerlemesi üzerine nasıl vurgu yaptığına dikkat edelim.",
        "Sonuç bölümünün, engellerin aşılmasının büyümeye yol açtığı fikrini nasıl pekiştirdiğini düşünelim."
      ],
      explanation: "Bir pasajın ana temasını belirlemek için, yazarın iletmeye çalıştığı tekrarlanan fikirleri, kavramları veya mesajları aramamız gerekir. Bu pasajda, yazar sürekli olarak karakterlerin zorluklarla karşılaştığını ancak zorluklara rağmen ilerlemeye devam ettiğini vurguluyor.\n\nYazar, zorluklar karşısında sebat eden bireylerin çeşitli örneklerini sunuyor ve sonuç özellikle 'gerçek büyümenin engelleri aşarak gerçekleştiği' ifadesini içeriyor. Bu, zorluklara karşı sebat etmenin değerli olduğu ve kişisel gelişime yol açtığı şeklindeki merkezi mesajı pekiştiriyor.\n\nPasajda arkadaşlık ve yaratıcılık gibi kavramlardan da bahsedilse de, bunlar ana temayı destekleyen ikincil unsurlardır.",
      correct_answer_index: 0,
      common_misconceptions: [
        "Bazı okuyucular genel mesaj yerine belirli örneklere çok fazla odaklanabilir.",
        "Diğerleri ikincil temaları veya destekleyici detayları ana tema ile karıştırabilir."
      ]
    }
  };

  return explanations[subject] || {
    logical_steps: [
      "Öncelikle sorunun ne istediğini anlayalım.",
      "Verilen bilgileri dikkatlice analiz edelim.",
      "Problemi çözmek için ilgili kavramları uygulayalım.",
      "Cevabımızın bağlam içinde mantıklı olup olmadığını kontrol edelim."
    ],
    explanation: "Bu genel bir açıklamadır çünkü belirli konu detayları mevcut değildi. Gerçek bir uygulamada, belirli soruya özel ayrıntılı, adım adım bir açıklama sunulacaktır.",
    correct_answer_index: 0,
  };
} 