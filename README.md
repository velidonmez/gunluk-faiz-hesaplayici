# 🏦 Günlük Bileşik Faiz Simülatörü

Türkiye bankacılık sistemine uygun, dinamik muafiyet dilimleri ve döviz karşılaştırmalı gelişmiş bir günlük mevduat getirisi simülatörüdür. Paranızın gerçek büyüme potansiyelini kuruşu kuruşuna, bileşik faiz etkisiyle simüle etmenize olanak tanır.

> **🤖 AI Crafted:** Bu projenin tamamı (kod mimarisi, UI tasarımı ve backend motoru) bir AI asistanı tarafından, kullanıcı yönlendirmeleriyle sıfırdan oluşturulmuştur. Modern yazılım geliştirme süreçlerinde AI'ın potansiyelini göstermek amacıyla açık kaynak olarak paylaşılmıştır.

## ✨ Özellikler

- **Günlük Bileşik Faiz:** Faiz, her günün sonunda ana paraya eklenir ve ertesi günün faizi bu yeni bakiye üzerinden hesaplanır.
- **Canlı Döviz Entegrasyonu:** TwelveData API üzerinden çekilen gerçek zamanlı USD/TRY kurları ile anlık karşılaştırma.
- **Akıllı Tahmin Motoru:** Son 90 günlük historical veriyi analiz ederek vade sonu için dinamik dolar kuru projeksiyonu.
- **Detaylı Performans Analizi:** Faiz getirisini dolar yatırımıyla kıyaslayan, kâr/zarar durumunu görselleştiren gelişmiş modal ekranı.
- **Dinamik Muafiyet Dilimleri:** Bakiyeniz değiştikçe otomatik olarak güncellenen faiz oranları ve vergisiz (muafiyetli) tutar desteği.
- **Premium UI/UX:** Nuxt UI v4 ve Tailwind CSS 4 ile güçlendirilmiş, skeleton loading destekli, modern ve hızlı arayüz.
- **Otomatik Hesaplama (Debounce):** Verileri girdikçe anlık güncellenen sonuçlar.
- **Koyu Tema Desteği:** Gece ve gündüz kullanımı için optimize edilmiş modern tasarım.

## 🚀 Teknolojiler

- **Framework:** [Nuxt 4](https://nuxt.com/) (Modern Dosya Yapılı Mimari)
- **UI Library:** [@nuxt/ui v4](https://ui.nuxt.com/v4) (Tailwind tabanlı bileşenler)
- **Data Source:** [TwelveData API](https://twelvedata.com/) (Döviz kurları için)
- **Utility:** [VueUse](https://vueuse.org/) (Debounce, ColorMode, Watchers)
- **Validation:** [Zod](https://zod.dev/) (Sıkı API veri doğrulaması)
- **API Engine:** Nitro (Sunucu tarafı önbellekleme ve proxy)

## 📦 Kurulum ve Çalıştırma

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**

    ```bash
    git clone https://github.com/velidonmez/gunluk-faiz-hesaplayici.git
    cd gunluk-faiz-hesaplayici
    ```

2.  **Çevresel Değişkenleri Ayarlayın:**
    `.env.example` dosyasını `.env` olarak kopyalayın ve TwelveData API anahtarınızı ekleyin:

    ```bash
    cp .env.example .env
    # TWELVE_DATA_API_KEY=your_api_key_here
    ```

3.  **Bağımlılıkları Yükleyin:**

    ```bash
    pnpm install
    ```

4.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

## 🧠 Hesaplama Algoritması Hakkında

Uygulama, standart basit faiz formülü yerine gerçek mevduat getirisini simüle eder:

```text
Günlük Brüt Faiz = (Matrah * Günlük Faiz Oranı) / 366 (veya 365)
Matrah = Toplam Bakiye - Dilim Bazlı Muafiyet Tutarı
Net Getiri = Brüt Faiz * (1 - Stopaj Oranı)
```

Sistem, her günün sonunda net getiriyi ana paraya ekleyerek ertesi günün simülasyonunu başlatır. Ayrıca elde edilen nihai TL bakiyesini, hedef USD kuru üzerinden "Döviz Olsaydı Ne Olurdu?" sorusuyla analiz eder.

## ⚖️ Yasal Uyarı

Bu uygulama yalnızca bilgilendirme amaçlıdır. Hiçbir resmi banka veya finans kuruluşu ile bağı yoktur. Kesin sonuçlar için lütfen bankanızın resmi kanallarını kullanınız.

## 📝 Lisans

Bu proje **MIT** lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına göz atabilirsiniz.
