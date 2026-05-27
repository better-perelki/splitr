# Splitr

## Dokumentacja użytkowa

Splitr pozwala śledzić i rozliczać wspólne wydatki w grupach (np. wakacje, współlokatorzy, wyjścia ze znajomymi).

### Główne funkcje

- **Konto użytkownika** - rejestracja, logowanie, edycja profilu (avatar, dane).
- **Znajomi** - zapraszanie znajomych po e-mailu, akceptowanie/odrzucanie zaproszeń.
- **Grupy** - tworzenie grup, zapraszanie członków linkiem, zarządzanie składem.
- **Wydatki** - dodawanie wydatków z dowolnym podziałem (równo / kwoty / procenty), zdjęciami i kategorią.
- **Wiele walut** - wydatki w różnych walutach przeliczane po aktualnym kursie (kursy aktualizowane automatycznie).
- **Salda i rozliczenia** - automatyczne wyliczanie kto komu ile jest winien wraz z propozycją minimalnej liczby przelewów.
- **Portfel** - podsumowanie wszystkich należności i zobowiązań w głównej walucie.
- **Powiadomienia** - informacje o nowych wydatkach, zaproszeniach do grup i rozliczeniach.
- **Analityka** - wykresy wydatków per kategoria / osoba / przedział czasowy.

### Jak zacząć korzystać

1. Załóż konto na `http://localhost:5173/signup`.
2. Dodaj znajomych z poziomu zakładki **Friends**.
3. Utwórz grupę w zakładce **Groups** i zaproś członków.
4. Dodawaj wydatki przyciskiem **Add expense** - wybierz kto zapłacił i jak podzielić koszt.
5. W zakładce **Balances** zobaczysz aktualne salda i sugerowane przelewy do rozliczenia grupy.

Dokumentacja API (Swagger UI): `http://localhost:8080/swagger-ui.html`.

## Dokumentacja instalacyjno-konfiguracyjna

### Wymagania

- **Docker** + **Docker Compose** - wystarczą do uruchomienia całości jedną komendą.
- (Opcjonalnie, do pracy bez Dockera) **Node.js** 20+ oraz **Java** 21+.

### Szybki start (Docker)

W katalogu głównym repozytorium:

```bash
docker compose up --build
```

Komenda uruchamia **Postgres**, **backend** i **frontend**. Po starcie aplikacja jest dostępna pod `http://localhost:5173`.

Uruchomienie w tle:

```bash
docker compose up --build -d
```

Zatrzymanie:

```bash
docker compose down
```

### Uruchomienie lokalne (bez Dockera)

Dla szybszej iteracji w czasie developmentu:

```bash
# 1. Baza danych
docker compose up postgres -d

# 2. Backend
cd backend && ./gradlew bootRun

# 3. (opcjonalnie) regeneracja klienta API po zmianach w backendzie
cd scripts && ./generate-api.sh

# 4. Frontend
cd frontend && npm install && npm run dev
```

### Porty

| Usługa   | Port | 
|----------|------|
| Frontend | 5173 |
| Backend  | 8080 | 
| Postgres | 5432 |

### Zmienne środowiskowe

**Backend**

| Zmienna | Opis | Domyślnie |
|---------|------|-----------|
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/splitr` |
| `SPRING_DATASOURCE_USERNAME` | Użytkownik bazy | `splitr` |
| `SPRING_DATASOURCE_PASSWORD` | Hasło bazy | `splitr` |
| `JWT_SECRET` | Klucz HMAC-SHA256 (min. 256 bit) | klucz developerski z `application.yml` |
| `UPLOAD_DIR` | Katalog na pliki (avatary) | `./uploads` |

W produkcji `JWT_SECRET` **musi** zostać nadpisany własną, silną wartością. Access token wygasa po 15 minutach, refresh token po 7 dniach (konfigurowalne przez `app.jwt.access-token-expiration` / `app.jwt.refresh-token-expiration`).

**Frontend**

| Zmienna | Opis | Domyślnie |
|---------|------|-----------|
| `VITE_API_BASE_URL` | URL backendu (plik `.env`) | `http://localhost:8080` |


