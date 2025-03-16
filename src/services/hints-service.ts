// This service provides predefined hints in Turkish for specific questions
// We'll organize hints by subject and question ID

interface HintSet {
  logical_steps: string[];
  explanation: string;
  common_misconceptions?: string[];
}

interface HintDatabase {
  [subject: string]: {
    [questionId: string]: HintSet;
  };
}

// Our database of predefined hints
const hintsDatabase: HintDatabase = {
  math: {
    "math-1": {
      logical_steps: [
        "Öncelikle denklemin ne istediğini anlayalım: 2x + 5 = 20 denkleminde x değerini bulmamız gerekiyor.",
        "Denklemi çözmek için, x'i yalnız bırakmalıyız. Bunun için önce 5'i her iki taraftan çıkaralım.",
        "2x + 5 - 5 = 20 - 5 işlemini yaparsak, 2x = 15 elde ederiz.",
        "Şimdi her iki tarafı 2'ye bölelim: 2x ÷ 2 = 15 ÷ 2, bu da bize x = 7.5 sonucunu verir."
      ],
      explanation: "2x + 5 = 20 denklemini çözmek için, değişken x'i yalnız bırakmamız gerekiyor. Bunu yapmak için denklemin her iki tarafına aynı işlemleri uygulayarak eşitliği koruruz.\n\nİlk olarak, her iki taraftan 5 çıkararak 2x = 15 elde ederiz.\nSonra, her iki tarafı 2'ye bölerek x = 7.5 buluruz.\n\nCevabımızı kontrol etmek için x = 7.5 değerini orijinal denkleme yerleştirelim:\n2(7.5) + 5 = 15 + 5 = 20 ✓",
      common_misconceptions: [
        "Bazı öğrenciler 5'i sadece sol taraftan çıkarabilir, bu yanlıştır çünkü her iki tarafa da aynı işlemi uygulamalıyız.",
        "Diğerleri önce 2'ye bölmeyi tercih edebilir, bu da 2x/2 + 5/2 = 20/2 verir ve hesaplamayı daha karmaşık hale getirir."
      ]
    },
    "math-2": {
      logical_steps: [
        "Öncelikle problemin ne istediğini anlayalım: Bir üçgenin iç açılarının toplamını bulmamız gerekiyor.",
        "Geometride, bir üçgenin iç açılarının toplamı her zaman 180 derecedir.",
        "Verilen açılar: 45° ve 60°. Üçüncü açıyı bulmak için 180° - 45° - 60° hesaplamasını yapmalıyız.",
        "180° - 45° - 60° = 180° - 105° = 75°. Dolayısıyla üçüncü açı 75 derecedir."
      ],
      explanation: "Bir üçgenin iç açılarının toplamı her zaman 180 derecedir. Bu, geometrinin temel bir özelliğidir.\n\nVerilen iki açı 45° ve 60° olduğuna göre, üçüncü açıyı bulmak için bu açıları 180 dereceden çıkarmamız gerekir:\n\n180° - 45° - 60° = 180° - 105° = 75°\n\nBu nedenle, üçgenin üçüncü açısı 75 derecedir.",
      common_misconceptions: [
        "Bazı öğrenciler üçgenin iç açılarının toplamının 360 derece olduğunu düşünebilir, ancak bu çokgenler için geçerlidir, üçgenler için değil.",
        "Diğerleri açıları doğrudan toplayıp üçüncü açıyı bulmaya çalışabilir, ancak doğru yaklaşım 180 dereceden çıkarmaktır."
      ]
    }
  },
  physics: {
    "physics-1": {
      logical_steps: [
        "Düzgün doğrusal hareket, sabit hızla yapılan harekettir.",
        "Sabit hız demek, hızın zamanla değişmediği anlamına gelir.",
        "Hız-zaman grafiğinde, hız (y ekseni) zamanla (x ekseni) değişmiyorsa, bu bir yatay çizgi olarak görünür.",
        "Dolayısıyla, düzgün doğrusal hareketin hız-zaman grafiği yatay bir doğrudur."
      ],
      explanation: "Düzgün doğrusal hareket, bir cismin sabit hızla hareket ettiği durumu ifade eder. Sabit hız, hızın büyüklüğünün ve yönünün zamanla değişmediği anlamına gelir.\n\nHız-zaman grafiğinde, x ekseni zamanı, y ekseni ise hızı gösterir. Eğer hız sabit ise, bu grafikte yatay bir doğru olarak görünür. Çünkü zaman değişse bile hız değişmemektedir.\n\nBu nedenle, düzgün doğrusal hareketin hız-zaman grafiği yatay bir çizgidir. Eğer hız değişseydi (yani ivmeli hareket olsaydı), grafik eğimli bir doğru veya eğri olurdu.",
      common_misconceptions: [
        "Bazı öğrenciler düzgün doğrusal hareketi, doğrusal bir yol izleyen herhangi bir hareket sanabilir, ancak hızın sabit olması gerekir.",
        "Hız-zaman grafiğindeki yatay çizgiyi, cismin durduğu şeklinde yorumlamak yaygın bir hatadır. Durma durumunda hız sıfırdır, ancak yatay çizgi herhangi bir sabit hızı gösterebilir."
      ]
    }
  },
  chemistry: {
    "chemistry-1": {
      logical_steps: [
        "İyonik bağ, bir metal ve bir ametal arasında elektron alışverişi ile oluşur.",
        "Metaller elektron verme eğilimindedir (elektropozitif).",
        "Ametaller elektron alma eğilimindedir (elektronegatif).",
        "Elektron transferi sonucunda, metal pozitif yüklü (katyon), ametal negatif yüklü (anyon) iyonlar oluşturur.",
        "Bu zıt yüklü iyonlar arasındaki elektrostatik çekim kuvveti, iyonik bağı oluşturur."
      ],
      explanation: "İyonik bağ, bir metal atomu ile bir ametal atomu arasında elektron transferi sonucu oluşan kimyasal bağ türüdür. Bu bağ oluşurken, metal atomu elektron vererek pozitif yüklü iyon (katyon) haline gelir, ametal atomu ise elektron alarak negatif yüklü iyon (anyon) haline gelir.\n\nÖrneğin, sodyum klorür (NaCl) bileşiğinde, sodyum (Na) metali bir elektron vererek Na+ katyonunu oluştururken, klor (Cl) ametali bir elektron alarak Cl- anyonunu oluşturur. Bu zıt yüklü iyonlar arasındaki elektrostatik çekim kuvveti, iyonik bağı meydana getirir.\n\nİyonik bağlar genellikle güçlüdür ve iyonik bileşikler tipik olarak yüksek erime ve kaynama noktalarına sahiptir. Ayrıca, katı halde elektriği iletmezler, ancak sıvı halde veya sulu çözeltide iyonlarına ayrışarak elektriği iletebilirler.",
      common_misconceptions: [
        "Bazı öğrenciler iyonik bağın iki ametal arasında oluşabileceğini düşünür, ancak iki ametal arasında genellikle kovalent bağ oluşur.",
        "İyonik bağda elektronların paylaşıldığını düşünmek yaygın bir hatadır, oysa elektronlar bir atomdan diğerine tamamen transfer edilir."
      ]
    }
  },
  biology: {
    "biology-1": {
      logical_steps: [
        "Fotosentez, bitkilerin ışık enerjisini kimyasal enerjiye dönüştürdüğü bir süreçtir.",
        "Bu süreçte, bitkiler karbondioksit (CO₂) ve su (H₂O) kullanarak glikoz (C₆H₁₂O₆) üretir.",
        "Fotosentezin yan ürünü olarak oksijen (O₂) açığa çıkar.",
        "Oksijen, atmosfere salınır ve canlıların solunumu için hayati önem taşır."
      ],
      explanation: "Fotosentez, bitkilerin güneş ışığını kullanarak karbondioksit ve sudan besin (glikoz) ürettiği hayati bir süreçtir. Bu süreç, klorofil pigmenti içeren kloroplastlarda gerçekleşir.\n\nFotosentezin kimyasal denklemi şöyledir:\n6CO₂ + 6H₂O + ışık enerjisi → C₆H₁₂O₆ + 6O₂\n\nBu denklem, bitkilerin havadan karbondioksit ve topraktan su alarak, güneş enerjisi yardımıyla glikoz (şeker) ürettiğini ve yan ürün olarak oksijen saldığını gösterir. Üretilen bu oksijen, atmosfere salınır ve solunum yapan canlılar için yaşamsal öneme sahiptir.\n\nFotosentez, dünya üzerindeki yaşamın devamı için kritik öneme sahiptir çünkü hem besin zincirinin temelini oluşturur hem de atmosferdeki oksijen seviyesini dengeler.",
      common_misconceptions: [
        "Bazı öğrenciler fotosentezi solunum ile karıştırır, oysa solunum fotosentezin tersi bir süreçtir.",
        "Bitkilerin sadece güneş ışığına ihtiyaç duyduğunu düşünmek yaygın bir hatadır, oysa karbondioksit ve su da gereklidir."
      ]
    }
  },
  "social-studies": {
    "social-studies-1": {
      logical_steps: [
        "İngiltere'deki Sanayi Devrimi'nin (1760-1840) birçok nedeni vardı.",
        "Bu nedenler arasında teknolojik yenilikler, tarım devrimi, doğal kaynaklar ve sömürge ticareti bulunuyordu.",
        "Özellikle kömür ve demir cevheri gibi doğal kaynakların bolluğu, sanayi büyümesi için gerekli hammaddeleri sağladı.",
        "Bu kaynaklar, buhar makinelerini çalıştırmak ve fabrikaları inşa etmek için gerekliydi.",
        "Diğer faktörler önemli olsa da, doğal kaynakların bolluğu olmadan sanayi devrimi gerçekleşemezdi."
      ],
      explanation: "İngiltere'deki Sanayi Devrimi (1760-1840 civarı), birbiriyle bağlantılı birçok faktörden etkilenmiştir, ancak kömür ve demir cevheri gibi doğal kaynakların bolluğu, gelişiminde temel rol oynamıştır.\n\nİngiltere'de büyük kömür yatakları bulunuyordu ve bu, yeni makineleri çalıştırmak için gereken enerjiyi sağlıyordu. Ayrıca, demir cevheri de bu makinelerin ve demiryolları gibi altyapıların inşası için gerekliydi. Bu kaynaklar genellikle birbirine yakın konumdaydı, bu da nakliye maliyetlerini azaltıyordu.\n\nBuhar makinesi gibi teknolojik yenilikler, tarımsal iyileştirmeler (işgücünü serbest bırakan) ve sömürge ticareti (pazar ve sermaye sağlayan) gibi diğer faktörler de önemliydi, ancak İngiltere'nin doğal kaynaklarının sağladığı hammaddeler olmadan yeterli olmazlardı. Örneğin, buhar makinesinin çalışması için kömür, üretim tesislerinin inşası için de demir gerekliydi.\n\nBu faktörlerin kombinasyonu, doğal kaynaklar temel alınarak, İngiltere'nin dünyanın ilk sanayileşmiş ülkesi olmasını sağladı.",
      common_misconceptions: [
        "Bazı öğrenciler teknolojik yeniliklerin önemini abartabilir, ancak bu yenilikler mevcut kaynaklara bağlıydı.",
        "Diğerleri sömürge zenginliğine çok fazla odaklanabilir, ancak bu zenginliğin doğal kaynaklar aracılığıyla sanayi kapasitesine nasıl dönüştürüldüğünü anlamak önemlidir."
      ]
    }
  },
  english: {
    "english-1": {
      logical_steps: [
        "Öncelikle sorunun ne istediğini anlayalım: Pasajın ana temasını bulmamız gerekiyor.",
        "Pasaj boyunca tekrarlanan fikir veya kavramları aramalıyız.",
        "Yazarın, karakterlerin zorluklara rağmen ilerlemesi üzerine nasıl vurgu yaptığına dikkat edelim.",
        "Sonuç bölümünün, engellerin aşılmasının büyümeye yol açtığı fikrini nasıl pekiştirdiğini düşünelim."
      ],
      explanation: "Bir pasajın ana temasını belirlemek için, yazarın iletmeye çalıştığı tekrarlanan fikirleri, kavramları veya mesajları aramamız gerekir. Bu pasajda, yazar sürekli olarak karakterlerin zorluklarla karşılaştığını ancak zorluklara rağmen ilerlemeye devam ettiğini vurguluyor.\n\nYazar, zorluklar karşısında sebat eden bireylerin çeşitli örneklerini sunuyor ve sonuç özellikle 'gerçek büyümenin engelleri aşarak gerçekleştiği' ifadesini içeriyor. Bu, zorluklara karşı sebat etmenin değerli olduğu ve kişisel gelişime yol açtığı şeklindeki merkezi mesajı pekiştiriyor.\n\nPasajda arkadaşlık ve yaratıcılık gibi kavramlardan da bahsedilse de, bunlar ana temayı destekleyen ikincil unsurlardır.",
      common_misconceptions: [
        "Bazı okuyucular genel mesaj yerine belirli örneklere çok fazla odaklanabilir.",
        "Diğerleri ikincil temaları veya destekleyici detayları ana tema ile karıştırabilir."
      ]
    }
  }
};

