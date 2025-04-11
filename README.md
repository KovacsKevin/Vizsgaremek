
# Sporthaver

A **Sporthaver** egy magyar nyelvű sportpartner-kereső webalkalmazás, amelyet Kovács Kevin és Lancz Csaba készített a Premontrei Szakgimnázium és Technikum záróprojektjeként. Az alkalmazás célja, hogy segítsen sportkedvelő embereknek egymásra találni közös sporttevékenységek céljából, legyen szó beltéri vagy kültéri elfoglaltságról.

## 📌 Projekt áttekintés

A projektet személyes érdeklődés és a közösségi élmény fontossága inspirálta. A célkitűzések:

- Felhasználók összekötése sportág és helyszín alapján.
- Időjárás-függő szűrés: kültéri vagy beltéri lehetőségek.
- Közösségépítés és társas kapcsolatok erősítése.
- Testreszabható profil és eseményszervezés lehetősége.

## 🧠 Használt technológiák

| Típus           | Eszközök / Keretrendszerek                             |
|----------------|---------------------------------------------------------|
| Kommunikáció    | Discord                                                 |
| Fejlesztőkörnyezet | Visual Studio                                        |
| Verziókezelés   | GitHub                                                  |
| Adatbázis       | MySQL, XAMPP (kezdetben), Docker, Beekeeper Studio, DataGrip |
| Backend         | Node.js, Express, Sequelize ORM, JWT, Jest             |
| Frontend        | React (Vite), Figma                                     |
| Dokumentáció    | Microsoft Word, PowerPoint                              |

## 🗃️ Adatbázis séma

Az adatbázis a következő fő táblákból áll:

- **users**: felhasználók adatai (név, elérhetőség, bio, profilkép, stb.)
- **sportoks**: sportágak neve, leírása, opcionális kép
- **helyszins**: sporthelyszínek adatai, felszereltsége
- **esemenies**: események, időpont, helyszín, sportág, stb.
- **resztvevős**: események résztvevői és szerepeik

## 🔗 Kapcsolatok

- Az események táblája minden más táblához kapcsolódik.
- Egy esemény egy helyszínen és egy sportággal zajlik.
- Egy felhasználó több eseményt is szervezhet vagy részt vehet rajtuk.
- A résztvevők státusza és szerepe (szervező / játékos) is nyomon követhető.

## 🔧 Backend – Node.js (MVC)

- **Model**: Sequelize ORM, validációk, táblák szinkronizálása.
- **Controller**: logikai műveletek, CRUD-függvények.
- **Routes**: API végpontok kezelése, JWT hitelesítés.
- **Auth**: Middleware a tokenek generálásához és ellenőrzéséhez.
- **Config**: adatbázis kapcsolat beállítása.
- **Test**: Jest tesztek az egyes controllerekhez.
- **Utils**: lejárt események automatikus törlése.
- **Upload**: képfeltöltések tárolása.

### Belépési fájlok:
- `app.js`: nagy méretű kérések kezelése, middleware-k beállítása.
- `server.js`: szerver elindítása, útvonalak betöltése, DB szinkron.

## 🎨 Frontend – React

- **Bejelentkezés / Regisztráció**: `login.jsx`, `register.jsx` mezőellenőrzésekkel, adatvédelmi linkekkel.
- **Főoldal**: `Header.jsx` (reszponzív menü, profilmodal), `HeroSection.jsx`, `Footer/`
- **Keresés**: `SearchForm.jsx` sport és/vagy település alapján.
- **Eseménykezelés**:
  - `event-modal.jsx`: új esemény létrehozása
  - `helyszin-modal.jsx`: új helyszín rögzítése
  - `PopularDestination.jsx`: legfrissebb események megjelenítése
  - `myEvent.jsx`: saját események listázása kategóriák szerint
  - `sport-event-details-modal.jsx`: esemény részletei, jogosultságfüggő műveletek
  - `sport-mate-finder.jsx`: keresés eredményeinek megjelenítése

## 👤 Felhasználói szerepkörök

- **Szervező**: meghívhat, elfogadhat jelentkezést, szerkeszthet, törölhet eseményt.
- **Játékos**: csatlakozhat, elfogadhat meghívást, kiléphet eseményből.

## Telepítés
CMD megnyitása
```bash
git clone https://github.com/KovacsKevin/Vizsgaremek
```

Mappába lépés
```bash
cd Vizsgaremek
```

Megnyitás Visual Studioban
```bash
code .
```

- Xampp megnyitása
- New Terminal
- Backend mappába lépés
```bash
cd backend
```

- Modulok telepítése
```bash
npm i
```

- Frontend mappába lépés
```bash
cd frontend
```

- Modulok telepítése
```bash
npm i
```

- XAMPP elindíása, belépés a phpMyAdminba, sportpartner_kereso adatbázis létrehozása, SQL menüpont megnyitása

```bash
CREATE DATABASE sportpartner_kereso
CHARACTER SET utf8
COLLATE utf8_hungarian_ci;
```

- Importálás menüpontra kattintás, fájl kiválasztása gomb

Az adatokat tartalmazó sql fájl innen tölthető le: [sportpartner_kereso_import_teljes.sql](https://github.com/KovacsKevin/Vizsgaremek)

## Az alábbi portokon futnak a szerverek: 
```bash
localhost:3000 Frontend
```
```bash
localhost:8081 Backend
```

## Fejlesztők

- **Fejlesztő**: [Kovács Kevin](https://github.com/KovacsKevin)
- **Fejlesztő**: [Lancz Csaba](https://github.com/lanczcsaba)

## Dokumentáció
A  dokumentáció itt tölthető le: [Dokumentáció](https://github.com/KovacsKevin/Vizsgaremek)



