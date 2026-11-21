// Primer-style line drawings, one per picturable word. Each is the inner markup of a 64×64 SVG drawn with
// stroke="currentColor". Class "a" = brick-red wash, "b" = blue wash, "g" = green wash, "y" = ochre wash.
// Digits, calendars, clocks and colour swatches are generated (see picSvg at the bottom).

const person = ({ hair = 'short', beard = false, scarf = false, cap = false, old = false, small = false, coat = false, arm = null } = {}) => {
  const k = small ? 0.82 : 1;
  const t = (x, y) => `${32 + (x - 32) * k},${64 - (64 - y) * k}`;
  const head = `<circle cx="${t(32, 20).split(',')[0]}" cy="${t(32, 20).split(',')[1]}" r="${8 * k}"/>`;
  let p = head;
  if (scarf) p += `<path class="a" d="M${t(22, 22)} Q${t(22, 9)} ${t(32, 9)} Q${t(42, 9)} ${t(42, 22)} L${t(44, 32)} L${t(20, 32)} Z"/>`;
  else if (hair === 'long') p += `<path d="M${t(24, 18)} Q${t(26, 9)} ${t(32, 10)} Q${t(39, 9)} ${t(40, 18)} M${t(24, 18)} L${t(23, 30)} M${t(40, 18)} L${t(41, 30)}"/>`;
  else if (hair === 'short') p += `<path d="M${t(24.5, 17)} Q${t(27, 10)} ${t(32, 11)} Q${t(38, 10)} ${t(39.5, 17)}"/>`;
  if (cap) p += `<path class="b" d="M${t(23, 15)} Q${t(32, 6)} ${t(41, 15)} Z M${t(40, 15)} L${t(46, 16)}"/>`;
  if (beard) p += `<path d="M${t(25, 22)} Q${t(32, 33)} ${t(39, 22)}"/>`;
  if (old) p += `<path d="M${t(27, 19)} h${3 * k} M${t(34, 19)} h${3 * k}"/>`;
  p += `<path class="${coat ? 'g' : scarf ? 'a' : 'b'}" d="M${t(20, 58)} Q${t(20, 33)} ${t(32, 33)} Q${t(44, 33)} ${t(44, 58)}"/>`;
  if (arm === 'wave') p += `<path d="M${t(42, 40)} L${t(50, 26)} M${t(48, 22)} l2 -3 M${t(52, 25)} l3 -2"/>`;
  if (arm === 'point') p += `<path d="M${t(40, 42)} L${t(56, 40)}"/>`;
  if (arm === 'self') p += `<path d="M${t(40, 46)} L${t(33, 42)}"/>`;
  if (old) p += `<path d="M${t(46, 36)} L${t(46, 60)} M${t(46, 36)} q3 0 3 3"/>`;
  return p;
};

