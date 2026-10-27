export type WordDetails = {
 pos: string; definition: string; example: string; exampleKo: string; plural: string; accusative: string; source: string
}
type Form = {word?: string; tags?: string[]}
type Sense = {definition?: string; examples?: string[]; translations?: {language?: {code?: string}; word?: string}[]; subsenses?: Sense[]}
type Entry = {language?: {code?: string}; partOfSpeech?: string; forms?: Form[]; senses?: Sense[]}
export type DictionaryResponse = {entries?: Entry[]; source?: {url?: string}}
const parts: Record<string,string> = {noun:'명사 · isim',verb:'동사 · fiil',adjective:'형용사 · sıfat',adj:'형용사 · sıfat',adverb:'부사 · zarf',adv:'부사 · zarf',interjection:'감탄사 · ünlem',intj:'감탄사 · ünlem',pronoun:'대명사 · zamir'}
export const wordNotes: Record<string, Partial<WordDetails>> = {
 kitap:{pos:'명사 · isim',example:'Bu kitap çok güzel.',exampleKo:'이 책은 아주 좋아요.',plural:'kitaplar',accusative:'kitabı'},
 çay:{pos:'명사 · isim',example:'Bir çay, lütfen.',exampleKo:'차 한 잔 주세요.',plural:'çaylar',accusative:'çayı'},
 ev:{pos:'명사 · isim',example:'Bu ev çok güzel.',exampleKo:'이 집은 아주 예뻐요.',plural:'evler',accusative:'evi'},
 araba:{pos:'명사 · isim',example:'Bu araba yeni.',exampleKo:'이 자동차는 새것이에요.',plural:'arabalar',accusative:'arabayı'},
 su:{pos:'명사 · isim',example:'Bir bardak su, lütfen.',exampleKo:'물 한 잔 주세요.',plural:'sular',accusative:'suyu'},
 güneş:{pos:'명사 · isim',example:'Güneş doğuyor.',exampleKo:'해가 떠오르고 있어요.',plural:'güneşler',accusative:'güneşi'},
 merhaba:{pos:'감탄사 · ünlem',example:'Merhaba, nasılsınız?',exampleKo:'안녕하세요, 어떻게 지내세요?'},
}
function flatten(senses: Sense[], depth=0): Sense[] {
 if(depth>4)return []
 return senses.flatMap(s=>[s,...flatten(Array.isArray(s.subsenses)?s.subsenses:[],depth+1)])
}
export function parseDictionary(data: DictionaryResponse): WordDetails | null {
 const entries=Array.isArray(data.entries)?data.entries:[]
 const entry=entries.find(e=>e.language?.code==='tr'||e.language?.code==='tur')
 if(!entry)return null
 const senses=flatten(Array.isArray(entry.senses)?entry.senses:[])
 const forms=Array.isArray(entry.forms)?entry.forms:[]
 const findForm=(required: string[], forbidden: string[])=>forms.find(f=>typeof f.word==='string'&&Array.isArray(f.tags)&&required.every(t=>f.tags!.includes(t))&&!forbidden.some(t=>f.tags!.some(tag=>tag===t||tag.includes('person')||tag.includes('possess'))))?.word||''
 const korean=senses.flatMap(s=>s.translations||[]).find(t=>['ko','kor'].includes(t.language?.code||''))?.word
 let source=''
 try{const url=new URL(data.source?.url||'');if(url.protocol==='https:'&&(url.hostname==='wiktionary.org'||url.hostname.endsWith('.wiktionary.org')))source=url.href}catch{/* No external source URL supplied. */}
 return {pos:parts[entry.partOfSpeech||'']||entry.partOfSpeech||'품사 미제공',definition:korean||senses.find(s=>s.definition)?.definition||'',example:senses.flatMap(s=>s.examples||[]).find(e=>typeof e==='string'&&e.trim())||'',exampleKo:'',plural:findForm(['plural'],['accusative','genitive','dative','ablative','locative','possessive']),accusative:findForm(['accusative','singular'],['plural','possessive']),source}
}
