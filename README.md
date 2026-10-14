# Xhamia e Madhe · Podujevë

Website në React + TypeScript + Vite, në shqip dhe anglisht. Faqja përdor ilustrime origjinale derisa të shtohen fotografitë reale të xhamisë.

Adresat kryesore janë `/` dhe `/orari` në shqip; për anglisht përdoren `/?lang=en` dhe `/prayer-times`. Adresat e mëparshme me `/sq` ose `/en` ridrejtohen automatikisht.

## Nisja lokale

```bash
npm install
npm run dev
```

Vite e shërben faqen dhe endpoint-in `/api/prayer-times` gjatë zhvillimit. Për kontrollin e versionit të prodhimit:

```bash
npm run build
npm test
npm run preview
```

## Orari nga BIK-u

Faqja nis me datën e sotme sipas zonës kohore të Kosovës. Te **Orari** mund të zgjidhet cilado datë e vitit 2026; faqja merr vetëm rreshtin e asaj dite nga [Takvimi zyrtar 2026 i BIK-ut](https://dituriaislame.com/wp-content/uploads/2026/01/takvimi2026vaktet.pdf). Kohët bazë shfaqen siç janë shtypur në Takvim, pa korrigjim minutash për qytetin.

Sipas rregullit të dhënë nga xhamia, **sabahu shfaqet 30 minuta pas imsakut**, ndërsa **ezani i sabahut 30 minuta para lindjes së diellit**. Xhumaja falet në orë fikse: **13:00 gjatë orës verore** dhe **12:00 gjatë orës dimërore** në Kosovë. Ikameti nuk shfaqet në faqe.

PDF-ja nuk përfshihet në aplikacionin e ndërtuar. Funksioni `server/bik.ts` e lexon nga burimi zyrtar, ndërsa `api/prayer-times.ts` jep një ditë të zgjedhur. Nëse burimi nuk është i arritshëm, faqja shfaq gjendje gabimi dhe lidhjen te Takvimi. Për vitin 2027 duhet vendosur botimi përkatës dhe përditësuar parseri/datat.

Publikimi kërkon një host që ekzekuton funksionin `/api/prayer-times`. Për **Netlify me repository Git**, `netlify.toml` vendos komandën `npm run build`, publikon `dist/`, ndërton funksionin në `netlify/functions/` dhe e lidh me `/api/prayer-times`. `vercel.json` mbetet për Vercel. Vetëm ngarkimi i skedarëve statikë të `dist/` nuk e përfshin funksionin. Pas deploy-it, hapni `https://<domeni>/api/prayer-times?date=2026-10-13` dhe kontrolloni që të kthehet JSON me `schedule`. Para publikimit publik, sqaroni me botuesin kushtet e ripërdorimit të të dhënave të Takvimit.

## Të dhënat e xhamisë

Në `src/config.ts` mund të plotësohen:

- `donationUrl`: kanali zyrtar i verifikuar i kontributeve;
- `mapUrl`: pika e saktë e xhamisë në hartë;
- `heroPhotoUrl` dhe `aboutPhotoUrl`: fotografitë reale të vendosura në `public/photos/`;
- `prayerTimes`: orare të miratuara nga xhamia, nëse ka përjashtime nga orari automatik.

Në `src/data.ts` shtohen aktivitetet dhe njoftimet me datë, orë, kontakt, titull e përshkrim në të dyja gjuhët. Tekstet e ndërfaqes janë në `src/content.ts`.

## Kontrolli para publikimit

Kontrolloni datat rreth ndërrimit të orës, faqen në telefon, të dyja gjuhët, fotot, hartën, lidhjet dhe përdorimin me tastierë. Synimi i aksesueshmërisë është WCAG 2.2 AA.
