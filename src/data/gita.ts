export interface Verse {
  chapter: number;
  verse: number;
  shloka: string;
  transliteration: string;
  translation: string;
  explanation: string;
}

export interface Chapter {
  id: number;
  name: string;
  name_translation: string;
  verses_count: number;
  summary: string;
}

export const chapters: Chapter[] = [
  { id: 1, name: "Arjuna Vishada Yoga", name_translation: "অর্জুন-বিষাদ যোগ", verses_count: 47, summary: "অর্জুনের বিষাদ ও মোহ।" },
  { id: 2, name: "Sankhya Yoga", name_translation: "সাংখ্য যোগ", verses_count: 72, summary: "আত্মার অমরত্ব ও কর্মযোগের শিক্ষা।" },
  { id: 3, name: "Karma Yoga", name_translation: "কর্ম যোগ", verses_count: 43, summary: "নিষ্কাম কর্মের পথ।" },
  { id: 4, name: "Jnana Karma Sanyasa Yoga", name_translation: "জ্ঞান-কর্ম-সন্ন্যাস যোগ", verses_count: 42, summary: "জ্ঞান ও কর্মের সমন্বয়।" },
  { id: 5, name: "Karma Sanyasa Yoga", name_translation: "কর্ম-সন্ন্যাস যোগ", verses_count: 29, summary: "সন্ন্যাস ও কর্মযোগের তুলনা।" },
  { id: 6, name: "Dhyana Yoga", name_translation: "ধ্যান যোগ", verses_count: 47, summary: "ধ্যান ও আত্মসংযম।" },
  { id: 7, name: "Jnana Vijnana Yoga", name_translation: "জ্ঞান-বিজ্ঞান যোগ", verses_count: 30, summary: "পরমাত্মার জ্ঞান।" },
  { id: 8, name: "Akshara Brahma Yoga", name_translation: "অক্ষর-ব্রহ্ম যোগ", verses_count: 28, summary: "অবিনাশী ব্রহ্মের পথ।" },
  { id: 9, name: "Raja Vidya Raja Guhya Yoga", name_translation: "রাজবিদ্যা-রাজগুহ্য যোগ", verses_count: 34, summary: "পরম গোপনীয় জ্ঞান।" },
  { id: 10, name: "Vibhuti Yoga", name_translation: "বিভূতি যোগ", verses_count: 42, summary: "ঈশ্বরের ঐশ্বর্য।" },
  { id: 11, name: "Vishwarupa Darshana Yoga", name_translation: "বিশ্বরূপ-দর্শন যোগ", verses_count: 55, summary: "বিশ্বরূপ দর্শন।" },
  { id: 12, name: "Bhakti Yoga", name_translation: "ভক্তি যোগ", verses_count: 20, summary: "ভক্তির পথ।" },
  { id: 13, name: "Kshetra Kshetrajna Vibhaga Yoga", name_translation: "ক্ষেত্র-ক্ষেত্রজ্ঞ বিভাগ যোগ", verses_count: 34, summary: "প্রকৃতি, পুরুষ ও চেতনা।" },
  { id: 14, name: "Gunatraya Vibhaga Yoga", name_translation: "গুণত্রয়-বিভাগ যোগ", verses_count: 27, summary: "তিনটি গুণের বিশ্লেষণ।" },
  { id: 15, name: "Purushottama Yoga", name_translation: "পুরুষোত্তম যোগ", verses_count: 20, summary: "পরম পুরুষ।" },
  { id: 16, name: "Daivasura Sampad Vibhaga Yoga", name_translation: "দৈবাসুর-সম্পদ বিভাগ যোগ", verses_count: 24, summary: "দৈব ও আসুরিক স্বভাব।" },
  { id: 17, name: "Shraddhatraya Vibhaga Yoga", name_translation: "শ্রদ্ধাত্রয়-বিভাগ যোগ", verses_count: 28, summary: "তিন প্রকার শ্রদ্ধা।" },
  { id: 18, name: "Moksha Sanyasa Yoga", name_translation: "মোক্ষ-সন্ন্যাস যোগ", verses_count: 78, summary: "উপসংহার ও মুক্তি।" }
];

// Sample verses for Chapter 1 and 2
export const sampleVerses: Verse[] = [
  {
    chapter: 1,
    verse: 1,
    shloka: "धृतराष्ट्र उवाच |\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय || ১-১ ||",
    transliteration: "dhṛtarāṣṭra uvāca |\ndharmakṣetre kurukṣetre samavetā yuyutsavaḥ |\nmāmakāḥ pāṇḍavāścaiva kimakurvata sañjaya || 1-1 ||",
    translation: "ধৃতরাষ্ট্র বললেন— হে সঞ্জয়! ধর্মভূমি কুরুক্ষেত্রে যুদ্ধের মানসে সমবেত হয়ে আমার পুত্রগণ এবং পাণ্ডুর পুত্রগণ কি করল?",
    explanation: "কুরুক্ষেত্র যুদ্ধ শুরুর প্রাক্কালে ধৃতরাষ্ট্র সঞ্জয়কে জিজ্ঞাসা করছেন যে তার পুত্ররা এবং পাণ্ডবরা যুদ্ধের ময়দানে কী করছে। এটি গীতার প্রথম শ্লোক।"
  },
  {
    chapter: 2,
    verse: 47,
    shloka: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |\nमा कर्मফলहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि || ২-৪৭ ||",
    transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi || 2-47 ||",
    translation: "তোমার কেবল কর্মেই অধিকার আছে, কিন্তু কর্মফলে কখনও অধিকার নেই। তুমি কর্মফলের হেতু হয়ো না এবং অকর্মণ্যতায়ও তোমার আসক্তি না থাকুক।",
    explanation: "এটি গীতার অন্যতম শ্রেষ্ঠ শ্লোক। এখানে ভগবান শ্রীকৃষ্ণ নিষ্কাম কর্মযোগের শিক্ষা দিয়েছেন। আমাদের কর্তব্য পালন করা উচিত ফলের আশা না করে।"
  },
  {
    chapter: 2,
    verse: 20,
    shloka: "न जायते म्रियते वा कदाचिन्\nनायं भूत्वा भविता वा न भूयः |\nअजो नित्यः शाश्वतोऽयं पुराणो\nन हन्यते हन्यमाने शरीरे || ২-২০ ||",
    transliteration: "na jāyate mriyate vā kadācin\nnāyaṁ bhūtvā bhavitā vā na bhūyaḥ |\najo nityaḥ śāśvato ’yaṁ purāṇo\nna hanyate hanyamāne śarīre || 2-20 ||",
    translation: "আত্মা কখনও জন্মায় না বা মরে না, অথবা বারবার উৎপন্ন হয়ে পুনরায় অস্তিত্বহীন হয় না। আত্মা জন্মরহিত, নিত্য, শাশ্বত ও পুরাতন; শরীর নষ্ট হলেও আত্মা বিনষ্ট হয় না।",
    explanation: "শ্রীকৃষ্ণ অর্জুনকে আত্মার অমরত্ব সম্পর্কে বোঝাচ্ছেন। শোক করার কোনো কারণ নেই কারণ আত্মা অবিনাশী।"
  }
];
