/** Turkish orthography to approximate Korean Hangul pronunciation. */
const vowels: Record<string, string> = {
    a: 'ㅏ', e: 'ㅔ', ı: 'ㅡ', i: 'ㅣ', o: 'ㅗ', ö: 'ㅚ', u: 'ㅜ', ü: 'ㅟ',
};
// Keep the y glide when composing a Hangul syllable: ye -> 예, not 에.
const yVowels: Record<string, string> = {
    a: 'ㅑ', e: 'ㅖ', ı: 'ㅡ', i: 'ㅣ', o: 'ㅛ', ö: 'ㅚ', u: 'ㅠ', ü: 'ㅟ',
};
const consonants: Record<string, string> = {
    b: 'ㅂ', c: 'ㅈ', ç: 'ㅊ', d: 'ㄷ', f: 'ㅍ', g: 'ㄱ', h: 'ㅎ',
    j: 'ㅈ', k: 'ㅋ', l: 'ㄹ', m: 'ㅁ', n: 'ㄴ', p: 'ㅍ', r: 'ㄹ',
    s: 'ㅅ', ş: 'ㅅ', t: 'ㅌ', v: 'ㅂ', y: 'ㅇ', z: 'ㅈ',
};
const codas: Record<string, string> = {
    b: 'ㅂ', c: 'ㅈ', ç: 'ㅊ', d: 'ㄷ', f: 'ㅂ', g: 'ㄱ', h: 'ㅎ',
    j: 'ㅈ', k: 'ㄱ', l: 'ㄹ', m: 'ㅁ', n: 'ㄴ', p: 'ㅂ', r: 'ㄹ',
    s: 'ㅅ', ş: 'ㅅ', t: 'ㅅ', v: 'ㅂ', z: 'ㅅ',
};
const choseong = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const jungseong = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const jongseong = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
function compose(initial: string, medial: string, final = ''): string {
    const a = choseong.indexOf(initial), b = jungseong.indexOf(medial), c = jongseong.indexOf(final);
    if (a < 0 || b < 0 || c < 0) return initial + medial + final;
    return String.fromCharCode(0xac00 + (a * 21 + b) * 28 + c);
}
const exceptions: Record<string, string> = {
    bir: '비르', kitap: '키탑', satın: '사튼', almak: '알막',
    istiyorum: '이스티요룸', merhaba: '메르하바', teşekkür: '테셰퀴르',
    ederim: '에데림', nasılsın: '나슬슨', evet: '에벳', hayır: '하이르',
};
function convertWord(word: string): string {
    const lower = word.toLocaleLowerCase('tr-TR');
    if (exceptions[lower]) return exceptions[lower];
    const letters = [...lower].filter(ch => ch !== 'ğ');
    const result: string[] = [];
    let i = 0;
    while (i < letters.length) {
        const ch = letters[i];
        if (vowels[ch]) {
            result.push(compose('ㅇ', vowels[ch])); i++; continue;
        }
        if (!consonants[ch]) { result.push(ch); i++; continue; }
        const next = letters[i + 1];
        if (next && vowels[next]) {
            const medial = ch === 'y' ? yVowels[next] : vowels[next];
            result.push(compose(consonants[ch], medial)); i += 2; continue;
        }
        if (result.length && codas[ch]) {
            const last = result[result.length - 1];
            const code = last.codePointAt(0) ?? 0;
            if (code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 === 0) {
                const c = jongseong.indexOf(codas[ch]);
                if (c > 0) { result[result.length - 1] = String.fromCharCode(code + c); i++; continue; }
            }
        }
        result.push(compose(consonants[ch], 'ㅡ')); i++;
    }
    return result.join('');
}
export function turkishToHangul(text: string): string {
    return text.replace(/[A-Za-zÇĞİIÖŞÜçğıöşü]+/g, convertWord);
}