export const PICS = {
  house: '<path class="y" d="M12 30 L32 14 L52 30 V54 H12 Z"/><path d="M26 54 V40 H38 V54 M8 33 L32 12 L56 33"/>',
  houses: '<path class="y" d="M6 34 L18 24 L30 34 V54 H6 Z"/><path class="y" d="M30 30 L44 18 L58 30 V54 H30 Z"/><path d="M15 54 V45 H21 V54 M40 54 V42 H48 V54"/>',
  fire: '<path class="a" d="M32 56 C18 56 16 42 22 34 C24 40 28 40 28 36 C28 26 34 20 34 10 C42 18 48 28 46 40 C45 50 40 56 32 56 Z"/><path d="M32 56 C27 56 26 49 29 45 C31 48 33 46 33 43 C37 46 38 52 32 56"/>',
  light: '<circle class="y" cx="32" cy="32" r="10"/><path d="M32 10 V16 M32 48 V54 M10 32 H16 M48 32 H54 M16 16 L20 20 M44 44 L48 48 M48 16 L44 20 M20 44 L16 48"/>',
  visit: '<path class="y" d="M30 28 L44 18 L58 28 V52 H30 Z"/><path d="M41 52 V42 H47 V52"/>' + '<circle cx="14" cy="22" r="5"/><path d="M14 27 V40 M14 40 L9 52 M14 40 L19 52 M14 31 L22 36 M14 31 L7 36 M22 46 h4 m-2 -2 l2 2 l-2 2"/>',
  roses: '<path class="a" d="M22 22 q-6 -8 0 -12 q6 -2 6 4 q2 -6 7 -3 q4 4 -3 11 Z"/><path class="a" d="M38 26 q-6 -8 0 -12 q6 -2 6 4 q2 -6 7 -3 q4 4 -3 11 Z"/><path d="M26 22 L30 56 M42 26 L34 56 M28 40 q-6 -4 -8 2 M36 44 q6 -4 8 2"/>',
  turn: '<path d="M44 20 A16 16 0 1 0 48 34"/><path d="M44 12 V21 H35"/><circle class="y" cx="32" cy="32" r="4"/>',
  boy: person({ hair: 'short', small: true }),
  girl: person({ hair: 'long', small: true }),
  door: '<rect class="y" x="18" y="8" width="28" height="48" rx="2"/><circle cx="40" cy="33" r="2"/><path d="M12 56 H52"/>',
  figs: '<path class="b" d="M22 24 C12 34 14 52 26 52 C38 52 38 34 28 24 Z"/><path class="b" d="M40 28 C32 36 34 52 44 52 C54 52 54 36 46 28 Z"/><path d="M25 24 V18 M43 28 V22 M26 40 q2 4 4 0"/>',
  oil: '<path class="y" d="M24 22 H40 V24 Q48 30 48 40 V54 H16 V40 Q16 30 24 24 Z"/><path d="M27 22 V12 H37 V22 M16 42 H48"/>',
  olives: '<ellipse class="g" cx="24" cy="38" rx="7" ry="10" transform="rotate(-20 24 38)"/><ellipse class="g" cx="40" cy="40" rx="7" ry="10" transform="rotate(15 40 40)"/><path d="M14 12 Q32 18 50 12 M24 15 Q20 20 24 28 M40 15 Q44 20 40 30 M32 17 q-6 -6 -12 -4 M32 17 q6 -6 12 -4"/>',
  thobe: '<path class="b" d="M24 8 H40 L50 16 L46 26 L42 22 V58 H22 V22 L18 26 L14 16 Z"/><path d="M28 8 L32 16 L36 8 M32 16 V30"/>',
  berries: '<circle class="a" cx="24" cy="36" r="7"/><circle class="a" cx="38" cy="34" r="7"/><circle class="a" cx="31" cy="46" r="7"/><path d="M31 27 Q31 16 40 12 M31 20 Q24 14 18 16"/>',
  world: '<circle class="b" cx="32" cy="32" r="22"/><path class="g" d="M17 22 q7 -7 13 -2 q4 6 -2 10 q-6 2 -6 9 q-7 -4 -5 -17 Z M37 30 q8 -2 12 4 q2 8 -6 14 q-4 -7 -6 -18 Z"/><path d="M10 32 H54 M32 10 Q20 32 32 54 M32 10 Q44 32 32 54"/>',
  pray: '<path class="y" d="M30 54 Q31 40 29 30 L24 16 Q22 12 19 14 L22 30 L14 22 Q11 20 10 24 L18 42 Q22 52 30 54 Z"/><path class="y" d="M34 54 Q33 40 35 30 L40 16 Q42 12 45 14 L42 30 L50 22 Q53 20 54 24 L46 42 Q42 52 34 54 Z"/><path d="M24 8 l2 3 M32 4 v4 M40 8 l-2 3"/>',
  hand: '<path class="y" d="M22 58 V34 L16 26 Q14 22 18 21 L24 28 V12 Q24 9 27 9 Q30 9 30 12 V26 V10 Q30 7 33 7 Q36 7 36 10 V26 V13 Q36 10 39 10 Q42 10 42 13 V28 V18 Q42 15 45 15 Q48 15 48 18 V40 Q48 52 40 58 Z"/>',
  cedar: '<path class="g" d="M32 6 L44 20 H38 L50 32 H42 L56 46 H8 L22 32 H14 L26 20 H20 Z"/><path d="M32 46 V58 M26 58 H38"/>',
  flag: '<path d="M14 58 V6"/><path class="a" d="M14 8 Q24 4 32 9 Q40 14 50 9 V31 Q40 36 32 31 Q24 26 14 30 Z"/>',
  night: '<path class="b" d="M40 10 A22 22 0 1 0 54 40 A17 17 0 0 1 40 10 Z"/><path d="M14 14 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 Z M22 40 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 Z"/>',
  lemon: '<path class="y" d="M12 34 Q14 20 32 18 Q50 18 52 32 Q56 34 52 37 Q48 48 32 48 Q14 48 12 37 Q8 35 12 34 Z"/><path d="M32 18 Q34 12 40 10"/>',
  banana: '<path class="y" d="M12 18 Q14 46 36 52 Q50 54 56 46 Q42 48 30 38 Q20 28 18 16 Z"/><path d="M12 18 L18 16 L17 12"/>',
  corn: '<path class="y" d="M32 8 Q44 18 40 42 Q36 52 32 52 Q28 52 24 42 Q20 18 32 8 Z"/><path d="M28 18 H36 M26 26 H38 M26 34 H38 M28 42 H36 M32 10 V50"/><path class="g" d="M32 56 Q18 50 16 34 Q22 44 30 46 M32 56 Q46 50 48 34 Q42 44 34 46"/>',
  dates: '<ellipse class="a" cx="22" cy="40" rx="6" ry="11" transform="rotate(-25 22 40)"/><ellipse class="a" cx="34" cy="38" rx="6" ry="11"/><ellipse class="a" cx="46" cy="40" rx="6" ry="11" transform="rotate(25 46 40)"/><path d="M34 27 Q32 14 22 8 M34 27 Q38 14 46 10"/>',
  yogurt: '<path class="b" d="M16 24 H48 L44 56 H20 Z"/><path d="M14 18 H50 V24 H14 Z M22 34 H42"/>',
  palette: '<path class="y" d="M32 8 C14 8 6 22 8 34 C10 46 22 56 34 54 C40 53 38 46 34 44 C30 41 34 36 40 38 C50 40 56 34 56 26 C56 16 46 8 32 8 Z"/><circle class="a" cx="20" cy="26" r="4"/><circle class="b" cx="30" cy="18" r="4"/><circle class="g" cx="42" cy="20" r="4"/>',
  rose: '<path class="a" d="M24 22 Q22 10 32 10 Q42 10 40 22 Q38 30 32 30 Q26 30 24 22 Z"/><path d="M30 16 Q34 14 34 20 M32 30 V58 M32 42 Q24 38 20 44 Q26 48 32 44 M32 50 Q40 46 44 50"/>',
  city: '<path class="y" d="M6 56 V30 H18 V56 M18 56 V18 H32 V56 M32 56 V26 H44 V56 M44 56 V36 H58 V56"/><path d="M4 56 H60 M22 24 h2 M27 24 h2 M22 32 h2 M27 32 h2 M22 40 h2 M27 40 h2 M10 36 h2 M36 32 h2 M38 40 h2 M48 42 h2"/>',
  pupil: person({ hair: 'short', small: true, arm: 'point' }) + '<path class="y" d="M46 28 H58 V40 H46 Z"/>',
  sun: '<circle class="y" cx="32" cy="32" r="11"/><path d="M32 8 V15 M32 49 V56 M8 32 H15 M49 32 H56 M15 15 L20 20 M44 44 L49 49 M49 15 L44 20 M20 44 L15 49"/>',
  tea: '<path class="a" d="M16 26 H44 V40 Q44 52 30 52 Q16 52 16 40 Z"/><path d="M44 30 Q54 30 52 38 Q50 44 44 42 M12 56 H48 M24 20 q-3 -5 0 -10 M32 20 q-3 -5 0 -10"/>',
  car: '<path class="a" d="M8 42 V34 L16 32 L22 22 H42 L50 32 L56 34 V42 Z"/><circle cx="19" cy="44" r="5"/><circle cx="45" cy="44" r="5"/><path d="M24 25 H31 V32 H19 M34 25 H40 L45 32 H34 Z"/>',
  picture: '<rect class="y" x="10" y="12" width="44" height="38" rx="2"/><path d="M14 44 L26 30 L34 38 L40 32 L50 44 Z"/><circle cx="42" cy="22" r="4"/>',
  eggs: '<ellipse class="y" cx="24" cy="38" rx="10" ry="13"/><ellipse class="y" cx="42" cy="38" rx="10" ry="13"/><path d="M10 52 H56"/>',
  onion: '<path class="a" d="M32 14 Q50 30 46 44 Q42 54 32 54 Q22 54 18 44 Q14 30 32 14 Z"/><path d="M32 14 Q30 8 34 6 M32 54 V58 M28 56 L26 59 M36 56 L38 59 M32 20 Q24 34 28 52 M32 20 Q40 34 36 52"/>',
  board: '<rect class="g" x="8" y="10" width="48" height="32" rx="2"/><path d="M16 50 L22 42 M48 50 L42 42 M16 20 h12 M16 27 h20 M16 34 h8"/>',
  school: '<path class="y" d="M8 56 V28 H56 V56"/><path d="M4 30 L32 12 L60 30 M26 56 V42 H38 V56 M14 36 h6 v6 h-6 Z M44 36 h6 v6 h-6 Z M32 12 V4 L40 6 L32 8"/>',
  dove: '<path class="b" d="M10 34 Q16 26 26 30 Q34 16 50 14 Q42 24 40 32 Q52 34 56 30 Q52 44 36 46 Q22 48 14 42 Z"/><circle cx="18" cy="32" r="1"/><path d="M10 34 L4 36 L10 37"/>',
  pyramids: '<path class="y" d="M4 54 L24 18 L44 54 Z"/><path class="y" d="M30 54 L44 30 L60 54"/><path d="M24 18 L28 54 M2 54 H62"/><circle cx="52" cy="14" r="5"/>',
  thermometer: '<path d="M28 44 V12 Q28 8 32 8 Q36 8 36 12 V44"/><circle class="a" cx="32" cy="48" r="7"/><path class="a" d="M30 44 V20 H34 V44"/><path d="M38 16 h4 M38 24 h4 M38 32 h4"/>',
  lantern: '<path d="M32 4 V10 M24 14 H40 L42 18 H22 Z"/><path class="y" d="M22 18 H42 L46 40 L42 48 H22 L18 40 Z"/><path d="M26 18 V48 M38 18 V48 M22 52 H42 L40 56 H24 Z"/><path class="a" d="M32 30 A5 5 0 1 0 36 36 A4 4 0 0 1 32 30 Z"/>',
  camel: '<path class="y" d="M8 38 Q10 28 18 28 Q22 18 30 26 Q36 14 44 26 L50 20 Q52 14 56 14 L58 18 L54 22 Q52 34 46 38 Z"/><path d="M14 38 V56 M22 38 V56 M38 38 V56 M44 38 V56 M8 38 Q6 44 8 48"/>',
  sea: '<path class="b" d="M4 30 Q12 24 20 30 Q28 36 36 30 Q44 24 52 30 Q56 33 60 30 V58 H4 Z"/><path d="M4 42 Q12 36 20 42 Q28 48 36 42 Q44 36 52 42 Q56 45 60 42 M40 16 L48 6 L48 24 Z M38 24 H52"/>',
  bread: '<path class="y" d="M8 40 Q8 24 32 22 Q56 24 56 40 Q56 48 32 48 Q8 48 8 40 Z"/><path d="M20 30 l4 6 M30 28 l4 6 M40 30 l4 6"/>',
  milk: '<path class="b" d="M20 20 L26 10 H38 L44 20 V56 H20 Z"/><path d="M20 20 H44 M24 32 H40 V44 H24 Z"/>',
  chicken: '<path class="y" d="M14 40 Q12 24 28 22 Q30 12 38 12 Q44 12 44 20 L50 22 L44 24 Q48 30 46 40 Q42 52 28 52 Q16 52 14 40 Z"/><path class="a" d="M36 12 q2 -6 6 -2 q2 -4 4 2"/><path d="M26 52 V58 M34 52 V58 M38 18 h1"/>',
  new: '<path class="y" d="M32 8 L36 26 L54 30 L36 34 L32 54 L28 34 L10 30 L28 26 Z"/><path d="M50 10 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 Z"/>',
  bath: '<path class="b" d="M8 32 H56 V38 Q56 50 44 50 H20 Q8 50 8 38 Z"/><path d="M14 32 V14 Q14 8 20 8 Q26 8 26 14 M24 18 H28 M18 50 L16 56 M46 50 L48 56"/>',
  island: '<path class="y" d="M12 46 Q32 34 52 46 Z"/><path class="b" d="M4 50 Q14 46 24 50 Q34 54 44 50 Q54 46 60 50 V58 H4 Z"/><path d="M32 42 Q30 28 34 16 M34 16 Q24 12 18 18 M34 16 Q44 10 50 16 M34 16 Q28 22 26 28 M34 16 Q42 20 44 26"/>',
  bay: '<path class="y" d="M4 8 H60 V56 H46 Q50 38 40 28 Q30 20 20 26 Q10 32 14 56 H4 Z"/><path class="b" d="M14 56 Q10 32 20 26 Q30 20 40 28 Q50 38 46 56 Z"/><path d="M24 44 q3 -3 6 0 q3 3 6 0 M28 36 q3 -3 6 0"/>',
  heart: '<path class="a" d="M32 54 C10 40 6 28 10 20 C14 12 26 10 32 20 C38 10 50 12 54 20 C58 28 54 40 32 54 Z"/>',
  eye: '<path class="b" d="M6 32 Q32 8 58 32 Q32 56 6 32 Z"/><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="3"/>',
  elephant: '<path class="b" d="M10 44 V30 Q10 16 26 16 H38 Q50 16 52 28 Q56 34 54 46 Q54 54 58 56 Q50 58 48 50 V44 H44 V56 H36 V44 H22 V56 H14 V44 Z"/><path d="M42 20 Q36 28 42 34 M48 26 h1"/>',
  pen: '<path class="b" d="M44 8 L56 20 L24 52 L10 56 L14 42 Z"/><path d="M38 14 L50 26 M14 42 L24 52"/>',
  room: '<path class="y" d="M8 10 H56 V56 H8 Z"/><path d="M8 44 L20 36 H44 L56 44 M20 36 V10 M44 36 V10 M26 18 h12 v10 h-12 Z"/>',
  moon: '<path class="y" d="M38 8 A24 24 0 1 0 56 42 A19 19 0 0 1 38 8 Z"/>',
  market: '<path class="a" d="M6 22 L12 10 H52 L58 22 Q54 28 48 22 Q42 28 38 22 Q32 28 26 22 Q20 28 16 22 Q10 28 6 22 Z"/><path d="M10 24 V56 H54 V24 M18 56 V38 H46 V56"/><circle class="y" cx="24" cy="34" r="3"/><circle class="g" cx="32" cy="34" r="3"/><circle class="a" cx="40" cy="34" r="3"/>',
  hotel: '<path class="y" d="M14 56 V8 H50 V56"/><path d="M8 56 H56 M28 56 V46 H36 V56 M20 14 h6 v6 h-6 Z M38 14 h6 v6 h-6 Z M20 26 h6 v6 h-6 Z M38 26 h6 v6 h-6 Z M20 38 h6 v4 h-6 Z M38 38 h6 v4 h-6 Z"/>',
  juice: '<path class="y" d="M18 18 H46 L42 56 H22 Z"/><path d="M36 18 L44 6 M18 30 H45"/><circle class="y" cx="50" cy="22" r="6"/>',
  apple: '<path class="a" d="M32 20 Q20 12 14 22 Q8 36 18 50 Q24 58 32 52 Q40 58 46 50 Q56 36 50 22 Q44 12 32 20 Z"/><path d="M32 20 Q32 12 36 8"/><path class="g" d="M34 14 Q42 6 48 12 Q40 18 34 14 Z"/>',
  orange: '<circle class="y" cx="32" cy="36" r="18"/><path d="M32 18 Q32 12 36 10"/><path class="g" d="M34 14 Q42 8 46 14 Q40 18 34 14 Z"/><path d="M24 30 h1 M38 40 h1 M30 46 h1"/>',
  friends: person({ hair: 'short', small: true }).replace(/<(circle|path)/g, '<$1 transform="translate(-10 0)"') + person({ hair: 'long', small: true }).replace(/<(circle|path)/g, '<$1 transform="translate(10 0)"'),
  arabic: '<rect class="y" x="8" y="12" width="48" height="40" rx="3"/><text x="32" y="40" text-anchor="middle" font-size="22" font-family="Noto Naskh Arabic, serif" fill="currentColor" stroke="none">عَرَبِيّ</text>',
  palm: '<path d="M32 58 Q30 40 32 22"/><path class="g" d="M32 22 Q20 10 8 16 Q20 16 32 22 Q26 8 14 6 M32 22 Q44 10 56 16 Q44 16 32 22 Q38 8 50 6 M32 22 Q22 22 14 32 M32 22 Q42 22 50 32"/><circle class="a" cx="29" cy="26" r="2"/><circle class="a" cx="35" cy="26" r="2"/>',
  book: '<path class="b" d="M8 14 Q20 10 32 16 Q44 10 56 14 V52 Q44 48 32 54 Q20 48 8 52 Z"/><path d="M32 16 V54"/>',
  'student-m': person({ hair: 'short' }) + '<path class="y" d="M10 40 L22 36 V54 L10 58 Z"/>',
  'student-f': person({ scarf: true }) + '<path class="y" d="M10 40 L22 36 V54 L10 58 Z"/>',
  doctor: person({ hair: 'short', coat: true }) + '<path d="M28 36 Q26 48 32 50 Q38 48 36 36 M32 50 v4"/>',
  noon: '<circle class="y" cx="32" cy="14" r="7"/><path d="M4 50 H60 M32 26 V48 M32 2 V4"/><path d="M26 50 Q32 46 38 50"/>',
  dog: '<path class="y" d="M14 30 Q14 22 22 22 H44 L50 14 L56 18 L54 28 Q54 34 48 34 V54 H42 V42 H22 V54 H16 V40 Q10 38 8 30 Z"/><path d="M14 30 L6 26 M51 20 h1"/>',
  pot: '<path class="a" d="M10 26 H54 V40 Q54 54 32 54 Q10 54 10 40 Z"/><path d="M6 26 H58 M24 20 Q32 14 40 20 M10 32 H4 M54 32 H60 M26 10 q-3 -4 0 -8 M38 10 q-3 -4 0 -8"/>',
  desk: '<path class="y" d="M6 22 H58 V28 H6 Z"/><path d="M10 28 V56 M54 28 V56 M36 28 V44 H54 M40 36 h4 M14 12 h10 v10 h-10 Z"/>',
  chair: '<path class="y" d="M20 8 H44 V32 H20 Z"/><path d="M16 32 H48 V38 H16 Z M20 38 V58 M44 38 V58"/>',
  coffee: '<path class="y" d="M28 10 Q26 6 32 6 Q38 6 36 10 L40 14 Q48 22 44 40 L50 50 H14 L20 40 Q16 22 24 14 Z"/><path d="M44 22 Q56 16 58 28 L50 34 M22 56 H42"/>',
  he: person({ hair: 'short', arm: 'point' }),
  she: person({ hair: 'long', arm: 'point' }),
  me: person({ hair: 'short', arm: 'self' }),
  'you-m': person({ hair: 'short' }) + '<path d="M8 40 L18 40 M14 36 L18 40 L14 44"/>',
  'you-f': person({ scarf: true }) + '<path d="M8 40 L18 40 M14 36 L18 40 L14 44"/>',
  father: person({ hair: 'short', beard: true }),
  mother: person({ scarf: true }),
  brother: person({ hair: 'short', small: true }),
  sister: person({ hair: 'long', small: true }),
  nametag: '<rect class="y" x="8" y="18" width="48" height="30" rx="4"/><path d="M8 28 H56 M18 40 H46"/><path d="M32 18 V10"/>',
  water: '<path class="b" d="M32 6 Q48 28 48 40 Q48 54 32 54 Q16 54 16 40 Q16 28 32 6 Z"/><path d="M24 40 Q24 48 32 48"/>',
  question: '<circle class="y" cx="32" cy="32" r="24"/><path d="M24 24 Q24 14 32 14 Q42 14 40 24 Q38 30 32 32 V38 M32 46 V47"/>',
  evening: '<path class="a" d="M14 44 A18 18 0 0 1 50 44 Z"/><path d="M4 44 H60 M10 52 H54 M18 58 H46"/><path d="M48 12 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 Z"/>',
  wave: person({ hair: 'short', arm: 'wave' }),
  cafe: '<path class="y" d="M14 26 H42 V40 Q42 52 28 52 Q14 52 14 40 Z"/><path d="M42 30 Q52 30 50 38 Q48 44 42 42 M8 56 H48 M22 20 q-3 -5 0 -10 M32 20 q-3 -5 0 -10"/>',
  on: '<path class="y" d="M8 40 H56 V46 H8 Z"/><path d="M12 46 V58 M52 46 V58"/><rect class="a" x="24" y="24" width="16" height="16"/>',
  to: '<path d="M8 32 H50 M40 22 L52 32 L40 42"/><circle class="y" cx="56" cy="32" r="4"/>',
  calendar: '<rect class="y" x="10" y="12" width="44" height="42" rx="3"/><path d="M10 22 H54 M20 8 V16 M44 8 V16 M18 30 h4 M30 30 h4 M42 30 h4 M18 38 h4 M30 38 h4 M42 38 h4 M18 46 h4 M30 46 h4"/>',
  cake: '<path class="a" d="M12 34 H52 V54 H12 Z"/><path class="y" d="M12 34 Q18 40 24 34 Q30 40 36 34 Q42 40 48 34 L52 34"/><path d="M24 34 V24 M32 34 V24 M40 34 V24 M24 20 v-2 M32 20 v-2 M40 20 v-2 M8 54 H56"/>',
  hash: '<path d="M22 10 L18 54 M42 10 L38 54 M10 24 H54 M8 40 H52"/>',
  phone: '<rect class="b" x="18" y="6" width="28" height="52" rx="5"/><path d="M28 12 H36 M30 50 H34 M22 18 H42 V44 H22 Z"/>',
  spring: '<circle class="y" cx="32" cy="24" r="5"/><path class="a" d="M32 19 Q28 8 32 6 Q36 8 32 19 M37 24 Q48 20 50 24 Q48 28 37 24 M32 29 Q36 40 32 42 Q28 40 32 29 M27 24 Q16 28 14 24 Q16 20 27 24"/><path d="M32 42 V58"/><path class="g" d="M32 52 Q22 44 18 50 Q24 56 32 52"/>',
  summer: '<circle class="y" cx="40" cy="20" r="9"/><path d="M40 4 V8 M40 32 V36 M24 20 H28 M52 20 H56"/><path class="b" d="M4 44 Q14 40 24 44 Q34 48 44 44 Q54 40 60 44 V58 H4 Z"/>',
  autumn: '<path class="y" d="M32 8 L36 18 L46 14 L42 26 L54 28 L44 36 L48 46 L36 42 L32 56 L28 42 L16 46 L20 36 L10 28 L22 26 L18 14 L28 18 Z"/><path d="M32 18 V60"/>',
  winter: '<path d="M32 8 V56 M11 20 L53 44 M11 44 L53 20 M26 12 L32 18 L38 12 M26 52 L32 46 L38 52 M12 28 L18 30 L16 24 M52 36 L46 34 L48 40 M12 36 L18 34 L16 40 M52 28 L46 30 L48 24"/>',
  hot: '<path d="M26 40 V12 Q26 8 30 8 Q34 8 34 12 V40"/><circle class="a" cx="30" cy="46" r="7"/><path class="a" d="M28 42 V16 H32 V42"/><circle class="y" cx="48" cy="20" r="6"/><path d="M48 8 v3 M48 29 v3 M38 20 h-2 M58 20 h2"/>',
  cold: '<path d="M26 40 V12 Q26 8 30 8 Q34 8 34 12 V40"/><circle class="b" cx="30" cy="46" r="7"/><path class="b" d="M28 42 V36 H32 V42"/><path d="M48 10 V30 M39 15 L57 25 M39 25 L57 15"/>',
  rain: '<path class="b" d="M14 34 Q6 34 6 26 Q6 18 16 18 Q18 8 30 8 Q42 8 44 18 Q56 16 58 26 Q58 34 50 34 Z"/><path d="M18 42 L14 50 M30 42 L26 50 M42 42 L38 50 M24 52 L20 60 M36 52 L32 60"/>',
  sparkle: '<path class="y" d="M24 12 L28 26 L42 30 L28 34 L24 48 L20 34 L6 30 L20 26 Z"/><path class="y" d="M46 34 L48 42 L56 44 L48 46 L46 54 L44 46 L36 44 L44 42 Z"/>',
  cloud: '<path class="b" d="M14 46 Q4 46 4 36 Q4 26 16 26 Q18 12 32 12 Q46 12 48 26 Q60 26 60 36 Q60 46 50 46 Z"/>',
  today: '<rect class="y" x="10" y="12" width="44" height="42" rx="3"/><path d="M10 22 H54 M20 8 V16 M44 8 V16"/><circle class="a" cx="32" cy="38" r="8"/>',
  yesterday: '<rect class="y" x="10" y="12" width="44" height="42" rx="3"/><path d="M10 22 H54 M20 8 V16 M44 8 V16 M40 38 H24 M30 32 L24 38 L30 44"/>',
  tomorrow: '<rect class="y" x="10" y="12" width="44" height="42" rx="3"/><path d="M10 22 H54 M20 8 V16 M44 8 V16 M24 38 H40 M34 32 L40 38 L34 44"/>',
  shirt: '<path class="b" d="M22 8 L32 14 L42 8 L56 16 L50 28 L44 24 V56 H20 V24 L14 28 L8 16 Z"/><path d="M32 14 V56 M28 22 h1 M28 32 h1 M28 42 h1"/>',
  trousers: '<path class="b" d="M18 8 H46 L50 58 H36 L32 24 L28 58 H14 Z"/><path d="M18 14 H46"/>',
  dress: '<path class="a" d="M24 6 H40 L38 20 L52 58 H12 L26 20 Z"/><path d="M26 20 H38"/>',
  shoe: '<path class="y" d="M6 46 V30 Q6 24 12 24 H20 Q22 34 32 36 L52 40 Q58 42 58 48 V50 H6 Z"/><path d="M6 46 H58"/>',
  hat: '<path class="a" d="M18 40 Q18 16 32 16 Q46 16 46 40"/><path d="M6 42 Q32 34 58 42 Q32 50 6 42 Z M18 34 H46"/>',
  coat: '<path class="g" d="M22 6 L32 14 L42 6 L54 14 L52 58 H12 L10 14 Z"/><path d="M32 14 V58 M22 6 L28 24 M42 6 L36 24 M36 32 h1 M36 42 h1 M14 36 h10 M40 36 h10"/>',
  notebook: '<rect class="b" x="14" y="8" width="38" height="48" rx="2"/><path d="M20 8 V56 M10 16 h8 M10 26 h8 M10 36 h8 M10 46 h8 M26 20 H46 M26 28 H46"/>',
  table: '<path class="y" d="M6 24 H58 V30 H6 Z"/><path d="M12 30 V56 M52 30 V56 M18 30 V48 M46 30 V48"/>',
  window: '<rect class="b" x="12" y="8" width="40" height="46" rx="2"/><path d="M32 8 V54 M12 30 H52 M8 54 H56"/>',
  grandfather: person({ hair: 'none', beard: true, old: true }),
  grandmother: person({ scarf: true, old: true }),
  husband: person({ hair: 'short', beard: true }).replace(/<(circle|path)/g, '<$1 transform="translate(-10 0)"') + '<path class="a" d="M32 52 C26 48 25 45 27 43 C29 41 31 42 32 44 C33 42 35 41 37 43 C39 45 38 48 32 52 Z"/>',
  wife: person({ scarf: true }).replace(/<(circle|path)/g, '<$1 transform="translate(10 0)"') + '<path class="a" d="M32 52 C26 48 25 45 27 43 C29 41 31 42 32 44 C33 42 35 41 37 43 C39 45 38 48 32 52 Z"/>',
  uncle: person({ hair: 'short', beard: true, cap: true }),
  rice: '<path class="y" d="M8 34 H56 Q56 54 32 54 Q8 54 8 34 Z"/><path d="M14 34 Q32 18 50 34 M22 28 l2 -1 M30 25 l2 -1 M38 26 l2 1 M26 32 l2 -1 M34 30 l2 1"/>',
  meat: '<path class="a" d="M8 30 Q8 16 26 14 Q48 12 54 26 Q58 40 44 48 Q28 56 14 48 Q8 42 8 30 Z"/><path class="y" d="M14 30 Q14 22 26 20 Q42 18 46 28 Q48 36 40 40 Q30 44 22 40 Q14 36 14 30 Z"/><circle cx="34" cy="30" r="4"/>',
  fish: '<path class="b" d="M8 32 Q22 14 42 24 L56 16 V48 L42 40 Q22 50 8 32 Z"/><circle cx="18" cy="29" r="2"/><path d="M28 24 Q32 32 28 40"/>',
  salad: '<path class="y" d="M6 32 H58 Q58 54 32 54 Q6 54 6 32 Z"/><path class="g" d="M12 32 Q16 20 26 24 Q30 14 38 22 Q48 18 52 32"/><circle class="a" cx="26" cy="30" r="3"/><circle class="a" cx="40" cy="29" r="3"/>',
  hummus: '<path class="y" d="M6 34 Q6 52 32 52 Q58 52 58 34 Z"/><path d="M6 34 H58 M16 34 Q32 22 48 34 M28 30 Q32 26 36 30"/><circle class="g" cx="32" cy="28" r="2"/>',
  falafel: '<circle class="y" cx="22" cy="36" r="9"/><circle class="y" cx="40" cy="34" r="9"/><circle class="y" cx="31" cy="22" r="9"/><path d="M18 34 h2 M38 32 h2 M29 20 h2 M6 48 H58 L52 54 H12 Z"/>',
  dislike: '<path class="a" d="M32 54 C10 40 6 28 10 20 C14 12 26 10 32 20 C38 10 50 12 54 20 C58 28 54 40 32 54 Z"/><path d="M8 8 L56 56"/>',
  price: '<path class="y" d="M30 8 H54 V32 L30 56 L8 34 Z"/><circle cx="44" cy="18" r="3"/><path d="M26 36 Q22 32 26 28 Q30 26 34 30 M20 30 L32 42"/>',
  offer: '<path class="y" d="M6 40 H58 Q56 48 32 48 Q8 48 6 40 Z"/><path class="b" d="M14 40 V28 H24 V40 M38 40 V24 H50 V40"/><path d="M24 31 Q29 31 28 36 M50 28 Q55 28 54 33 M18 22 q-2 -4 0 -8 M44 18 q-2 -4 0 -8 M10 54 H54"/>',
  plate: '<ellipse class="y" cx="32" cy="38" rx="24" ry="12"/><ellipse cx="32" cy="36" rx="14" ry="6"/><path d="M6 14 V26 M10 14 V26 M8 26 V54 M58 14 Q50 20 54 30 V54"/>',
  alarm: '<circle class="y" cx="32" cy="34" r="18"/><path d="M32 22 V34 L40 40 M14 14 L22 20 M50 14 L42 20 M20 54 L24 50 M44 54 L40 50"/>',
  cup: '<path class="b" d="M14 22 H44 L42 54 H16 Z"/><path d="M44 28 Q54 28 52 38 Q50 44 43 42"/>',
  walk: '<circle cx="34" cy="10" r="5"/><path d="M34 15 L30 34 L22 56 M30 34 L38 44 L36 56 M32 22 L42 30 M32 22 L22 28"/><path class="y" d="M44 52 H60"/>',
  briefcase: '<rect class="y" x="8" y="20" width="48" height="34" rx="3"/><path d="M24 20 V14 H40 V20 M8 34 H56 M28 32 h8 v6 h-8 Z"/>',
  bed: '<path class="b" d="M6 40 H58 V50 H6 Z"/><path d="M6 24 V56 M58 34 V56"/><path class="y" d="M10 30 H24 V40 H10 Z"/><path class="a" d="M24 32 H56 V40 H24 Z"/>',
  star: '<path class="a" d="M32 6 L39 24 L58 24 L43 36 L49 56 L32 44 L15 56 L21 36 L6 24 L25 24 Z"/>',
};

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const toArabicDigits = (s) => String(s).replace(/[0-9]/g, (d) => AR_DIGITS[d]);
const DAY_ABBR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const SWATCH = { red: '#c0392b', blue: '#2e5fa7', green: '#3c7a3c', yellow: '#e2b62f', white: '#ffffff', black: '#1d1d1d', brown: '#7b4a26', orange: '#e47a1b' };

