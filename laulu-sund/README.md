# TikTok Photo Mode: „Kuidas sinu lugu laulul saab“ (jõulud)

7 slaidi, 9:16 (1080×1920), tekst TikToki turvaalas. Allikas: `src/slides.html` (ühine stiil `tiktok-shared/lauluhing.css`), eksport repo juurest: `node tiktok-shared/export.js laulu-sund`. `safe-zone-check.png` näitab TikToki kasutajaliidese alasid sinisega, seda ei postitata.

| # | Slaid | Roll |
|---|-------|------|
| 1 | Sa saadad meile 3 mälestust. Me saadame tagasi laulu. | Hook + lubadus |
| 2 | Samm 1: räägid oma loo (näide: ema, jõulud, „Püha öö“ köögis) | Konkreetne näide |
| 3 | Samm 2: valid stiili | Kaasamine |
| 4 | Samm 3: mälestusest saab refrään | Maagiline hetk |
| 5 | Samm 4: 5 päeva / 24 h / 4 h, MP3 e-postiga | Praktiline info |
| 6 | Jõuluõhtu. Vajutad „play“. | Emotsionaalne tasu |
| 7 | Kellele sina laulu teeksid? + lauluhing.com | Üks CTA |

Slaidi 2 ja 4 sisu on illustreeriv näide, mitte päris kliendi lugu (märgitud „Näide“).

## Postituse tekst

> Jõulukink, mida poest osta ei saa 🎄 Sina räägid loo, meie teeme sellest laulu. Kellele sina selle teeksid? 👇
> #personaalnelaul #jõulukingitus

## Avaldamise seaded (WoopSocial, TikTok)

```json
{
  "postType": "PHOTO",
  "postMode": "DIRECT_POST",
  "privacyLevel": "PUBLIC_TO_EVERYONE",
  "allowComment": true,
  "autoAddMusic": true,
  "isYourBrand": true,
  "isBrandedContent": false,
  "photoCoverIndex": 0
}
```

Kui `privacyLevel` väärtust kontol pole, vali see, mida konto platform-inputs pakub. Avalda natiivse fotopostitusena (mitte MP4 slaidiesitusena) ja lisa TikTokis vaikne, soe jõulumuusika.
