# Kalkulator ceny jednostkowej — dodatek do Google Sheets

Dodatek (Google Apps Script, container-bound) do arkusza kalkulacyjnego z wyceną, który pozwala uzupełniać cenę jednostkową w kolumnie zawierającej cenę bezpośrednio z poziomu okna dialogowego — bez ręcznego przechodzenia po komórkach z danymi kalkulacyjnymi.

## Co robi

Po zaznaczeniu komórki w kolumnie z ceną (na jednej ze skonfigurowanych zakładek) otwiera się okno dialogowe, w którym można:

- wpisać cenę jednostkową ręcznie, albo
- rozwinąć sekcję "Obliczenia szczegółowe" i uzupełnić pola kalkulacyjne (narzuty, robocizna, materiał, kurs walutowy, akcesoria itd.), z których cena jest wyliczana przez istniejące formuły arkusza.

Dodatek obsługuje dwa warianty logiki kalkulacyjnej (różne arkusze w skoroszycie mogą liczyć materiał w innej walucie / z innym sposobem przeliczania kursu) — wariant jest wybierany automatycznie na podstawie nazwy zakładki, zgodnie z konfiguracją w `KONFIG_ARKUSZY`.

Podgląd szacowanej ceny wyliczany jest na żywo po stronie klienta (bez zapisu), a zapis do arkusza odbywa się dopiero po kliknięciu „Zapisz”.

## Struktura

- `Code.gs` — logika serwerowa: obsługa menu, wykrywanie zaznaczenia, otwieranie dialogu, zapis danych do arkusza.
- `Dialog.html` — interfejs okna dialogowego (HTML/CSS/JS uruchamiane po stronie klienta w Google Sheets).

## Instalacja

1. Otwórz arkusz w Google Sheets.
2. Menu **Rozszerzenia → Apps Script**.
3. Wklej zawartość `Code.gs` do pliku skryptu (np. `Code.gs`).
4. Dodaj nowy plik HTML o nazwie `Dialog` i wklej do niego zawartość `Dialog.html`.
5. Zapisz projekt.
6. Odśwież arkusz — w menu pojawi się pozycja **Wycena → Kalkulator ceny dla zaznaczonej komórki**.

### Automatyczne otwieranie po zaznaczeniu komórki (opcjonalnie)

Domyślnie dialog otwiera się z menu (funkcja `otworzKalkulator`). Aby dialog otwierał się automatycznie po kliknięciu komórki w kolumnie z ceną, trzeba dodać zainstalowany trigger (nie jest to trigger prosty, więc `onSelectionChange` w kodzie sam się nie uruchomi):

1. W edytorze Apps Script: **Triggery** (ikona zegara) → **Dodaj trigger**.
2. Funkcja do uruchomienia: `naZmianeZaznaczenia`.
3. Źródło zdarzenia: **Z arkusza kalkulacyjnego**.
4. Typ zdarzenia: **Przy zmianie zaznaczenia**.
5. Zapisz.

## Konfiguracja pod własny arkusz

Na górze `Code.gs` znajdują się stałe do dostosowania:

- `PIERWSZY_WIERSZ` — pierwszy wiersz z danymi (nagłówki są wyżej).
- `KOL` — numery kolumn (1 = A, 2 = B, ...) dla poszczególnych pól kalkulacyjnych oraz kolumny z ceną.
- `KONFIG_ARKUSZY` — mapa: nazwa zakładki → wariant logiki kalkulacyjnej (`standard` lub `kurs_pozycja`). Lista obsługiwanych zakładek (`ARKUSZE`) jest wyliczana automatycznie z kluczy tej mapy.

Wzory (`W`, `U`, `X` itd. w podglądzie na żywo w `Dialog.html`, funkcja `przelicz()`) należy dopasować do rzeczywistych formuł w kolumnach docelowych — w tym repozytorium odzwierciedlają one formuły z konkretnego arkusza, na potrzeby którego dodatek powstał, więc przy innej strukturze kalkulacji wymagają dostosowania.

## Uwagi

- Zapis pustego pola w trybie szczegółowym czyści komórkę (a nie wpisuje `0`) — ma to znaczenie dla formuł korzystających z `ISBLANK()`.
- Pola procentowe (np. narzuty) są przeliczane między zapisem w arkuszu (0.12) a wyświetlaniem w dialogu (12).

## Licencja

Brak jawnej licencji — kod udostępniony do prywatnego/wewnętrznego użytku. Dodaj plik `LICENSE`, jeśli chcesz jasno określić zasady ponownego użycia (np. MIT).