const textPic = (big, small, cls = 'y') =>
  `<rect class="${cls}" x="6" y="8" width="52" height="48" rx="6"/>` +
  `<text x="32" y="${small ? 36 : 42}" text-anchor="middle" font-size="${big.length > 2 ? 18 : 26}" font-family="Noto Naskh Arabic, serif" fill="currentColor" stroke="none">${big}</text>` +
  (small ? `<text x="32" y="50" text-anchor="middle" font-size="9" font-family="Noto Naskh Arabic, serif" fill="currentColor" stroke="none">${small}</text>` : '');

function clock(h, m) {
  const ha = ((h % 12) + m / 60) * 30 - 90;
  const ma = m * 6 - 90;
  const p = (a, r) => `${32 + r * Math.cos((a * Math.PI) / 180)} ${32 + r * Math.sin((a * Math.PI) / 180)}`;
  let ticks = '';
  for (let i = 0; i < 12; i++) ticks += `M${p(i * 30, 20)} L${p(i * 30, 23)} `;
  return `<circle class="y" cx="32" cy="32" r="25"/><path d="${ticks}"/><path stroke-width="3.5" d="M32 32 L${p(ha, 12)}"/><path d="M32 32 L${p(ma, 19)}"/><circle cx="32" cy="32" r="1.5"/>`;
}

