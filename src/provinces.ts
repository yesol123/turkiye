export const regionColors: Record<string, string> = {
 '마르마라': '#b9bfdc', '에게해': '#c4cf9e', '지중해': '#e5bf8b', '중부아나톨리아': '#d7c4a3', '흑해': '#a3c8b5', '동부아나톨리아': '#c5b6d0', '남동아나톨리아': '#dbaaa0',
}
export type Province = { code: string; name: string; tr: string; region: string }
const rows = `
01|아다나|Adana|지중해
02|아드야만|Adıyaman|남동아나톨리아
03|아피온카라히사르|Afyonkarahisar|중부아나톨리아
04|아으르|Ağrı|동부아나톨리아
05|아마시아|Amasya|흑해
06|앙카라|Ankara|중부아나톨리아
07|안탈리아|Antalya|지중해
08|아르트빈|Artvin|동부아나톨리아
09|아이든|Aydın|에게해
10|발르케시르|Balıkesir|마르마라
11|빌레직|Bilecik|마르마라
12|빈괼|Bingöl|동부아나톨리아
13|비틀리스|Bitlis|동부아나톨리아
14|볼루|Bolu|흑해
15|부르두르|Burdur|지중해
16|부르사|Bursa|마르마라
17|차나칼레|Çanakkale|마르마라
18|찬크르|Çankırı|중부아나톨리아
19|초룸|Çorum|흑해
20|데니즐리|Denizli|에게해
21|디야르바크르|Diyarbakır|남동아나톨리아
22|에디르네|Edirne|마르마라
23|엘라즈|Elazığ|동부아나톨리아
24|에르진잔|Erzincan|동부아나톨리아
25|에르주룸|Erzurum|동부아나톨리아
26|에스키셰히르|Eskişehir|중부아나톨리아
27|가지안테프|Gaziantep|남동아나톨리아
28|기레순|Giresun|흑해
29|귀뮈쉬하네|Gümüşhane|흑해
30|하카리|Hakkâri|동부아나톨리아
31|하타이|Hatay|지중해
32|으스파르타|Isparta|지중해
33|메르신|Mersin|지중해
34|이스탄불|İstanbul|마르마라
35|이즈미르|İzmir|에게해
36|카르스|Kars|동부아나톨리아
37|카스타모누|Kastamonu|흑해
38|카이세리|Kayseri|중부아나톨리아
39|크르클라렐리|Kırklareli|마르마라
40|크르셰히르|Kırşehir|중부아나톨리아
41|코자엘리|Kocaeli|마르마라
42|콘야|Konya|중부아나톨리아
43|퀴타히아|Kütahya|에게해
44|말라티아|Malatya|동부아나톨리아
45|마니사|Manisa|에게해
46|카흐라만마라쉬|Kahramanmaraş|지중해
47|마르딘|Mardin|남동아나톨리아
48|무을라|Muğla|에게해
49|무쉬|Muş|동부아나톨리아
50|네브셰히르|Nevşehir|중부아나톨리아
51|니으데|Niğde|중부아나톨리아
52|오르두|Ordu|흑해
53|리제|Rize|흑해
54|사카리아|Sakarya|마르마라
55|삼순|Samsun|흑해
56|시르트|Siirt|남동아나톨리아
57|시놉|Sinop|흑해
58|시와스|Sivas|중부아나톨리아
59|테키르다|Tekirdağ|마르마라
60|토카트|Tokat|흑해
61|트라브존|Trabzon|흑해
62|툰젤리|Tunceli|동부아나톨리아
63|샨르우르파|Şanlıurfa|남동아나톨리아
64|우샤크|Uşak|에게해
65|반|Van|동부아나톨리아
66|요즈가트|Yozgat|중부아나톨리아
67|종굴다크|Zonguldak|흑해
68|악사라이|Aksaray|중부아나톨리아
69|바이부르트|Bayburt|흑해
70|카라만|Karaman|중부아나톨리아
71|크륵칼레|Kırıkkale|중부아나톨리아
72|바트만|Batman|남동아나톨리아
73|시으르낙|Şırnak|남동아나톨리아
74|바르튼|Bartın|흑해
75|아르다한|Ardahan|동부아나톨리아
76|으드르|Iğdır|동부아나톨리아
77|얄로바|Yalova|마르마라
78|카라뷔크|Karabük|흑해
79|킬리스|Kilis|남동아나톨리아
80|오스마니예|Osmaniye|지중해
81|뒤즈제|Düzce|흑해
`
export const provinces: Province[] = rows.trim().split('\n').map(row => { const [code, name, tr, region] = row.split('|'); return {code, name, tr, region} })
export const provinceByCode = Object.fromEntries(provinces.map(p => [p.code, p])) as Record<string, Province>
export const regionNotes: Record<string, string> = {
 '마르마라': '유럽과 아시아가 만나는 북서부 지역이에요. 마르마라해와 보스포루스 해협이 두 대륙의 경계를 이루어요.',
 '에게해': '서쪽 에게해 연안을 중심으로 펼쳐진 지방이에요. 해안 도시와 내륙의 산지, 고대 유적을 함께 만날 수 있어요.',
 '지중해': '남쪽 지중해 연안을 중심으로 펼쳐져요. 해안의 평야와 그 뒤로 이어지는 토로스산맥이 특징이에요.',
 '중부아나톨리아': '아나톨리아 내륙의 고원과 분지가 펼쳐진 지방이에요. 수도 앙카라와 카파도키아 지역이 이곳에 있어요.',
 '흑해': '튀르키예 북쪽 흑해 연안을 따라 이어져요. 바다와 나란히 뻗은 산맥, 초록빛 산지 풍경을 만날 수 있어요.',
 '동부아나톨리아': '동쪽 내륙에 위치하며 높은 산과 고원이 펼쳐져요. 반호와 아라라트산으로도 알려져 있어요.',
 '남동아나톨리아': '남동쪽에 위치한 지방이에요. 티그리스강과 유프라테스강 유역의 오랜 역사와 문화가 이어지는 곳이에요.',
}
