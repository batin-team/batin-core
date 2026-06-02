import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brandName: 'Hatikehati',
    brandTagline: 'Professional Mental Health Support, Accessible Anywhere',

    // Navbar
    findProvider: 'Find a Provider',
    adminPanel: 'Admin Panel',
    psychologistPanel: 'Psychologist Panel',
    corporatePortal: 'Corporate Portal',
    joinProvider: 'Join as Provider',
    login: 'Login',
    logout: 'Logout',
    greetUser: 'Hello, ',
    navLayanan: 'Services',
    navPsikolog: 'Psychologists',
    navArtikel: 'Articles',
    navTentangKami: 'About Us',
    navMulaiKonseling: 'Start Counseling',

    // Hero Section
    heroTitlePart1: 'The Right Psychological Support, ',
    heroTitleHighlight: 'Without the Hassle',
    heroSubtitle: 'Get emotional support from licensed professionals tailored to your needs. We are here to listen, without judgment, in a safe space.',
    heroBtnPrimary: 'Start Counseling',
    heroBtnSecondary: 'Learn More',
    findProviderCTA: 'Find a Provider',
    joinProviderCTA: 'Join as Provider',
    verifiedProfessionals: 'Verified Professionals',
    easyBooking: 'Easy Booking',

    // How It Works
    stepsSectionTitle: 'Simple Steps to Peace of Mind',
    stepsSectionSubtitle: 'A process designed to ease your mind and connect you with the right help as quickly as possible.',
    step1Title: '1. Assessment',
    step1Desc: 'Fill out a short questionnaire to help us understand the challenges you are currently facing.',
    step2Title: '2. Auto-Match',
    step2Desc: 'Our smart system recommends psychologists whose specialties best fit your needs.',
    step3Title: '3. Booking',
    step3Desc: 'Choose the most convenient schedule for you directly from the psychologist\'s availability calendar.',
    step4Title: '4. Session',
    step4Desc: 'Begin a safe and confidential counseling session through our video or encrypted chat platform.',
    howItWorksTitle: 'How It Works',

    // Trust & Stats Section
    verifiedProvidersCount: '80+ Verified Providers',
    sessionsCompletedCount: '5,000+ Sessions Completed',
    membersCount: '10,000+ Enrolled Members',
    satisfactionCount: '4.9/5 Satisfaction Score',

    // Specialized Services
    servicesSectionTitle: 'Specialized Services',
    servicesSectionSubtitle: 'We provide a safe space for various mental challenges. Each area is handled by verified professionals with a proven track record.',
    servicesLink: 'See All Services',
    serviceStressTitle: 'Stress & Burnout',
    serviceStressDesc: 'Manage mental fatigue, work stress, and restore life balance.',
    serviceAnxietyTitle: 'Anxiety',
    serviceAnxietyDesc: 'Strategies to handle panic attacks, overthinking, and generalized anxiety (GAD).',
    serviceRelationshipTitle: 'Relationships',
    serviceRelationshipDesc: 'Couples counseling, family conflict resolution, and setting healthy boundaries.',

    // Categories
    anxietySupport: 'Anxiety Support',
    depressionSupport: 'Depression Support',
    relationshipCounseling: 'Relationship Counseling',
    familyCounseling: 'Family Counseling',
    careerCounseling: 'Career Counseling',
    parentingSupport: 'Parenting Support',
    traumaRecovery: 'Trauma Recovery',
    academicCounseling: 'Academic Counseling',

    // Discovery Drawer
    smartMatching: 'Smart Matching',
    beginAssessment: 'Begin Assessment',
    beginAssessmentSub: 'Answer a few questions to help us match you with verified, human providers best suited to your needs.',
    safetyDisclaimerTitle: 'Human-Led Support',
    safetyDisclaimerDesc: 'Not an emergency service. Call 911 if you are in immediate danger.',
    questionLabel: 'Question',
    backBtn: 'Back',
    submittingAssessment: 'Analyzing responses and searching verified providers...',
    matchesFoundTitle: 'Matches Found',
    matchesFoundDesc: 'Based on your answers, we have adjusted the directory filters to show the best providers for your preferences.',
    viewProvidersCTA: 'View Providers',
    crisisTitle: 'Immediate Support Needed',
    crisisDesc: 'Your assessment suggests you may be experiencing high levels of distress. Please reach out to the professional crisis support resources below immediately.',
    crisisFootnote: 'Disclaimer: Hatikehati is a directory matching service for human-led counseling. We are NOT an emergency medical service. If you are in life-threatening danger, call 911 immediately.',

    // Booking Modal & Checkout
    bookSessionWith: 'Book a session with',
    selectDate: 'Select Date',
    availableTimes: 'Available Times',
    checkoutDrawer: 'Checkout Drawer',
    secureGatewaySubtitle: 'Secure integration powered by Midtrans / Xendit API gateways.',
    orderSummary: 'Order Summary',
    consultationHour: '1h Consultation Session',
    securePlatformFee: 'Secure Platform Fee',
    totalBill: 'Total Bill Amount',
    sslSecured: '256-bit SSL encrypted connection',
    creditCardTab: 'Credit Card',
    virtualAccountTab: 'Virtual Account',
    qrisCodeTab: 'QRIS Code',
    cardNameLabel: 'Cardholder Name',
    cardNumberLabel: 'Card Number',
    cardExpiryLabel: 'Expiration Date',
    cardCvvLabel: 'CVV',
    selectBankLabel: 'Select Bank Destination',
    transferInstructions: 'Transfer instructions for Virtual Account:',
    copyBtn: 'Copy',
    vaStep1: 'Select Transfer > Virtual Account from your Mobile/Netbanking portal.',
    vaStep2: 'Input the copyable code above.',
    vaStep3: 'Ensure the transaction total equals the bill amount.',
    qrisScanDesc: 'Scan with GoPay, OVO, ShopeePay, or your bank\'s QR app to complete checkout instantly.',
    scanSuccessSimulate: 'Simulate QR Scan Success',
    ccPaySimulate: 'Pay',
    vaCompletedSimulate: 'I Have Completed Transfer',
    processingTx: 'Processing transaction...',
    bookingConfirmed: 'Booking Confirmed!',
    bookingSuccessSub: 'A Google Calendar invitation and Meet details have been registered to your email.',
    meetInvitationDetails: 'Google Meet Invitation Details:',
    receiptGeneratedTitle: 'Payment Receipt Generated',
    receiptGeneratedDesc: 'Save invoice details for insurance claims or company wellness reimbursement.',
    downloadPdfInvoice: 'Download PDF Invoice',
    leaveReviewTitle: 'Leave a Review',
    writeReviewPlaceholder: 'Write your feedback for this psychologist...',
    submitReviewCTA: 'Submit Review',
    reviewSuccessText: '✓ Review submitted! Thank you for your feedback.',
    doneBtn: 'Done',

    // Footer
    footerPolicy: 'Privacy Policy',
    footerTerms: 'Terms & Conditions',
    footerHelp: 'Help',
    footerContact: 'Contact',

    // General UI
    closeBtn: 'Close'
  },
  id: {
    // Brand
    brandName: 'Hatikehati',
    brandTagline: 'Layanan Kesehatan Mental Profesional, Diakses di Mana Saja',

    // Navbar
    findProvider: 'Cari Psikolog',
    adminPanel: 'Panel Admin',
    psychologistPanel: 'Panel Psikolog',
    corporatePortal: 'Portal Korporat',
    joinProvider: 'Gabung Jadi Psikolog',
    login: 'Masuk',
    logout: 'Keluar',
    greetUser: 'Halo, ',
    navLayanan: 'Layanan',
    navPsikolog: 'Psikolog',
    navArtikel: 'Artikel',
    navTentangKami: 'Tentang Kami',
    navMulaiKonseling: 'Mulai Konseling',

    // Hero Section
    heroTitlePart1: 'Bantuan Psikologis yang Tepat, ',
    heroTitleHighlight: 'Tanpa Ribet',
    heroSubtitle: 'Dapatkan dukungan emosional dari profesional berlisensi yang sesuai dengan kebutuhan Anda. Kami hadir untuk mendengarkan, tanpa penghakiman, di ruang yang aman.',
    heroBtnPrimary: 'Mulai Konseling',
    heroBtnSecondary: 'Pelajari Lebih Lanjut',
    findProviderCTA: 'Cari Psikolog',
    joinProviderCTA: 'Gabung Terapis',
    verifiedProfessionals: 'Profesional Terverifikasi',
    easyBooking: 'Pemesanan Mudah',

    // How It Works
    stepsSectionTitle: 'Langkah Mudah Menuju Ketenangan',
    stepsSectionSubtitle: 'Proses yang dirancang untuk meminimalkan beban pikiran Anda dan menghubungkan Anda dengan bantuan yang tepat secepat mungkin.',
    step1Title: '1. Assessment',
    step1Desc: 'Isi kuesioner singkat untuk membantu kami memahami tantangan yang sedang Anda hadapi.',
    step2Title: '2. Auto-Match',
    step2Desc: 'Sistem cerdas kami merekomendasikan psikolog yang spesifikasinya paling cocok dengan kebutuhan Anda.',
    step3Title: '3. Booking',
    step3Desc: 'Pilih jadwal yang paling nyaman bagi Anda langsung dari kalender ketersediaan psikolog.',
    step4Title: '4. Session',
    step4Desc: 'Mulai sesi konseling yang aman dan rahasia melalui platform video atau chat terenkripsi kami.',
    howItWorksTitle: 'Cara Kerja',

    // Trust & Stats Section
    verifiedProvidersCount: '80+ Psikolog Terverifikasi',
    sessionsCompletedCount: '5,000+ Sesi Selesai',
    membersCount: '10,000+ Anggota Terdaftar',
    satisfactionCount: 'Skor Kepuasan 4.9/5',

    // Specialized Services
    servicesSectionTitle: 'Layanan Terspesialisasi',
    servicesSectionSubtitle: 'Kami menyediakan ruang aman untuk berbagai spektrum tantangan mental. Setiap area ditangani oleh profesional dengan rekam jejak yang terverifikasi.',
    servicesLink: 'Lihat Semua Layanan',
    serviceStressTitle: 'Stress & Burnout',
    serviceStressDesc: 'Manajemen kelelahan mental, stres kerja, dan mengembalikan keseimbangan hidup.',
    serviceAnxietyTitle: 'Kecemasan (Anxiety)',
    serviceAnxietyDesc: 'Strategi mengatasi panic attack, overthinking, dan kecemasan berlebih (GAD).',
    serviceRelationshipTitle: 'Hubungan (Relationships)',
    serviceRelationshipDesc: 'Konseling pasangan, resolusi konflik keluarga, dan menetapkan batasan yang sehat.',

    // Categories
    anxietySupport: 'Dukungan Kecemasan',
    depressionSupport: 'Dukungan Depresi',
    relationshipCounseling: 'Konseling Hubungan',
    familyCounseling: 'Konseling Keluarga',
    careerCounseling: 'Konseling Karir',
    parentingSupport: 'Dukungan Parenting',
    traumaRecovery: 'Pemulihan Trauma',
    academicCounseling: 'Konseling Akademik',

    // Discovery Drawer
    smartMatching: 'Pencocokan Cerdas',
    beginAssessment: 'Mulai Asesmen',
    beginAssessmentSub: 'Jawab beberapa pertanyaan agar kami dapat mencocokkan Anda dengan psikolog manusia berlisensi yang paling sesuai.',
    safetyDisclaimerTitle: 'Dukungan Dipimpin Manusia',
    safetyDisclaimerDesc: 'Bukan layanan darurat. Hubungi 112 jika Anda berada dalam bahaya mendesak.',
    questionLabel: 'Pertanyaan',
    backBtn: 'Kembali',
    submittingAssessment: 'Menganalisis tanggapan dan mencari psikolog terverifikasi...',
    matchesFoundTitle: 'Hasil Pencocokan',
    matchesFoundDesc: 'Berdasarkan jawaban Anda, kami telah menyaring direktori untuk menampilkan psikolog terbaik.',
    viewProvidersCTA: 'Lihat Psikolog',
    crisisTitle: 'Butuh Dukungan Segera',
    crisisDesc: 'Asesmen Anda menunjukkan tingkat stres yang tinggi. Harap segera hubungi layanan darurat atau nomor krisis di bawah ini.',
    crisisFootnote: 'Disclaimer: Hatikehati adalah direktori pencocokan psikolog manusia. Kami BUKAN layanan medis darurat. Jika dalam bahaya, hubungi 112 atau kunjungi RS terdekat.',

    // Booking Modal & Checkout
    bookSessionWith: 'Pesan sesi dengan',
    selectDate: 'Pilih Tanggal',
    availableTimes: 'Jam yang Tersedia',
    checkoutDrawer: 'Halaman Pembayaran',
    secureGatewaySubtitle: 'Integrasi pembayaran aman ditenagai oleh gerbang Midtrans / Xendit.',
    orderSummary: 'Ringkasan Pesanan',
    consultationHour: 'Sesi Konsultasi 1 Jam',
    securePlatformFee: 'Biaya Layanan Aman',
    totalBill: 'Total Tagihan',
    sslSecured: 'Koneksi terenkripsi SSL 256-bit',
    creditCardTab: 'Kartu Kredit',
    virtualAccountTab: 'Virtual Account',
    qrisCodeTab: 'Kode QRIS',
    cardNameLabel: 'Nama Pemegang Kartu',
    cardNumberLabel: 'Nomor Kartu',
    cardExpiryLabel: 'Masa Berlaku (MM/YY)',
    cardCvvLabel: 'CVV',
    selectBankLabel: 'Pilih Bank Tujuan',
    transferInstructions: 'Petunjuk transfer Virtual Account:',
    copyBtn: 'Salin',
    vaStep1: 'Pilih Transfer > Virtual Account dari mobile banking atau internet banking Anda.',
    vaStep2: 'Masukkan kode pembayaran di atas.',
    vaStep3: 'Pastikan total transfer sama dengan jumlah tagihan.',
    qrisScanDesc: 'Pindai dengan GoPay, OVO, ShopeePay, Dana, atau mobile banking Anda untuk membayar instan.',
    scanSuccessSimulate: 'Simulasikan Pembayaran QR Sukses',
    ccPaySimulate: 'Bayar',
    vaCompletedSimulate: 'Saya Sudah Transfer',
    processingTx: 'Memproses transaksi...',
    bookingConfirmed: 'Pemesanan Berhasil!',
    bookingSuccessSub: 'Undangan Google Calendar beserta link Google Meet telah didaftarkan ke email Anda.',
    meetInvitationDetails: 'Detail Undangan Google Meet:',
    receiptGeneratedTitle: 'Kuitansi Pembayaran Dibuat',
    receiptGeneratedDesc: 'Simpan detail kuitansi ini untuk klaim asuransi atau reimburse kantor.',
    downloadPdfInvoice: 'Unduh Kuitansi PDF',
    leaveReviewTitle: 'Tulis Ulasan',
    writeReviewPlaceholder: 'Tulis ulasan Anda untuk psikolog ini...',
    submitReviewCTA: 'Kirim Ulasan',
    reviewSuccessText: '✓ Ulasan berhasil dikirim! Terima kasih atas masukan Anda.',
    doneBtn: 'Selesai',

    // Footer
    footerPolicy: 'Kebijakan Privasi',
    footerTerms: 'Syarat & Ketentuan',
    footerHelp: 'Bantuan',
    footerContact: 'Kontak',

    // General UI
    closeBtn: 'Tutup'
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');

  // Sync with localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('h2h_lang') as Language;
    if (savedLang === 'en' || savedLang === 'id') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('h2h_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
