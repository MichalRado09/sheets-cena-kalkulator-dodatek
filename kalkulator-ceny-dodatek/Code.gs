const PIERWSZY_WIERSZ = 3;
const KOL = { I: 9, N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19, T: 20, V: 22, Y: 25 };

const WARIANT_STANDARD = 'standard';
const WARIANT_KURS_POZYCJA = 'kurs_pozycja';

const KONFIG_ARKUSZY = {
  'Technologiczna': WARIANT_STANDARD,
  'SanitarnaHVAC':  WARIANT_STANDARD,
  'Budowlana':      WARIANT_KURS_POZYCJA,
  'Elektryczna':    WARIANT_KURS_POZYCJA,
  'AKPiA':          WARIANT_KURS_POZYCJA
};
const ARKUSZE = Object.keys(KONFIG_ARKUSZY);

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Wycena')
    .addItem('Kalkulator ceny dla zaznaczonej komórki', 'otworzKalkulator')
    .addToUi();
}

function otworzKalkulator() {
  const range = SpreadsheetApp.getActiveRange();
  pokazDialog(range.getSheet(), range);
}

function naZmianeZaznaczenia(e) {
  const range = e.range;
  const sheet = range.getSheet();
  if (!ARKUSZE.includes(sheet.getName())) return;
  if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;
  if (range.getColumn() !== KOL.I || range.getRow() < PIERWSZY_WIERSZ) return;
  pokazDialog(sheet, range);
}

function pokazDialog(sheet, range) {
  if (!ARKUSZE.includes(sheet.getName()) || range.getColumn() !== KOL.I) {
    SpreadsheetApp.getUi().alert('Zaznacz najpierw komórkę w kolumnie I (Cena PLN/jedn.) na jednej z zakładek: ' + ARKUSZE.join(', '));
    return;
  }
  if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) {
    SpreadsheetApp.getUi().alert('Zaznacz dokładnie jedną komórkę w kolumnie I — teraz zaznaczonych jest więcej niż jedna.');
    return;
  }
  const row = range.getRow();
  if (row < PIERWSZY_WIERSZ) return;

  const nv = sheet.getRange(row, KOL.N, 1, KOL.V - KOL.N + 1).getValues()[0];
  let kurs = 1;
  try { kurs = SpreadsheetApp.getActive().getSheetByName('Okładka').getRange('B35').getValue() || 1; } catch (err) {}

  const dane = {
    sheetName: sheet.getName(), row: row,
    wariant: KONFIG_ARKUSZY[sheet.getName()],
    cena: sheet.getRange(row, KOL.I).getValue(),
    n: nv[0], o: nv[1], p: nv[2], q: nv[3], r: nv[4], s: nv[5], t: nv[6], v: nv[8],
    kurs: kurs
  };
  const tpl = HtmlService.createTemplateFromFile('Dialog');
  tpl.dane = dane;
  SpreadsheetApp.getUi().showModalDialog(
    tpl.evaluate().setWidth(460).setHeight(560),
    'Cena jednostkowa – wiersz ' + row
  );
}

function zapiszPole(sheet, row, kol, surowa, procent) {
  const tekst = (surowa === undefined || surowa === null) ? '' : String(surowa).trim();
  if (tekst === '') { sheet.getRange(row, kol).clearContent(); return; }
  const liczba = Number(tekst);
  sheet.getRange(row, kol).setValue(procent ? liczba / 100 : liczba);
}

function zapiszCene(sheetName, row, tryb, dane) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);

  if (tryb === 'szczegolowy') {
    const wariant = KONFIG_ARKUSZY[sheetName];
    if (!wariant) throw new Error('Nieznany wariant kolumn dla arkusza: ' + sheetName);
    const tProcent = (wariant === WARIANT_STANDARD);

    zapiszPole(sheet, row, KOL.N, dane.n, true);
    zapiszPole(sheet, row, KOL.O, dane.o, true);
    zapiszPole(sheet, row, KOL.P, dane.p, false);
    zapiszPole(sheet, row, KOL.Q, dane.q, false);
    zapiszPole(sheet, row, KOL.R, dane.r, false);
    zapiszPole(sheet, row, KOL.S, dane.s, false);
    zapiszPole(sheet, row, KOL.T, dane.t, tProcent);
    zapiszPole(sheet, row, KOL.V, dane.v, false);
    sheet.getRange(row, KOL.I).setFormula('=Y' + row);
    SpreadsheetApp.flush();
    return sheet.getRange(row, KOL.Y).getValue();
  }

  sheet.getRange(row, KOL.I).setValue(Number(dane));
  return Number(dane);
}