// Function to get hints for a specific question
export function getHintsForQuestion(subject: string, questionId: string): HintSet | null {
  // First try to find exact match
  if (hintsDatabase[subject]?.[questionId]) {
    return hintsDatabase[subject][questionId];
  }
  
  // If no exact match, return a generic hint set for the subject
  if (hintsDatabase[subject]) {
    const questionIds = Object.keys(hintsDatabase[subject]);
    if (questionIds.length > 0) {
      return hintsDatabase[subject][questionIds[0]];
    }
  }
  
  // If no subject match, return null
  return null;
}

// Function to get generic hints for a subject
export function getGenericHintsForSubject(subject: string): HintSet {
  // Default generic hints
  const defaultHints: HintSet = {
    logical_steps: [
      "Öncelikle sorunun ne istediğini anlayalım.",
      "Verilen bilgileri dikkatlice analiz edelim.",
      "Problemi çözmek için ilgili kavramları uygulayalım.",
      "Cevabımızın bağlam içinde mantıklı olup olmadığını kontrol edelim."
    ],
    explanation: "Bu genel bir açıklamadır. Soruyu çözmek için önce ne istendiğini anlamalı, sonra ilgili kavramları uygulamalısınız. Adım adım ilerleyerek ve her adımı kontrol ederek doğru cevaba ulaşabilirsiniz.",
    common_misconceptions: [
      "Soruyu tam okumadan cevaplamaya çalışmak yaygın bir hatadır.",
      "Problemin çözümünde acele etmek genellikle hatalara yol açar."
    ]
  };
  
  // Subject-specific generic hints
  const subjectHints: Record<string, HintSet> = {
    math: {
      logical_steps: [
        "Öncelikle matematiksel problemi anlamak için dikkatlice okuyalım.",
        "Verilen değerleri ve istenen sonucu belirleyelim.",
        "Problemi çözmek için uygun matematiksel formül veya yöntemi seçelim.",
        "Adım adım çözümü uygulayalım ve sonucu kontrol edelim."
      ],
      explanation: "Matematik problemlerini çözerken sistematik bir yaklaşım önemlidir. Önce problemi anlamalı, sonra doğru formül veya yöntemi seçmeli ve dikkatli bir şekilde uygulamalısınız. Her adımı kontrol etmek ve sonucun mantıklı olup olmadığını değerlendirmek de önemlidir.",
      common_misconceptions: [
        "Formülleri ezberlemek yerine anlamak daha önemlidir.",
        "İşlem sırası hatalarına dikkat edilmelidir: önce parantez içi, sonra üs, çarpma/bölme ve en son toplama/çıkarma yapılır."
      ]
    },
    physics: {
      logical_steps: [
        "Fizik problemini anlamak için verilen bilgileri dikkatlice okuyalım.",
        "Hangi fizik yasalarının veya formüllerinin uygulanması gerektiğini belirleyelim.",
        "Verilen değerleri doğru birimleriyle not edelim.",
        "Adım adım çözümü uygulayalım ve birimlerin tutarlı olduğundan emin olalım."
      ],
      explanation: "Fizik problemlerini çözerken, doğru fizik yasalarını ve formüllerini uygulamak önemlidir. Birimlerin tutarlı olmasına dikkat etmeli ve her adımda fiziksel anlamı düşünmelisiniz.",
      common_misconceptions: [
        "Birim dönüşümlerini ihmal etmek yaygın bir hatadır.",
        "Vektörel ve skaler büyüklükleri karıştırmamak gerekir."
      ]
    }
  };
  
  return subjectHints[subject] || defaultHints;
}