/** The inner markup for any pic id, including generated ones. */
export function picMarkup(id) {
  if (!id) return null;
  if (PICS[id]) return PICS[id];
  let m;
  if ((m = id.match(/^d(\d+)$/))) return textPic(toArabicDigits(m[1]), m[1]);
  if ((m = id.match(/^cal-(\d)$/))) return textPic(DAY_ABBR[m[1] - 1], null, 'b').replace('font-size="18"', 'font-size="14"').replace('font-size="26"', 'font-size="14"');
  if ((m = id.match(/^mon-(\d+)$/))) return textPic(toArabicDigits(m[1]), ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m[1]], 'g');
  if ((m = id.match(/^c-(\w+)$/))) return `<rect x="10" y="10" width="44" height="44" rx="8" fill="${SWATCH[m[1]]}" style="fill:${SWATCH[m[1]]}"/>`;
  if ((m = id.match(/^clock-(\d+)$/))) return clock(+m[1] || 12, 0);
  if (id === 'clock-half') return clock(3, 30);
  if (id === 'clock-quarter') return clock(3, 15);
  if (id === 'clock-to') return clock(3, 45);
  return null;
}

/** A complete standalone SVG string (used for the worksheets and slides). */
export function picSvg(id, { size = 256, ink = '#2f2114', wash = { a: '#f3c9b8', b: '#c9d8f0', g: '#cfe3c4', y: '#f4e1a8' } } = {}) {
  const inner = picMarkup(id);
  if (!inner) return null;
  const style = `.a{fill:${wash.a}}.b{fill:${wash.b}}.g{fill:${wash.g}}.y{fill:${wash.y}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><style>${style}</style>${inner}</svg>`;
}
