# TikTok Photo Mode: „Eesti jõulubingo“

5 slaidi, 9:16 (1080×1920), tekst TikToki turvaalas. Allikas: `src/slides.html` (ühine stiil `tiktok-shared/lauluhing.css`), eksport repo juurest: `node tiktok-shared/export.js joulubingo`. `safe-zone-check.png` näitab TikToki kasutajaliidese alasid sinisega, seda ei postitata.

## Miks see on tehtud vaatamiste jaoks

Varasemad karussellid nägid välja nagu brändi reklaam: logo igal slaidil, toode juba kaanel. TikTok näitab iga postitust esmalt võõrastele ja need libistavad reklaami moodi asjast mööda. See postitus on üles ehitatud teisiti:

- **Ei näe välja nagu reklaam.** Slaididel 1–4 pole logo ega toodet. Tekst on TikToki enda fondis valgetel kastidel, nagu tavalisel looja postitusel.
- **Äratundmine ja sildistamine.** Iga ruut on midagi, mida iga Eesti pere tunneb. Inimesed märgivad kommentaarides oma pereliikmeid ja saadavad postitust edasi. Edasisaatmine on vaatamiste jaoks kõige tugevam signaal.
- **Salvestamine.** Bingokaart on asi, mida jõuluõhtul päriselt kasutada („salvesta jõuluõhtuks“).
- **Kommentaarid.** „Mitu ruutu said?“ on vastus ühe numbriga, nii et kommenteerimine ei nõua vaeva.
- **Lõpuni libistamine.** Slaid 3 jätab küsimuse lahtiseks („üks ruut on liiga raske… 👀“) ja vastus tuleb slaidil 4. Bränd tuleb alles viimasel slaidil vastusena sellele.

| # | Slaid | Roll |
|---|-------|------|
| 1 | Eesti jõulubingo + „kihla vean, et sinu pere saab vähemalt 8 ruutu“ + täidetud kaart | Hook |
| 2 | Puhas bingokaart, „salvesta jõuluõhtuks“ | Salvestamine |
| 3 | Mitu ruutu said? 0–5 / 6–10 / 11–15 / 16 | Kommentaarid + pinge |
| 4 | Kõige raskem ruut: keegi nutab kingi peale | Vastus |
| 5 | Selle ruudu saab ette ära teha: laul tema enda loost + lauluhing.com | Bränd + CTA |

## Postituse tekst

> Mitu ruutu sinu pere saab? 😂 Märgi see, kes jääb diivanil magama 👇
> #jõulud #eesti

## Kuidas postitada (sama oluline kui pilt)

1. **Heli lisa käsitsi TikToki äpis.** Vali praegu populaarne heli (TikTokis „Lisa heli“, rubriik „Trendid“), mitte automaatne muusika. Populaarne heli annab postitusele lisalevi.
2. **Postita õhtul**, kui eestlased on telefonis, näiteks kell 19–21. Täpse aja leiad TikToki analüütikast („Jälgijad“ → „Aktiivsus“).
3. **Esimene tund:** vasta kohe igale kommentaarile ja kinnita oma kommentaar „Mina sain 11 😅 mis teil tuli?“. Varased kommentaarid näitavad TikTokile, et postitus tekitab vestlust.
4. Ära kustuta postitust, kui algus on aeglane. Suurem osa levist tuleb esimese 10 päeva jooksul ja mõni postitus läheb käima alles hiljem.

## Avaldamise seaded (WoopSocial, TikTok)

Kui postitad WoopSocialiga, pane `autoAddMusic` väärtuseks `false` ja lisa populaarne heli hiljem äpis (või postita mustandina `MEDIA_UPLOAD` ja lisa heli enne avaldamist).

```json
{
  "postType": "PHOTO",
  "postMode": "MEDIA_UPLOAD",
  "privacyLevel": "PUBLIC_TO_EVERYONE",
  "allowComment": true,
  "autoAddMusic": false,
  "isYourBrand": true,
  "isBrandedContent": false,
  "photoCoverIndex": 0
}
```
