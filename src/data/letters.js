// The 28 letters plus the extra signs, in alphabet order. `week` is the week a letter is introduced
// (Khalduniyya order). `joins: false` means the letter never connects to the letter after it.
// `sound` describes the sound in English for complete beginners. `tr` is the transliteration used in Weeks 1–3.

const L = (char, name, nameEn, tr, week, joins, sound) => ({ char, name, nameEn, tr, week, joins, sound });

export const LETTERS = [
  L('ا', 'أَلِف', 'alif', 'ā', 1, false, 'A long "aa", as in "father". At the start of a word it carries a hamza and the vowel on it.'),
  L('ب', 'بَاء', 'bā’', 'b', 2, true, 'Like English b in "bed".'),
  L('ت', 'تَاء', 'tā’', 't', 2, true, 'A light t, with the tongue against the back of the top teeth.'),
  L('ث', 'ثَاء', 'thā’', 'th', 2, true, 'Like th in "think".'),
  L('ج', 'جِيم', 'jīm', 'j', 5, true, 'Like j in "jam".'),
  L('ح', 'حَاء', 'ḥā’', 'ḥ', 5, true, 'A strong, breathy h from deep in the throat, like breathing on glasses to clean them.'),
  L('خ', 'خَاء', 'khā’', 'kh', 5, true, 'Like ch in Scottish "loch" or German "Bach".'),
  L('د', 'دَال', 'dāl', 'd', 1, false, 'Like English d, with the tongue against the back of the top teeth.'),
  L('ذ', 'ذَال', 'dhāl', 'dh', 3, false, 'Like th in "this".'),
  L('ر', 'رَاء', 'rā’', 'r', 1, false, 'A tapped or rolled r, as in Spanish "pero".'),
  L('ز', 'زَاي', 'zāy', 'z', 1, false, 'Like English z in "zoo".'),
  L('س', 'سِين', 'sīn', 's', 4, true, 'Like s in "sun".'),
  L('ش', 'شِين', 'shīn', 'sh', 4, true, 'Like sh in "she".'),
  L('ص', 'صَاد', 'ṣād', 'ṣ', 4, true, 'A heavy s: the back of the tongue is raised, making the vowels around it deeper.'),
  L('ض', 'ضَاد', 'ḍād', 'ḍ', 4, true, 'A heavy d. Arabic is called "the language of ḍād" because this sound is so special to it.'),
  L('ط', 'طَاء', 'ṭā’', 'ṭ', 7, true, 'A heavy t, the partner of ص and ض.'),
  L('ظ', 'ظَاء', 'ẓā’', 'ẓ', 7, true, 'A heavy "th" as in "this".'),
  L('ع', 'عَيْن', '‘ayn', '‘', 6, true, 'A squeezed sound from the middle of the throat. No English equivalent: listen and copy.'),
  L('غ', 'غَيْن', 'ghayn', 'gh', 6, true, 'Like a French r, gargled at the back of the mouth.'),
  L('ف', 'فَاء', 'fā’', 'f', 6, true, 'Like f in "fun".'),
  L('ق', 'قَاف', 'qāf', 'q', 6, true, 'A k made further back, where the tongue touches the soft palate.'),
  L('ك', 'كَاف', 'kāf', 'k', 7, true, 'Like k in "kite".'),
  L('ل', 'لَام', 'lām', 'l', 3, true, 'Like l in "lemon".'),
  L('م', 'مِيم', 'mīm', 'm', 3, true, 'Like m in "moon".'),
  L('ن', 'نُون', 'nūn', 'n', 1, true, 'Like n in "noon".'),
  L('ه', 'هَاء', 'hā’', 'h', 7, true, 'Like h in "hat", even at the end of a word.'),
  L('و', 'وَاو', 'wāw', 'w / ū', 1, false, 'Like w in "wow", or a long "oo" when it is a vowel.'),
  L('ي', 'يَاء', 'yā’', 'y / ī', 1, true, 'Like y in "yes", or a long "ee" when it is a vowel.'),
];