// Function to translate follow-up responses to Turkish
export function translateFollowUpResponse(question: string): string {
  // Simple keyword-based responses in Turkish
  if (question.toLowerCase().includes("neden") || question.toLowerCase().includes("niçin")) {
    return "Bu harika bir 'neden' sorusu! Bunun nedeni, konunun temel ilkelerini takip etmemiz gerektiğidir. Bu özel durumda, altta yatan kavram her eylemin mantıksal bir sonucu olduğudur ve bu ilişkiyi anlamak, gelecekte benzer problemleri çözmemize yardımcı olur.\n\nBu açıklama yardımcı oldu mu?";
  }
  
  if (question.toLowerCase().includes("nasıl")) {
    return "Bunun 'nasıl' çalıştığını soruyorsunuz, bu mükemmel bir soru. Süreç, her adımın bir öncekinin üzerine inşa edildiği adım adım bir yaklaşımı içerir. Anahtar, karmaşık problemleri daha küçük, yönetilebilir parçalara ayırmaktır.\n\nSürecin hala net olmayan belirli bir kısmı var mı?";
  }
  
  if (question.toLowerCase().includes("örnek")) {
    return "Başka bir örnek istiyorsunuz - bu anlayışı pekiştirmenin harika bir yolu! İşte biraz farklı bir yaklaşımla benzer bir problem:\n\n[Detaylı çözümlü örnek problem]\n\nAynı prensipleri orijinal sorunuza uygulamayı deneyin ve bu, noktaları birleştirmenize yardımcı olur mu görün.";
  }
  
  // Default response
  return "Takip sorunuz için teşekkür ederim. Açıklığa kavuşturmak gerekirse, buradaki temel kavram, problemdeki farklı unsurlar arasındaki ilişkiyi anlamaktır. Çözüm, her adımın doğru sonuca ulaşmak için gerekli olduğu mantıksal bir sırayı takip eder.\n\nHatırlanması gereken önemli şey, bu ilkelerin gelecekte karşılaşabileceğiniz benzer problemlere uygulanabileceğidir. Farklı varyasyonlarla pratik yapmak, anlayışınızı sağlamlaştırmaya yardımcı olacaktır.";
} 