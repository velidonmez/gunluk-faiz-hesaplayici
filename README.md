# 🏦 Günlük Bileşik Faiz Simülatörü

Türkiye bankacılık sistemine uygun, dinamik muafiyet dilimleri ve döviz karşılaştırmalı gelişmiş bir günlük mevduat getirisi simülatörüdür. Paranızın gerçek büyüme potansiyelini kuruşu kuruşuna, bileşik faiz etkisiyle simüle etmenize olanak tanır.

> **🤖 AI Crafted:** Bu projenin tamamı (kod mimarisi, UI tasarımı ve backend motoru) bir AI asistanı tarafından, kullanıcı yönlendirmeleriyle sıfırdan oluşturulmuştur. Modern yazılım geliştirme süreçlerinde AI'ın potansiyelini göstermek amacıyla açık kaynak olarak paylaşılmıştır.

## ✨ Özellikler

- **Günlük Bileşik Faiz:** Faiz, her günün sonunda ana paraya eklenir ve ertesi günün faizi bu yeni bakiye üzerinden hesaplanır.
- **Dinamik Muafiyet Dilimleri:** Bakiyeniz değiştikçe otomatik olarak güncellenen faiz oranları ve vergisiz (muafiyetli) tutar desteği.
- **Banka Veri Uyumluluğu:** Türkiye'deki popüler bankaların "Tanışma Faizi" ve "Bakiyeye Göre Değişen Faiz" yapılarına uygun algoritma.
- **Döviz Karşılaştırması:** Belirlediğiniz baz ve hedef kurlar üzerinden, faiz getirisinin dolar karşısındaki performans analizi.
- **Otomatik Hesaplama (Debounce):** Verileri girdikçe anlık güncellenen sonuçlar.
- **Koyu Tema Desteği:** Gece ve gündüz kullanımı için optimize edilmiş modern arayüz.
- **SEO Optimizasyonu:** Arama motorları ve sosyal paylaşım için tam uyumlu meta etiketler.

## 🚀 Teknolojiler

- **Framework:** [Nuxt 4](https://nuxt.com/) (Future-ready architecture)
- **UI Library:** [@nuxt/ui v4](https://ui.nuxt.com/v4) (Tailwind based components)
- **Utility:** [VueUse](https://vueuse.org/) (Debounce, ColorMode, Watchers)
- **Validation:** [Zod](https://zod.dev/) (Strict API data validation)
- **Styling:** Tailwind CSS 4

## 📦 Kurulum ve Çalıştırma

Bu projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**

    ```bash
    git clone https://github.com/kullanici/interest-calculator.git
    cd interest-calculator
    ```

2.  **Bağımlılıkları Yükleyin:**

    ```bash
    pnpm install
    # veya
    npm install
    ```

3.  **Geliştirme Sunucusunu Başlatın:**

    ```bash
    npm run dev
    ```

4.  **Üretim İçin Derleyin:**
    ```bash
    npm run build
    npm run preview
    ```

## 🧠 Hesaplama Algoritması Hakkında

Uygulama, standart basit faiz formülü yerine gerçek mevduat getirisini simüle eder:

```text
Günlük Brüt Faiz = (Matrah * Günlük Faiz Oranı) / 365
Matrah = Toplam Bakiye - Dilim Bazlı Muafiyet Tutarı
Net Getiri = Brüt Faiz * (1 - Stopaj Oranı)
```

Sistem, her günün sonunda net getiriyi ana paraya ekleyerek ertesi günün simülasyonunu başlatır.

## ⚖️ Yasal Uyarı

Bu uygulama yalnızca bilgilendirme amaçlıdır. Hiçbir resmi banka veya finans kuruluşu ile bağı yoktur. Kesin sonuçlar için lütfen bankanızın resmi kanallarını kullanınız.

## 📝 Lisans

Bu proje **MIT** lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına göz atabilirsiniz.