// Extra letters and signs that are not among the 28.
export const SIGNS = [
  { id: 'harakat', char: 'دَ دُ دِ', name: 'الْحَرَكَات', nameEn: 'short vowels', week: 1, note: 'Fatha ـَ = short a, damma ـُ = short u, kasra ـِ = short i. Written above or below the letter.' },
  { id: 'sukun', char: '◌ْ', name: 'السُّكُون', nameEn: 'sukūn', week: 1, note: 'A small circle above a letter: that letter has no vowel after it, as in وَرْد.' },
  { id: 'long', char: 'دَا دُو دِي', name: 'الْمَدّ', nameEn: 'long vowels', week: 1, note: 'ا, و and ي after a short vowel make it long: دَ da → دَا dā, دُ du → دُو dū, دِ di → دِي dī.' },
  { id: 'taa-marbuta', char: 'ة', name: 'التَّاء الْمَرْبُوطَة', nameEn: 'tā’ marbūṭa', week: 3, note: 'Comes only at the end of a word, usually feminine. It sounds like a short "a" (وَرْدَة), and like t when another word follows in the phrase.' },
  { id: 'al', char: 'الـ', name: 'أَل التَّعْرِيف', nameEn: 'al- ("the")', week: 3, note: 'Written as one with the word that follows: بَيْت a house → الْبَيْت the house.' },
  { id: 'shadda', char: 'بّ', name: 'الشَّدَّة', nameEn: 'shadda', week: 3, note: 'The letter is doubled: you hold it a little longer (حَمَّام).' },
  { id: 'lam-alif', char: 'لا', name: 'لَام أَلِف', nameEn: 'lām-alif', week: 3, note: 'ل followed by ا is always written as this special joined shape.' },
  { id: 'sun-moon', char: 'الشَّمْس / الْقَمَر', name: 'الْحُرُوف الشَّمْسِيَّة وَالْقَمَرِيَّة', nameEn: 'sun and moon letters', week: 4, note: 'Before a "sun letter" the ل of الـ is silent and the next letter is doubled (الشَّمْس = ash-shams). Before a "moon letter" it is pronounced (الْقَمَر = al-qamar).' },
  { id: 'hamza', char: 'ء أ إ ؤ ئ', name: 'الْهَمْزَة', nameEn: 'hamza', week: 8, note: 'A catch in the throat, like the break in "uh-oh". It sits alone (ء), on an alif (أ إ), on a wāw (ؤ) or on a dotless yā’ (ئ).' },
  { id: 'alif-maqsura', char: 'ى', name: 'الْأَلِف الْمَقْصُورَة', nameEn: 'alif maqṣūra', week: 8, note: 'A yā’ without dots at the end of a word, pronounced as a long "aa" (عَلَى).' },
  { id: 'madda', char: 'آ', name: 'الْمَدَّة', nameEn: 'madda', week: 8, note: 'A hamza followed by a long "aa", written as an alif with a wavy line (آسِف).' },
  { id: 'tanwin', char: 'ـً ـٌ ـٍ', name: 'التَّنْوِين', nameEn: 'tanwīn', week: 8, note: 'Doubled vowel signs add an "n" sound: كِتَابٌ kitābun, شُكْرًا shukran.' },
  { id: 'wasl', char: 'ٱ', name: 'هَمْزَة الْوَصْل', nameEn: 'connecting hamza', week: 8, note: 'Some words (اِسْم, the الـ) start with an alif that is pronounced only at the start of speech and dropped in the middle of a sentence.' },
  { id: 'dagger', char: 'هٰذَا', name: 'الْأَلِف الْخَنْجَرِيَّة', nameEn: 'dagger alif', week: 7, note: 'A small alif written above a letter in a few common words, such as هٰذَا (hādhā), usually spelled هذا.' },
];

export const byChar = Object.fromEntries(LETTERS.map((l) => [l.char, l]));

/** The four positional forms, built with tatweel so they display in any font. */
export function forms(char) {
  const l = byChar[char];
  if (!l) return null;
  if (!l.joins) return { isolated: char, initial: char, medial: 'ـ' + char, final: 'ـ' + char };
  return { isolated: char, initial: char + 'ـ', medial: 'ـ' + char + 'ـ', final: 'ـ' + char };
}

/** Letters known by the end of a given week. */
export const knownBy = (week) => LETTERS.filter((l) => l.week <= week).map((l) => l.char);

// The syllable drill (Khalduniyya style) for one letter: بَ بُ بِ بَا بُو بِي
export const syllables = (c) => [c + 'َ', c + 'ُ', c + 'ِ', c + 'َا', c + 'ُو', c + 'ِي'];
