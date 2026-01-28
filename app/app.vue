<script setup lang="ts">
import { useCompoundCalculator } from "~/composables/useCompoundCalculator";
import type { CalculationRequest } from "~/types/calculator";

const { calculate, loading, result, defaultTiers } = useCompoundCalculator();
const colorMode = useColorMode();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: () =>
    (colorMode.preference = colorMode.value === "dark" ? "light" : "dark"),
});

// SEO & Meta Tags
useHead({
  htmlAttrs: {
    lang: "tr",
  },
  title: "Bileşik Faiz Hesaplama - Günlük Mevduat Getirisi Simülatörü",
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});

useSeoMeta({
  title: "Bileşik Faiz Hesaplama - Günlük Mevduat Getirisi Simülatörü",
  ogTitle: "Bileşik Faiz Hesaplama - Günlük Mevduat Getirisi Simülatörü",
  description:
    "Türkiye bankacılık sistemine uygun, dinamik muafiyet dilimli ve günlük bileşik faiz hesaplama aracı. Mevduat getirinizi kuruşu kuruşuna simüle edin.",
  ogDescription:
    "Türkiye bankacılık sistemine uygun, dinamik muafiyet dilimli ve günlük bileşik faiz hesaplama aracı. Mevduat getirinizi kuruşu kuruşuna simüle edin.",
  twitterCard: "summary_large_image",
  twitterTitle: "Bileşik Faiz Hesaplama - Günlük Mevduat Getirisi Simülatörü",
  twitterDescription:
    "Türkiye bankacılık sistemine uygun günlük bileşik faiz ve mevduat getirisi simülatörü.",
  keywords:
    "bileşik faiz hesaplama, günlük faiz, mevduat getirisi, banka faiz hesaplama, stopaj hesaplama, faiz muafiyeti, finansal simülatör",
});

const form = reactive<CalculationRequest>({
  principal: 100000,
  days: 30,
  withholdingTax: 0.175,
  usdStartRate: 43.2,
  usdEndRate: 43.8,
  tiers: [...JSON.parse(JSON.stringify(defaultTiers))],
});

const addTier = () => {
  form.tiers.push({ min: 0, max: null, exempt: 20000, rate: 0.44 });
};

const removeTier = (index: number) => {
  form.tiers.splice(index, 1);
};

const clearTiers = () => {
  form.tiers = [];
};

const toast = useToast();
const resultsRef = ref<HTMLElement | null>(null);

const performCalculation = async () => {
  // Validate required fields
  if (!form.principal || !form.days || !form.usdStartRate || !form.usdEndRate) {
    return;
  }

  try {
    await calculate(form);
    toast.add({
      title: "Hesaplama Başarılı",
      description: "Sonuçlar güncel verilerle yenilendi.",
      color: "success",
    });

    // Auto-scroll on mobile
    if (window.innerWidth < 1024 && resultsRef.value) {
      nextTick(() => {
        resultsRef.value?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  } catch (error: any) {
    const statusMessage = error.data?.statusMessage || "Hesaplama yapılamadı";
    const details = error.data?.data;

    let description = "Lütfen girdiğiniz verileri kontrol edin.";

    if (details && typeof details === "object") {
      description = "Eksik veya hatalı parametre girişi yapıldı.";
    }

    toast.add({
      title: statusMessage,
      description: description,
      color: "error",
    });
  }
};

const handleCalculate = useDebounceFn(performCalculation, 500);

const avgDailyChange = ref(0);

const fetchRates = async () => {
  try {
    const data = await $fetch<{
      currentPrice: number;
      avgDailyChange: number;
      suggestedTargetPrice: number;
    }>("/api/usd-rates");

    if (data) {
      form.usdStartRate = data.currentPrice;
      form.usdEndRate = data.suggestedTargetPrice;
      avgDailyChange.value = data.avgDailyChange;
      // Initial projection for the default days
      recalculateProjectedUsd();
    }
  } catch (error) {
    console.error("Rates fetch failed:", error);
  }
};

const recalculateProjectedUsd = () => {
  const startRate = form.usdStartRate || 0;
  const days = form.days || 0;
  form.usdEndRate = Number(
    (startRate + avgDailyChange.value * days).toFixed(4),
  );
};

const pageLoading = ref(true);

onMounted(async () => {
  try {
    await fetchRates();
    await performCalculation();
  } finally {
    pageLoading.value = false;
  }
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(val);
};

const formatUSD = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
};

const isPerformanceModalOpen = ref(false);
</script>

<template>
  <UApp>
    <div
      class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32 font-sans"
    >
      <UContainer>
        <div v-if="pageLoading" class="space-y-8">
          <header class="mb-8 relative flex flex-col items-center">
            <USkeleton class="h-10 w-64 mb-4" />
            <USkeleton class="h-6 w-full max-w-2xl" />
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4 space-y-6">
              <USkeleton class="h-64 rounded-2xl w-full" />
              <USkeleton class="h-96 rounded-2xl w-full" />
            </div>
            <div class="lg:col-span-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <USkeleton
                  class="h-28 rounded-2xl w-full"
                  v-for="i in 3"
                  :key="i"
                />
              </div>
              <USkeleton class="h-96 rounded-2xl w-full" />
              <USkeleton class="h-32 rounded-2xl w-full" />
            </div>
          </div>
        </div>

        <template v-else>
          <header class="mb-8 relative">
            <div
              class="absolute right-0 top-0 pt-2 pr-2 md:pr-0 flex items-center gap-1"
            >
              <UButton
                icon="i-simple-icons-github"
                color="neutral"
                variant="ghost"
                to="https://github.com/velidonmez/gunluk-faiz-hesaplayici"
                target="_blank"
              />
              <ClientOnly>
                <UButton
                  :icon="
                    isDark
                      ? 'i-heroicons-moon-20-solid'
                      : 'i-heroicons-sun-20-solid'
                  "
                  color="neutral"
                  variant="ghost"
                  @click="isDark = !isDark"
                />
              </ClientOnly>
            </div>
            <div class="text-center">
              <h1
                class="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2"
              >
                Günlük Bileşik Faiz Simülatörü
              </h1>
            </div>
            <p
              class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-center"
            >
              Türkiye bankacılık sistemine uygun günlük faiz işletimi, dinamik
              muafiyet dilimleri ve döviz karşılaştırmalı gelişmiş hesaplama
              motoru.
            </p>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- LEFT PANEL: SETTINGS -->
            <div class="lg:col-span-4 space-y-6">
              <UCard
                :ui="{ body: 'sm:px-2 sm:pt-2' }"
                class="shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
              >
                <template #header>
                  <div class="flex items-center gap-2">
                    <div class="flex p-2 bg-primary/10 rounded-lg">
                      <UIcon
                        name="i-heroicons-banknotes"
                        class="w-5 h-5 text-primary"
                      />
                    </div>
                    <h2 class="font-bold text-lg">Temel Parametreler</h2>
                  </div>
                </template>

                <div class="space-y-5">
                  <UFormField
                    label="Ana Para (TL)"
                    help="Hesaplanacak başlangıç tutarı"
                  >
                    <UInputNumber
                      v-model="form.principal"
                      size="lg"
                      :step="10"
                      class="w-full"
                      :format-options="{ style: 'currency', currency: 'TRY' }"
                    />
                  </UFormField>
                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Vade (Gün)">
                      <UInputNumber v-model="form.days" :min="1" />
                    </UFormField>

                    <UFormField
                      label="Stopaj Oranı (%)"
                      help="Genellikle %17.5 veya %20"
                    >
                      <UInputNumber
                        v-model="form.withholdingTax"
                        :step="0.005"
                        :format-options="{
                          style: 'percent',
                          minimumFractionDigits: 1,
                        }"
                      />
                    </UFormField>
                  </div>

                  <div
                    class="pt-4 border-t border-slate-100 dark:border-slate-800"
                  >
                    <div class="flex items-center justify-between mb-3 px-1">
                      <h3
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                      >
                        Dolar Kuru Karşılaştırması
                      </h3>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <UFormField label="Bugünkü Kur">
                        <UInputNumber
                          v-model="form.usdStartRate"
                          :step="0.01"
                          color="neutral"
                          :format-options="{
                            style: 'currency',
                            currency: 'USD',
                          }"
                        />
                      </UFormField>
                      <UFormField
                        :label="`Hedef Kur (${form.days} Gün)`"
                        class="relative"
                      >
                        <UInputNumber
                          v-model="form.usdEndRate"
                          :step="0.01"
                          color="neutral"
                          :format-options="{
                            style: 'currency',
                            currency: 'USD',
                          }"
                        />
                        <template #help>
                          <div class="flex items-center justify-between mt-1">
                            <span class="text-[10px] text-slate-500 font-medium"
                              >{{ form.days }} gün için tahmini kur</span
                            >
                            <UButton
                              icon="i-heroicons-arrow-path"
                              variant="ghost"
                              color="neutral"
                              size="xs"
                              @click="recalculateProjectedUsd"
                              class="hover:text-primary transition-colors"
                            />
                          </div>
                        </template>
                      </UFormField>
                    </div>
                  </div>
                </div>
              </UCard>

              <UCard
                :ui="{ body: 'sm:px-2 sm:pt-2' }"
                class="shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
              >
                <template #header>
                  <div class="flex items-start justify-between">
                    <div class="flex items-start gap-2">
                      <div class="flex p-2 bg-primary/10 rounded-lg mt-1">
                        <UIcon
                          name="i-heroicons-adjustments-vertical"
                          class="w-5 h-5 text-primary"
                        />
                      </div>
                      <div>
                        <h2 class="font-bold">Faiz İşletilmeyecek Tutar</h2>
                        <p
                          class="text-[10px] text-slate-500 font-medium leading-tight mt-1"
                        >
                          Toplam bakiyenizden bu tutarlar düşüldükten sonra
                          kalan miktar üzerinden günlük faiz hesaplanır.
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <UTooltip>
                        <UButton
                          color="error"
                          variant="subtle"
                          icon="i-heroicons-trash"
                          size="xs"
                          @click="clearTiers"
                        />
                        <template #content>
                          <p>Temizle</p>
                        </template>
                      </UTooltip>
                      <UTooltip>
                        <UButton
                          color="primary"
                          variant="subtle"
                          icon="i-heroicons-plus"
                          size="xs"
                          @click="addTier"
                        />
                        <template #content>
                          <p>Ekle</p>
                        </template>
                      </UTooltip>
                    </div>
                  </div>
                </template>

                <div class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  <div
                    v-for="(tier, index) in form.tiers"
                    :key="index"
                    class="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl relative group ring-1 ring-inset ring-slate-200 dark:ring-slate-800"
                  >
                    <div class="space-y-3">
                      <!-- Range Row -->
                      <div class="grid grid-cols-2 gap-2">
                        <div class="space-y-1">
                          <label
                            class="text-[10px] text-slate-400 font-bold px-1"
                            >Alt Limit (Min)</label
                          >
                          <UInputNumber
                            v-model="tier.min"
                            variant="none"
                            class="bg-slate-100 dark:bg-slate-800 rounded-lg font-medium"
                            :format-options="{
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            }"
                          />
                        </div>
                        <div class="space-y-1">
                          <label
                            class="text-[10px] text-slate-400 font-bold px-1"
                            >Üst Limit (Max)</label
                          >
                          <UInputNumber
                            v-model="tier.max"
                            variant="none"
                            class="bg-slate-100 dark:bg-slate-800 rounded-lg font-medium"
                            placeholder="∞"
                            :format-options="{
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            }"
                          />
                        </div>
                      </div>

                      <!-- Values Row -->
                      <div class="grid grid-cols-2 gap-2">
                        <div class="space-y-1">
                          <label class="text-[10px] text-primary font-bold px-1"
                            >Faiz Oranı (%)</label
                          >
                          <UInputNumber
                            v-model="tier.rate"
                            variant="none"
                            class="bg-primary/5 border border-primary/20 rounded-lg font-bold text-primary"
                            :step="0.01"
                            :format-options="{
                              style: 'percent',
                              minimumFractionDigits: 1,
                            }"
                          />
                        </div>
                        <div class="space-y-1">
                          <label
                            class="text-[10px] text-emerald-500 font-bold px-1"
                            >Faiz İşletilmeyecek Tutar</label
                          >
                          <UInputNumber
                            v-model="tier.exempt"
                            variant="none"
                            class="bg-emerald-500/5 border border-emerald-500/20 rounded-lg font-bold text-emerald-600 dark:text-emerald-400"
                            :format-options="{
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            }"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      class="flex justify-center items-center absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                      @click="removeTier(index)"
                    >
                      <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- RIGHT PANEL: RESULTS -->
            <div ref="resultsRef" class="lg:col-span-8 space-y-6">
              <div v-if="result" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UCard
                  class="overflow-hidden border-none bg-slate-900 dark:bg-white text-white dark:text-slate-950 relative"
                >
                  <div
                    class="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"
                  ></div>
                  <div class="relative z-10">
                    <div
                      class="text-xs font-black tracking-widest opacity-60 mb-1"
                    >
                      Dönem Sonu Bakiye
                    </div>
                    <div class="text-3xl font-black truncate">
                      {{ formatCurrency(result.totalBalance) }}
                    </div>
                  </div>
                </UCard>

                <UCard
                  class="overflow-hidden border-none bg-emerald-600 dark:bg-emerald-500 text-white relative"
                >
                  <div
                    class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"
                  ></div>
                  <div class="relative z-10">
                    <div
                      class="text-xs font-black tracking-widest opacity-60 mb-1"
                    >
                      Toplam Net Kar
                    </div>
                    <div class="text-3xl font-black truncate">
                      {{ formatCurrency(result.totalNetProfit) }}
                    </div>
                  </div>
                </UCard>

                <UCard
                  class="overflow-hidden border-none relative text-white"
                  :class="
                    result.usdProfitLoss >= 0 ? 'bg-blue-600' : 'bg-red-600'
                  "
                >
                  <div
                    class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"
                  ></div>
                  <div class="relative z-10">
                    <div
                      class="text-xs font-black tracking-widest opacity-60 mb-1"
                    >
                      Dolar Bazlı Sonuç
                    </div>
                    <div class="text-3xl font-black truncate">
                      {{ formatUSD(result.usdProfitLoss) }}
                    </div>
                    <div class="text-[10px] font-bold mt-1 text-white/80">
                      {{
                        result.usdProfitLoss >= 0
                          ? "Dövizi Mağlup Ettiniz"
                          : "Döviz Karşısında Kayıp"
                      }}
                    </div>
                  </div>
                </UCard>
              </div>

              <div
                v-else-if="loading"
                class="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <USkeleton
                  class="h-28 rounded-2xl w-full"
                  v-for="i in 3"
                  :key="i"
                />
              </div>

              <!-- TIER BASED PERFORMANCE -->
              <UCard
                v-if="result"
                class="shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden"
              >
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="flex p-2 bg-primary/10 rounded-lg">
                        <UIcon
                          name="i-heroicons-chart-pie"
                          class="w-5 h-5 text-primary"
                        />
                      </div>
                      <h2 class="font-bold text-lg">
                        Dilim Bazlı Kazanç Detayı
                      </h2>
                    </div>
                    <UModal
                      title="Performans Detayları ve Analiz"
                      :description="`${form.days} Günlük Simülasyon Verileri`"
                      :ui="{ content: 'sm:max-w-2xl' }"
                    >
                      <UButton
                        label="Detayları Gör"
                        color="neutral"
                        variant="subtle"
                        icon="i-heroicons-magnifying-glass-circle"
                        size="sm"
                        class="rounded-full font-bold"
                      />

                      <template #body>
                        <div class="space-y-6">
                          <!-- USD Comparison Section -->
                          <div
                            class="grid grid-cols-1 md:grid-cols-2 gap-4"
                            v-if="result"
                          >
                            <div
                              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                            >
                              <div
                                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                              >
                                Başlangıç Senaryosu
                              </div>
                              <div
                                class="text-sm font-medium text-slate-500 mb-2"
                              >
                                İlk gün ana parayla USD alıp bekleseydiniz:
                              </div>
                              <div
                                class="text-2xl font-black text-slate-900 dark:text-white"
                              >
                                {{ formatUSD(result.usdInitial) }}
                              </div>
                              <div
                                class="text-[10px] text-slate-400 mt-1 italic"
                              >
                                (Kur: {{ formatCurrency(form.usdStartRate) }})
                              </div>
                            </div>

                            <div
                              class="p-4 rounded-2xl border transition-all"
                              :class="
                                result.usdProfitLoss >= 0
                                  ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20'
                                  : 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20'
                              "
                            >
                              <div
                                class="text-[10px] font-black uppercase tracking-widest mb-1"
                                :class="
                                  result.usdProfitLoss >= 0
                                    ? 'text-emerald-500'
                                    : 'text-red-500'
                                "
                              >
                                Mevduat Sonucu
                              </div>
                              <div
                                class="text-sm font-medium text-slate-500 mb-2"
                              >
                                Bileşik faiz sonrası bakiye dolar karşılığı:
                              </div>
                              <div
                                class="text-2xl font-black"
                                :class="
                                  result.usdProfitLoss >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                "
                              >
                                {{ formatUSD(result.usdFinalValue) }}
                              </div>
                              <div
                                class="text-[10px] mt-1 italic"
                                :class="
                                  result.usdProfitLoss >= 0
                                    ? 'text-emerald-500/70'
                                    : 'text-red-500/70'
                                "
                              >
                                (Hedef Kur:
                                {{ formatCurrency(form.usdEndRate) }})
                              </div>
                            </div>
                          </div>

                          <!-- Summary Message -->
                          <div
                            v-if="result"
                            class="p-4 rounded-xl text-sm font-medium leading-relaxed"
                            :class="
                              result.usdProfitLoss >= 0
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-500/10 text-red-700 dark:text-red-300'
                            "
                          >
                            <div class="flex items-center gap-2 mb-1">
                              <UIcon
                                :name="
                                  result.usdProfitLoss >= 0
                                    ? 'i-heroicons-sparkles'
                                    : 'i-heroicons-exclamation-triangle'
                                "
                                class="w-5 h-5"
                              />
                              <span class="font-bold">Analiz Özeti:</span>
                            </div>
                            {{
                              result.usdProfitLoss >= 0
                                ? `Mevduat yatırımınız, dolar yatırımına kıyasla ${formatUSD(result.usdProfitLoss)} daha fazla getiri sağladı. Faiz oranları kur artışını kompanse etti.`
                                : `Dolar yatırımı yapsaydınız ${formatUSD(Math.abs(result.usdProfitLoss))} daha kârda olacaktınız. Kur artışı faiz getirisinden yüksek kaldı.`
                            }}
                          </div>

                          <!-- Tier Detail Table (Simplified for Modal) -->
                          <div
                            class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
                          >
                            <div
                              class="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800"
                            >
                              <h4
                                class="text-xs font-black uppercase tracking-widest text-slate-500"
                              >
                                Dilim Bazlı Kırılım
                              </h4>
                            </div>
                            <div class="overflow-x-auto">
                              <table class="w-full text-left text-xs">
                                <thead
                                  class="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800"
                                >
                                  <tr>
                                    <th
                                      class="px-4 py-3 font-black text-slate-400"
                                    >
                                      Dilim
                                    </th>
                                    <th
                                      class="px-4 py-3 font-black text-slate-400 text-center"
                                    >
                                      Gün
                                    </th>
                                    <th
                                      class="px-4 py-3 font-black text-slate-400 text-right"
                                    >
                                      Net Faiz
                                    </th>
                                  </tr>
                                </thead>
                                <tbody
                                  class="divide-y divide-slate-100 dark:divide-slate-800"
                                >
                                  <tr
                                    v-for="(row, idx) in result.tierSummary"
                                    :key="idx"
                                  >
                                    <td
                                      class="px-4 py-3 font-bold text-slate-700 dark:text-slate-300"
                                    >
                                      %{{ row.rate * 100 }}
                                    </td>
                                    <td
                                      class="px-4 py-3 text-center text-slate-600 dark:text-slate-400"
                                    >
                                      {{ row.daysPassed }}
                                    </td>
                                    <td
                                      class="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400"
                                    >
                                      +{{ formatCurrency(row.interestEarned) }}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </template>
                    </UModal>
                  </div>
                </template>

                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead
                      class="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
                    >
                      <tr>
                        <th
                          class="px-6 py-4 text-xs font-black tracking-widest text-slate-400"
                        >
                          Faiz Dilimi
                        </th>
                        <th
                          class="px-6 py-4 text-xs font-black tracking-widest text-slate-400 text-center"
                        >
                          Gün
                        </th>
                        <th
                          class="px-6 py-4 text-xs font-black tracking-widest text-slate-400 text-right"
                        >
                          Net Faiz Getirisi
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      class="divide-y divide-slate-100 dark:divide-slate-800"
                    >
                      <tr
                        v-for="(row, idx) in result.tierSummary"
                        :key="idx"
                        class="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-all"
                      >
                        <td class="px-6 py-4">
                          <div class="flex flex-col">
                            <span
                              class="font-bold text-slate-700 dark:text-slate-300"
                              >%{{ row.rate * 100 }} Faiz</span
                            >
                            <span
                              class="text-[10px] text-slate-500 font-medium"
                            >
                              {{ row.min.toLocaleString("tr-TR") }} -
                              {{
                                row.max ? row.max.toLocaleString("tr-TR") : "∞"
                              }}
                              TL Aralığı
                            </span>
                          </div>
                        </td>
                        <td
                          class="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400"
                        >
                          {{ row.daysPassed }} Gün
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span
                            class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-mono"
                          >
                            +{{ formatCurrency(row.interestEarned) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </UCard>

              <!-- INFO CARD -->
              <UCard
                class="bg-linear-to-r from-slate-900 to-slate-800 text-white border-none shadow-xl"
              >
                <div class="flex gap-6 items-start">
                  <div class="p-3 bg-white/10 rounded-2xl hidden md:flex">
                    <UIcon
                      name="i-heroicons-shield-check"
                      class="w-8 h-8 text-primary"
                    />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold mb-2">Algoritma Hakkında</h3>
                    <p class="text-slate-300 leading-relaxed text-sm">
                      Bu araç, basit faiz yerine "Gerçek Mevduat Getirisi"
                      simülasyonu yapar. Her günün sonunda net faiz ana paraya
                      eklenir ve bir sonraki günün faiz matrahı bu yeni bakiye
                      üzerinden, seçtiğiniz muafiyet dilimi çıkarılarak
                      hesaplanır. Bu sayede bankanızın vadeli hesapta sunduğu
                      gerçek büyümeyi kuruşu kuruşuna görebilirsiniz.
                    </p>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </template>
      </UContainer>

      <!-- Legal Disclaimer Footer -->
      <footer
        class="mt-16 md:mb-32 pt-8 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto text-center px-4"
      >
        <div class="flex items-center justify-center gap-4 mb-6">
          <UButton
            icon="i-simple-icons-github"
            label="GitHub'da İncele"
            color="neutral"
            variant="subtle"
            size="sm"
            to="https://github.com/velidonmez/gunluk-faiz-hesaplayici"
            target="_blank"
            class="rounded-full"
          />
        </div>
        <p
          class="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-medium italic"
        >
          <strong>Yasal Uyarı:</strong> Bu uygulama ve içerdiği hesaplama
          araçları, yalnızca kullanıcıya genel bir fikir vermek amacıyla
          hazırlanmıştır. Hiçbir resmi banka, kurum veya kuruluş ile doğrudan
          veya dolaylı bir bağı bulunmamaktadır. Hesaplamalar yaklaşık sonuçlar
          içerir ve faiz oranları, vergi dilimleri ya da banka politikalarındaki
          anlık değişimler nedeniyle gerçek banka verileriyle farklılık
          gösterebilir. Sunulan veriler yatırım tavsiyesi niteliği taşımaz.
          Kesin sonuçlar için lütfen ilgili bankanın resmi kanallarını
          kullanınız.
        </p>
      </footer>
    </div>

    <!-- Floating Calculate Button -->
    <div
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[280px] md:max-w-sm px-4"
    >
      <UButton
        block
        color="primary"
        size="xl"
        :loading="loading"
        class="rounded-full font-black py-5 shadow-2xl shadow-primary/50 ring-4 ring-white dark:ring-slate-900 transition-all hover:scale-105 active:scale-95 text-lg tracking-wider"
        icon="i-heroicons-sparkles"
        @click="handleCalculate"
      >
        ŞİMDİ HESAPLA
      </UButton>
    </div>
  </UApp>
</template>

<style scoped>
/* Scoped styles if needed, but primary styles are global */
</style>
