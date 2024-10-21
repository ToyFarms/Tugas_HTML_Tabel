document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => check_bg_intersection(), 100);
  const params = new URLSearchParams(window.location.search);

  const max_people = params.has("max_people")
    ? parseInt(params.get("max_people"))
    : 20;
  let i = 0;

  document.getElementsByClassName("people-count")[0].value = max_people;

  shuffle(data);
  data.forEach((person) => {
    if (i >= max_people) return;

    let [name, _class, address, score] = person.split(";");
    if (score === "$auto") {
      score = randint(0, 100);
    }

    if (address === "$auto") {
      address = cities[randint(0, cities.length - 1)];
    }

    create_row({ name: name, class: _class, address: address, score: score });

    i++;
  });

  const meter_observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate_meter(entry.target, entry.target.dataset.percent);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "100%" },
  );

  for (const meter of document.getElementsByClassName("meter-container")) {
    meter_observer.observe(meter);
  }

  const row_observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("entering");
        observer.unobserve(entry.target);
      }
    });
  });

  for (const row of document.getElementsByTagName("tr")) {
    row_observer.observe(row);
  }

  const texts = document.getElementsByClassName("text-scramble");
  for (const text of texts) {
    animate_text_scramble(text);
  }

  const form = document.getElementById("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = document.getElementsByClassName("people-count")[0].value;

    const params = new URLSearchParams(window.location.search);
    params.set("max_people", value);
    window.location.search = params;
  });
});

const check_bg_intersection = () => {
  const text = document.getElementsByClassName("heading-text")[0];
  const blobs = document.getElementsByClassName("blob-background");
  const text_rect = text.getBoundingClientRect();

  const form = document.getElementById("form");
  const form_rect = form.getBoundingClientRect();

  if (text_rect.bottom >= form_rect.top) {
    text.classList.add("heading-text-bg");
    for (const blob of blobs) {
      blob.classList.add("blob-blur");
    }
  } else {
    text.classList.remove("heading-text-bg");
    for (const blob of blobs) {
      blob.classList.remove("blob-blur");
    }
  }
};

window.addEventListener("scroll", () => {
  check_bg_intersection();
});

document.addEventListener("keypress", (e) => {
  if (e.key === "/") {
    e.preventDefault();
    document.getElementsByClassName("people-count")[0].focus();
  }
});

const animate_text_scramble = (text) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
  const str = text.dataset.text;
  let iter = 0;

  const interval = setInterval(() => {
    const get_char = (index) => {
      if (index < iter) return str[index];
      return chars[randint(0, chars.length)];
    };

    text.innerText = Array(str.length)
      .fill()
      .map((_, i) => get_char(i))
      .join("");

    if (iter >= str.length) clearInterval(interval);

    iter += 1;
  }, 40);
};

const animate_meter = (meter, target_percent) => {
  const initial_width = parseFloat(meter.style.width) || 0;
  const meter_head = meter.querySelector(".meter-head");
  const meter_indicator = meter.querySelector(".meter-indicator");

  meter_head.animate(
    [{ width: initial_width + "%" }, { width: target_percent + "%" }],
    {
      duration: 2000,
      easing: "cubic-bezier(.95,.24,.1,.98)",
      fill: "forwards",
    },
  );

  const update_indicator = () => {
    const parent_width = parseFloat(
      getComputedStyle(meter_head.parentElement).width,
    );
    const width = parseFloat(getComputedStyle(meter_head).width);
    const norm = width / parent_width;
    const percent = Math.ceil(norm * 100);
    meter_indicator.textContent = `${percent.toString().padStart(3, ".")}% `;
    meter_head.style.setProperty(
      "background-color",
      `rgb(${255 - norm * 255}, ${norm * 255}, 0)`,
    );

    if (Math.abs(percent - target_percent) < 0.001) return;

    requestAnimationFrame(update_indicator);
  };

  requestAnimationFrame(update_indicator);

  meter_head.style.width = target_percent + "%";
};

const $ = (tagname, classlist = [], childs = []) => {
  const e = document.createElement(tagname);
  classlist.forEach((_class) => {
    e.classList.add(_class);
  });

  childs.forEach((child) => {
    e.appendChild(child);
  });

  return e;
};

const $s = (tagname, classlist = [], attrs = {}, childs = []) => {
  const e = document.createElement(tagname);
  classlist.forEach((_class) => {
    e.classList.add(_class);
  });

  childs.forEach((child) => {
    e.appendChild(child);
  });

  for (const [key, value] of Object.entries(attrs)) {
    e.style[key] = value;
  }

  return e;
};

const create_meter = () => {
  return $(
    "div",
    ["meter-container"],
    [
      $("p", ["meter-indicator"]),
      $("div", ["meter-head-container"], [$("div", ["meter-head"])]),
    ],
  );
};

const randint = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function shuffle(array) {
  let idx = array.length;

  while (idx != 0) {
    let rand_idx = Math.floor(Math.random() * idx);
    idx--;
    [array[idx], array[rand_idx]] = [array[rand_idx], array[idx]];
  }
}

function hsl2rgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return { r, g, b };
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function best_text_color(a, b, c, type = "hsl") {
  let rgb = {};
  if (type === "hsl") {
    rgb = hsl2rgb(a, b, c);
  } else {
    rgb = { a, b, c };
  }

  const lum = luminance(rgb.r, rgb.g, rgb.b);
  const white_contrast = (1 + 0.05) / (lum + 0.05);
  const black_contrast = (lum + 0.05) / 0.05;

  return white_contrast > black_contrast ? "white" : "black";
}

let degree = 0;

const create_cell = (row, node) => {
  const cell = row.insertCell();
  const hsl = [degree, 50, 50];

  cell.appendChild(
    $s(
      "div",
      ["table-def"],
      {
        backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
      },
      [node],
    ),
  );
  cell.style.setProperty(
    "--tbl-text-clr",
    best_text_color(hsl[0], hsl[1], hsl[2]),
  );

  degree = (degree + 5) % 360;
};

const create_row = (rowdef) => {
  const table = document.getElementsByClassName("main-table")[0];

  const row = table.insertRow();

  create_cell(row, document.createTextNode(rowdef["name"]));
  create_cell(row, document.createTextNode(rowdef["class"]));
  create_cell(row, document.createTextNode(rowdef["address"]));

  const meter = create_meter();
  meter.dataset.percent = rowdef["score"];

  create_cell(row, meter);
};

// format: semicolon separated value; name, class, address, score; $auto for random value.
const data = [
  "ABDILLAH BUKHORIE IRAWAN;X TKRO 2;$auto;$auto",
  "ABDUL MUMIN;X TKJ 2;$auto;$auto",
  "ADANDI KURNIAWAN;X TKJ 1;$auto;$auto",
  "ADE MUSA;X TKRO 4;$auto;$auto",
  "ADI TOFIK FIRMANSYAH;X TKRO 3;$auto;$auto",
  "ADIE YAKSA Q NASTIAR;X TKJ 2;$auto;$auto",
  "ADIT;X TKRO 1;$auto;$auto",
  "ADIT RIZAL ADRIANSYAH;X TKRO 4;$auto;$auto",
  "ADITYA ALFIANSYAH;X TKRO 2;$auto;$auto",
  "ADLI ALFATAHU BERKAH;X TKJ 3;$auto;$auto",
  "ADLY RIDWAN ANNAFI;X TKJ 1;$auto;$auto",
  "ADRIAN WAHYU MARDIANSYAH;X TKRO 3;$auto;$auto",
  "AGISA MOH. HAEDAR AL HARISI;X TKRO 1;$auto;$auto",
  "AGNEES KHALIFYA AGUSTIN;X TKJ 7;$auto;$auto",
  "AGUNG WAHYUDIN;X TKRO 1;$auto;$auto",
  "AGUNG CAHYANA;X TKRO 2;$auto;$auto",
  "AHMAD GIAN NUR SAMUDRA;X TKJ 1;$auto;$auto",
  "AHMAD HADIANA;X TKRO 1;$auto;$auto",
  "AHMAD ISMAIL SAPUTRA;X TKJ 5;$auto;$auto",
  "AHMAD JAENAL;X TKRO 2;$auto;$auto",
  "AHMAD KHOERUL AZWAR;X TKJ 3;$auto;$auto",
  "AHMAD NURDIN;X TKRO 5;$auto;$auto",
  "AHMAD TIJANI;X TKJ 2;$auto;$auto",
  "AJI ALFI FAUZAN;X TKRO 1;$auto;$auto",
  "AKBAR ADITYA;X TKJ 2;$auto;$auto",
  "AKBAR MAULANA;X TKJ 3;$auto;$auto",
  "AKHMAD HADADI ALFATAH;X TKRO 4;$auto;$auto",
  "AL ARDIANSYAH;X TKJ 4;$auto;$auto",
  "ALAM KUSUMAH;X TKJ 3;$auto;$auto",
  "ALBAR ADNAN GUNAWAN;X TKJ 2;$auto;$auto",
  "ALDY RIFALDY;X TKRO 2;$auto;$auto",
  "ALIANSYAH JOHARUDIN;X TKRO 2;$auto;$auto",
  "ALINDA RAHMA FAUZIAH;X TKJ 5;$auto;$auto",
  "ALISA DESPITASARI;X TKJ 4;$auto;$auto",
  "ALLDO ASEP BAHARUDIN;X TKRO 1;$auto;$auto",
  "ALYSA FEBRIANTI;X TKJ 2;$auto;$auto",
  "AMELIA;X TKJ 1;$auto;$auto",
  "AMELIA AGUSTINA;X TKJ 6;$auto;$auto",
  "AMELIA SITI FAUZIA;X TKJ 4;$auto;$auto",
  "ANDARI SUKAY;X TKJ 5;$auto;$auto",
  "ANDI SOMANTRI;X TKJ 2;$auto;$auto",
  "ANDY PRAYOGA GUSTIAWAN;X TKRO 4;$auto;$auto",
  "ANGGI NURHAYATI;X TKJ 7;$auto;$auto",
  "ANGGI RIANI;X TKJ 3;$auto;$auto",
  "ANGGUN MAHARANI HARTONO;X TKJ 7;$auto;$auto",
  "ANISA APRILIYANI;X TKJ 3;$auto;$auto",
  "ANISA LESTARI;X TKJ 5;$auto;$auto",
  "ANITA SETIA PRACEKA;X TKJ 5;$auto;$auto",
  "ANNISA DESIANTI;X TKJ 2;$auto;$auto",
  "ANNISA DWI SAFITRI;X TKJ 6;$auto;$auto",
  "ANRIAN NUGRAHA;X TKRO 2;$auto;$auto",
  "APRILYA FAUZIAH AZZAHRA;X TKJ 6;$auto;$auto",
  "ARI SOPYAN;X TKRO 5;$auto;$auto",
  "ASEP MIFTAH ILYAS;X TKJ 2;$auto;$auto",
  "ASILA APRILIA;X TKJ 3;$auto;$auto",
  "ASYIFA NUR APRILLIA;X TKJ 4;$auto;$auto",
  "AURORA MAELAN PUTRI;X TKJ 7;$auto;$auto",
  "AWALLUDIN NURUL FAIZ;X TKJ 3;$auto;$auto",
  "AYUB SAJIDIN;X TKRO 1;$auto;$auto",
  "AZKA ABDUL ROZAK;X TKJ 4;$auto;$auto",
  "AZRIEL OKTAV FACHRIADY;X TKJ 1;$auto;$auto",
  "AZRIL MUHAMAD FAHRI;X TKJ 3;$auto;$auto",
  "BAGJA FAUZAN KAMIL;X TKRO 3;$auto;$auto",
  "BAYU SETIA NUGRAHA;X TKJ 1;$auto;$auto",
  "BILQIS NURLIYANI;X TKJ 4;$auto;$auto",
  "BUKIT BINTANG PAMUNGKAS;X TKJ 1;$auto;$auto",
  "BUNGA PUSPITA SARI;X TKJ 1;$auto;$auto",
  "CAHYADI SOMANTRI;X TKJ 4;$auto;$auto",
  "CANDRA HIDAYAT;X TKJ 3;$auto;$auto",
  "CANDRA MUHAMAD RIZQY;X TKJ 1;$auto;$auto",
  "CEPI FAJAR PADILAH;X TKRO 2;$auto;$auto",
  "CEPI KURNIAWAN;X TKRO 5;$auto;$auto",
  "CINDI;X TKJ 5;$auto;$auto",
  "DADANG SULAEMAN;X TKJ 4;$auto;$auto",
  "DAFFA FADILAH AKBAR;X TKJ 4;$auto;$auto",
  "DAFFA MAULANA ULHAQ3211;X TKRO 1;$auto;$auto",
  "DANAR RIDHO JUANGGA;X TKJ 6;$auto;$auto",
  "DANIEL RULLY RIZKY RAMADHAN;X TKRO 2;$auto;$auto",
  "DECO AL SIDDIQ;X TKRO 1;$auto;$auto",
  "DEDE JUADI;X TKRO 2;$auto;$auto",
  "DEDE SAMBAS NUGRAHA;X TKRO 5;$auto;$auto",
  "DEDEN MUHAMAD FAJAR;X TKJ 3;$auto;$auto",
  "DEFHAN REZKY PURNAMA;X TKJ 1;$auto;$auto",
  "DELA NISSA SUCI YANTI;X TKJ 4;$auto;$auto",
  "DELSA MUHAMAD ALIFIA;X TKJ 5;$auto;$auto",
  "DENIS;X TKRO 4;$auto;$auto",
  "DENNIS OSKAR FREITAS;X TKRO 4;$auto;$auto",
  "DEVA MUHAMAD FAZRI;X TKRO 5;$auto;$auto",
  "DEVAN LUTVIANSYAH RAMADHAN;X TKJ 6;$auto;$auto",
  "DHEVA ANGELIA PUTRI;X TKJ 7;$auto;$auto",
  "DIAN MUHAMAD ILHAM;X TKRO 2;$auto;$auto",
  "DIANDRA SHAFAR RAHMAN;X TKJ 5;$auto;$auto",
  "DIKA ADYTIA KUSNADI;X TKRO 3;$auto;$auto",
  "DIKI MAULANA;X TKRO 1;$auto;$auto",
  "DIKI SAEFULOH;X TKRO 1;$auto;$auto",
  "DIKI SAPUTRA;X TKRO 4;$auto;$auto",
  "DIMAS BUDIMAN;X TKRO 2;$auto;$auto",
  "DIMAS RAHMANSYAH;X TKJ 2;$auto;$auto",
  "DIMAS TANTAN MUSTOFA;X TKRO 2;$auto;$auto",
  "DINDA SAELANI PUTRI;X TKJ 3;$auto;$auto",
  "DZIKRI SOBIRIN;X TKRO 2;$auto;$auto",
  "DZULQARNAIN ALFARO;X TKJ 2;$auto;$auto",
  "EKA GUSTIAWAN;X TKJ 1;$auto;$auto",
  "EKI PIRMANSYAH;X TKJ 7;$auto;$auto",
  "EKI RETNO ANJANI;X TKJ 7;$auto;$auto",
  "ELFASYA RAMADHAN ARRIZKY;X TKJ 3;$auto;$auto",
  "ELSA NOVIANTI;X TKJ 6;$auto;$auto",
  "ELSA NURMALA;X TKJ 5;$auto;$auto",
  "ERIK ALIANSYAH NUGRAHA;X TKRO 4;$auto;$auto",
  "EROL IKBAL MAULANA;X TKRO 1;$auto;$auto",
  "FADHIL NUR ROBBANI;X TKRO 5;$auto;$auto",
  "FADLLAN NURU ADI;X TKJ 5;$auto;$auto",
  "FADLY FADLILLAH;X TKJ 3;$auto;$auto",
  "FADLY PERMANA;X TKRO 3;$auto;$auto",
  "FAHMI;X TKRO 1;$auto;$auto",
  "FAHMI ABDURRAFI;X TKJ 7;$auto;$auto",
  "FAHMI ARIA MAULANA;X TKJ 6;$auto;$auto",
  "FAHRI ANDHIKA PUTRA RIZVI;X TKRO 1;$auto;$auto",
  "FAHRI ASHAR PADILAH;X TKJ 5;$auto;$auto",
  "FAHRI MUHAMMAD RAIHAN;X TKRO 1;$auto;$auto",
  "FAHRI SAEPULMILAH;X TKJ 4;$auto;$auto",
  "FAHRIZAL ANUGRAH SUHERMAN;X TKRO 4;$auto;$auto",
  "FAIZAL PUTRA ROBIYAN;X TKJ 2;$auto;$auto",
  "FAJAR KHOIRIL PADILAH;X TKRO 3;$auto;$auto",
  "FAJAR SUPRIATNA;X TKRO 2;$auto;$auto",
  "FALLAH JUNAEDI;X TKJ 1;$auto;$auto",
  "FAREL BUDI KUSUMA;X TKJ 5;$auto;$auto",
  "FAREL PRATAMA;X TKRO 3;$auto;$auto",
  "FARHAN AWALUDIN JAMIL;X TKJ 4;$auto;$auto",
  "FARHANI APRILIYAWATI;X TKJ 4;$auto;$auto",
  "FARIZ HIDAYAT TUROHMAN;X TKRO 1;$auto;$auto",
  "FAUZAN AZIMA;X TKRO 1;$auto;$auto",
  "FAUZAN AZMI RAJABI;X TKJ 3;$auto;$auto",
  "FAUZI MUHAMMAD RAMADHANI;X TKRO 4;$auto;$auto",
  "FAUZI ROCHMAN;X TKRO 5;$auto;$auto",
  "FEYRUZ LULU ZAHIRA;X TKJ 7;$auto;$auto",
  "FIRMAN MAULANA;X TKRO 4;$auto;$auto",
  "FIRMAN SYAH MURSALIM;X TKRO 1;$auto;$auto",
  "FIRMANSYAH;X TKJ 1;$auto;$auto",
  "FITRI KHAIRUNNISA;X TKJ 4;$auto;$auto",
  "FUTRI TINTIN SUHARTINI;X TKJ 4;$auto;$auto",
  "GAGAN NUGRAHA;X TKJ 6;$auto;$auto",
  "GALANG RAMADHA MECCA PRATAMA;X TKJ 3;$auto;$auto",
  "GHINA KHOIRUN NISA;X TKJ 3;$auto;$auto",
  "GIAS MUHAMAD FADIL;X TKRO 5;$auto;$auto",
  "GILANG PERMANA SIDIK;X TKJ 6;$auto;$auto",
  "GIOVANI SAPUTRA;X TKJ 7;$auto;$auto",
  "GISCHA YUNITA PRATIWI;X TKJ 3;$auto;$auto",
  "GUNAWAN SUDRAJAT;X TKJ 7;$auto;$auto",
  "GUSTIAWAN FIRMANSYAH;X TKRO 2;$auto;$auto",
  "HAFSHAH FADILAH;X TKJ 5;$auto;$auto",
  "HAIFA FATIMATU ZAHRA;X TKJ 4;$auto;$auto",
  "HANDIKA;X TKJ 5;$auto;$auto",
  "HERDI SATRIA PUTRA;X TKRO 2;$auto;$auto",
  "HERU SETIADI;X TKRO 3;$auto;$auto",
  "HIKMAL FAUZAN;X TKJ 7;$auto;$auto",
  "HILAL AZKA FIRMANSYAH;X TKJ 7;$auto;$auto",
  "IKBAL AZIZ;X TKRO 4;$auto;$auto",
  "IKHSAN;X TKRO 3;$auto;$auto",
  "IKMAL MAULANA;X TKRO 1;$auto;$auto",
  "ILHAM RAMADAN;X TKRO 5;$auto;$auto",
  "ILMA ALIA RAHMANIA;X TKJ 7;$auto;$auto",
  "ILYAS RAMADHAN HAKIM;X TKJ 4;$auto;$auto",
  "INAYAH SHOLEHAH MARWAH;X TKJ 4;$auto;$auto",
  "INDRIYANTI ALZENA SOLEHAH;X TKJ 1;$auto;$auto",
  "INDRY SUMIATY;X TKJ 1;$auto;$auto",
  "INTAN FITRI CAHYANI;X TKJ 3;$auto;$auto",
  "INTAN NUR FADILLAH;X TKJ 5;$auto;$auto",
  "IQBAL FARIZ FIRDAUS;X TKJ 1;$auto;$auto",
  "IQBAL REZA SAPUTRA;X TKJ 5;$auto;$auto",
  "IQSAN ALDILA FAUZI AKBAR;X TKRO 5;$auto;$auto",
  "IRAWAN HAERUL ZAMA;X TKRO 3;$auto;$auto",
  "IRPAN YONTANI;X TKJ 7;$auto;$auto",
  "IWAN ALWAHAB;X TKRO 3;$auto;$auto",
  "JELENA AFRILA PUTRI;X TKJ 2;$auto;$auto",
  "JIHAN NOPIANTI;X TKJ 6;$auto;$auto",
  "KARAYA FITRA DARMAWAN;X TKRO 4;$auto;$auto",
  "KARTIKA DEWI KURNIASIH;X TKJ 6;$auto;$auto",
  "KHANZA RUBIYANI;X TKJ 2;$auto;$auto",
  "KHARYSHA RYANTI PUTRI TAOFIK;X TKJ 5;$auto;$auto",
  "KHOERUL FAJAR;X TKJ 4;$auto;$auto",
  "KIKI MAULANA;X TKRO 4;$auto;$auto",
  "KIKI RAMDAN;X TKRO 4;$auto;$auto",
  "KIKI SOPIAN;X TKJ 4;$auto;$auto",
  "KLISAN LAZUARDI F.R;X TKJ 4;$auto;$auto",
  "KRISNA MUHAMAD FAUZAN;X TKRO 1;$auto;$auto",
  "KURNIA;X TKRO 4;$auto;$auto",
  "KURNIA PURNAMA OKTAVIANDY;X TKRO 3;$auto;$auto",
  "LALAN MAULANA;X TKRO 2;$auto;$auto",
  "LINGGA GUSTIANSYAH;X TKRO 4;$auto;$auto",
  "LION ALFONSUS SAGALA;X TKRO 3;$auto;$auto",
  "LISNA NUR SHIPA;X TKJ 7;$auto;$auto",
  "LUCKY SANJAYA;X TKJ 6;$auto;$auto",
  "LUTFI BARA NURAMJAD;X TKRO 1;$auto;$auto",
  "M KHOIRUL ANWAR;X TKJ 6;$auto;$auto",
  "M. GILANG ARROFI;X TKJ 4;$auto;$auto",
  "M. SADAD ROFIUDIN;X TKRO 2;$auto;$auto",
  "M. YUSUF ANSORI;X TKRO 3;$auto;$auto",
  "MARSEL FIRMANSYAH;X TKJ 2;$auto;$auto",
  "MARWAN FATUROHMAN;X TKJ 2;$auto;$auto",
  "MAUI LOHO PUTRI;X TKJ 6;$auto;$auto",
  "MEISYA TIRTHALIA PUTRI;X TKJ 7;$auto;$auto",
  "MELAN AULYA CAHAYA;X TKJ 4;$auto;$auto",
  "MEYLANI PUTRI RAHMAN;X TKJ 6;$auto;$auto",
  "MHD.NABIL ALMUFIID;X TKJ 4;$auto;$auto",
  "MIFTAH FAUJAN;X TKJ 3;$auto;$auto",
  "MIKA DELITA SIGIRO;X TKJ 7;$auto;$auto",
  "MILA SA'ADAH;X TKJ 4;$auto;$auto",
  "MINDA AULIYA JULPA;X TKJ 1;$auto;$auto",
  "MOCHAMAD RIZKY AKBAR;X TKJ 4;$auto;$auto",
  "MOCHAMAD RIZKY NUGRAHA;X TKJ 3;$auto;$auto",
  "MOHAMAD ROFI NUR FAISAL;X TKJ 2;$auto;$auto",
  "MUHAMAD ADAM ARJUNA;X TKJ 1;$auto;$auto",
  "MUHAMAD AGUNG FAUZAN;X TKRO 2;$auto;$auto",
  "MUHAMAD FAJAR;X TKRO 1;$auto;$auto",
  "MUHAMAD FAREL JULIAN;X TKJ 4;$auto;$auto",
  "MUHAMAD FIRMANSYAH;X TKRO 3;$auto;$auto",
  "MUHAMAD GALIH ARASYID;X TKJ 2;$auto;$auto",
  "MUHAMAD GHIFACHRI AL FAHGI;X TKJ 1;$auto;$auto",
  "MUHAMAD HAMZAH;X TKJ 2;$auto;$auto",
  "MUHAMAD JANUAR;X TKRO 4;$auto;$auto",
  "MUHAMAD LATIF ROSIDIN;X TKJ 6;$auto;$auto",
  "MUHAMAD NUGRAHA;X TKJ 1;$auto;$auto",
  "MUHAMAD PAISAL;X TKRO 1;$auto;$auto",
  "MUHAMAD RASYID PADILAH;X TKRO 1;$auto;$auto",
  "MUHAMAD REZA;X TKRO 5;$auto;$auto",
  "MUHAMDAD IRVANSYAH;X TKRO 2;$auto;$auto",
  "MUHAMMAD ABDUL JABBAR;X TKRO 4;$auto;$auto",
  "MUHAMMAD ALVIN YOGA PRATAMA;X TKRO 5;$auto;$auto",
  "MUHAMMAD ANDIKA HABIBURAHMAN;X TKJ 5;$auto;$auto",
  "MUHAMMAD AZHRIL KEYKO POERNAMA;X TKJ 7;$auto;$auto",
  "MUHAMMAD BAWAZIR;X TKJ 5;$auto;$auto",
  "MUHAMMAD FADHIL ATTIRMIDZI;X TKRO 3;$auto;$auto",
  "MUHAMMAD FAIQ AZKA PERMANA;X TKJ 2;$auto;$auto",
  "MUHAMMAD FAQIH IDZHARUL HAQ;X TKJ 6;$auto;$auto",
  "MUHAMMAD FARHAN MAULANA;X TKJ 6;$auto;$auto",
  "MUHAMMAD FARID RIDWAN;X TKRO 3;$auto;$auto",
  "MUHAMMAD FARLAN MAULIDIN;X TKJ 4;$auto;$auto",
  "MUHAMMAD IPAN MAULANA;X TKRO 5;$auto;$auto",
  "MUHAMMAD PAIK WILDAN;X TKRO 1;$auto;$auto",
  "MUHAMMAD RAFA ALFARESI;X TKJ 5;$auto;$auto",
  "MUHAMMAD RAIHAN AL ZUFIKAR;X TKRO 3;$auto;$auto",
  "MUHAMMAD RAMDAN;X TKRO 4;$auto;$auto",
  "MUHAMMAD RAMZI ERIAWAN;X TKRO 3;$auto;$auto",
  "MUHAMMAD RIFA ANUGRAH;X TKRO 3;$auto;$auto",
  "MUHAMMAD SYAHRUL FAUZI;X TKRO 2;$auto;$auto",
  "MUHAMMAD THUFAIL HAWARIYYIL;X TKJ 5;$auto;$auto",
  "MUHAMMAD WHILDAN PARDIAN;X TKRO 3;$auto;$auto",
  "MUSTOPA JAELANI;X TKJ 4;$auto;$auto",
  "MUTIARA SINTA;X TKJ 5;$auto;$auto",
  "NABILA BILQIST SALSABILA;X TKJ 7;$auto;$auto",
  "NABILLA BALQIST SALSABILA;X TKJ 1;$auto;$auto",
  "NADIA PITASARI;X TKJ 4;$auto;$auto",
  "NANDIKA;X TKJ 6;$auto;$auto",
  "NANDIKA DWI APRELA;X TKRO 2;$auto;$auto",
  "NAYLA MALIKA AZZAHRA;X TKJ 2;$auto;$auto",
  "NAZAL RAVAEL NURRIZKI;X TKRO 5;$auto;$auto",
  "NAZRIL WILYANDI;X TKJ 7;$auto;$auto",
  "NAZWA FANEZYA HALIVI;X TKJ 7;$auto;$auto",
  "NENDEN CAHYATI;X TKJ 2;$auto;$auto",
  "NENDI FIRMANSYAH;X TKJ 6;$auto;$auto",
  "NENENG REISHA YUNINGSIH;X TKJ 3;$auto;$auto",
  "NINA SINTIA;X TKJ 2;$auto;$auto",
  "NIZWA PARIDA VASSHA;X TKJ 6;$auto;$auto",
  "NOVA AKBAR ARIYANTO;X TKRO 2;$auto;$auto",
  "NOVAL ADITIA LESMANA;X TKRO 3;$auto;$auto",
  "NUR AMALIA PUTRI;X TKJ 3;$auto;$auto",
  "NURAINI;X TKJ 3;$auto;$auto",
  "NURIZKI MAULANA;X TKJ 7;$auto;$auto",
  "NURUL FADILAH HAYATI;X TKJ 5;$auto;$auto",
  "P.MAULIDAN NUR ALAMSAH;X TKRO 5;$auto;$auto",
  "PADJRI PAIDJAL;X TKRO 2;$auto;$auto",
  "PADLI NUR JAMALUDIN;X TKJ 5;$auto;$auto",
  "PEBI CHOIRUL IHSAN;X TKRO 1;$auto;$auto",
  "QHOIS PATIMAH;X TKJ 6;$auto;$auto",
  "RADEL DEV KURNIA;X TKJ 6;$auto;$auto",
  "RAFA AHDAN ALFIKARI;X TKRO 3;$auto;$auto",
  "RAFKA ADITIA WIRASAPUTRA;X TKRO 5;$auto;$auto",
  "RAFLI AGUSTIA;X TKRO 3;$auto;$auto",
  "RAFLY RIFALDI AGUSTIN;X TKRO 4;$auto;$auto",
  "RAHAYU NUR ANJANI;X TKJ 2;$auto;$auto",
  "RAHMAN PRIATNA;X TKJ 2;$auto;$auto",
  "RAIHAN PUTRA PANALAR;X TKRO 5;$auto;$auto",
  "RAIS PRAYOGA ARSA;X TKRO 1;$auto;$auto",
  "RAISA YAZKIA RIZKI;X TKJ 5;$auto;$auto",
  "RAKA FERDIANSYAH;X TKRO 2;$auto;$auto",
  "RAKA SANDYA PAHRIYANA;X TKRO 3;$auto;$auto",
  "RAMADANI FIRMANSYAH;X TKRO 2;$auto;$auto",
  "RAMDAN JUANSAH;X TKJ 1;$auto;$auto",
  "RANDI RAMDANI;X TKJ 7;$auto;$auto",
  "RANI RAHMAWATI;X TKJ 1;$auto;$auto",
  "RAPLI;X TKRO 5;$auto;$auto",
  "RAYMAN ANGGA REYNALDY;X TKJ 5;$auto;$auto",
  "REEFADH ARRAZI MUHAMAD;X TKRO 4;$auto;$auto",
  "REFA ASMA RIANTI;X TKJ 2;$auto;$auto",
  "REFAL HAMDANI;X TKRO 1;$auto;$auto",
  "REFAN TRYGUNA;X TKJ 2;$auto;$auto",
  "REHAN;X TKRO 3;$auto;$auto",
  "RENALDI DIRA ANJANI;X TKRO 1;$auto;$auto",
  "RENDI PANGALILA;X TKJ 5;$auto;$auto",
  "RENDI SUPRIATNA;X TKRO 3;$auto;$auto",
  "RENI SUGIHARTI;X TKJ 6;$auto;$auto",
  "RENITA ANGGRAENI;X TKJ 7;$auto;$auto",
  "REPAN SAEPAN RAMDANI;X TKRO 4;$auto;$auto",
  "RESKY GIVARI KHOIR;X TKRO 4;$auto;$auto",
  "RESSA ADITYA NUROHMAN;X TKJ 7;$auto;$auto",
  "RESTU SINGGIH HERWANA;X TKJ 1;$auto;$auto",
  "REVAN FAUZAN;X TKJ 6;$auto;$auto",
  "REVAN FEBQYAN;X TKRO 5;$auto;$auto",
  "REVHAN ARDIANSYAH;X TKJ 5;$auto;$auto",
  "REVHANGGA NOVALIADI ZAELANIE;X TKRO 3;$auto;$auto",
  "REVI SATRIANA;X TKJ 5;$auto;$auto",
  "REYFANS VIRQI AL FITROH;X TKRO 5;$auto;$auto",
  "REYHAN RAMADHAN;X TKRO 4;$auto;$auto",
  "REYNAN RAEDY HANDARU;X TKJ 6;$auto;$auto",
  "REYSHA ADISTRIANI PUTRI;X TKJ 4;$auto;$auto",
  "REYSHA ZAHRA APRILANTI;X TKJ 5;$auto;$auto",
  "REZA AKBAR KUSMAJAYAWIKARTA;X TKJ 2;$auto;$auto",
  "REZA KHOERUL MUBAROK;X TKRO 4;$auto;$auto",
  "REZA RAMDHAN HIDAYAT;X TKJ 1;$auto;$auto",
  "REZI RUKMAN AHMADILLAH;X TKRO 5;$auto;$auto",
  "REZKY TORIK FALAH;X TKJ 3;$auto;$auto",
  "RIAN PURNAMA;X TKRO 5;$auto;$auto",
  "RIAN RESTIANA;X TKJ 7;$auto;$auto",
  "RIANA NURZANAH;X TKJ 6;$auto;$auto",
  "RIDHO MAULANA HATLAN;X TKRO 4;$auto;$auto",
  "RIFAL RIZKI FAIRUZ;X TKRO 2;$auto;$auto",
  "RIFKY RAMDHANI;X TKJ 6;$auto;$auto",
  "RIKY;X TKJ 3;$auto;$auto",
  "RINDIYANI KUSUMA WARDANI;X TKJ 6;$auto;$auto",
  "RIO RIGERGIE PERMANA;X TKRO 2;$auto;$auto",
  "RIRIN AIRA PUTRI;X TKJ 3;$auto;$auto",
  "RISKY ADITYA PRATAMA YUDISTIRA;X TKRO 3;$auto;$auto",
  "RISMA SALSABILLA;X TKJ 6;$auto;$auto",
  "RIYANTI SHALSABILLA;X TKJ 6;$auto;$auto",
  "RIZAL;X TKJ 5;$auto;$auto",
  "RIZKI MAULANA;X TKRO 4;$auto;$auto",
  "RIZKI SAIFUDIN FADILAH;X TKRO 2;$auto;$auto",
  "RIZKY;X TKRO 1;$auto;$auto",
  "RIZKY ADRIAN PRATAMA;X TKRO 1;$auto;$auto",
  "RIZKY MERDEKA ALFARIZHI;X TKJ 7;$auto;$auto",
  "RIZQO AGUNG RAMADHAN;X TKRO 4;$auto;$auto",
  "RIZWAR TRIANSYAH;X TKRO 4;$auto;$auto",
  "ROBI NURDIN SOBANDI;X TKJ 1;$auto;$auto",
  "ROFII ABDUL MAJID;X TKRO 5;$auto;$auto",
  "ROMI ZAELANI;X TKJ 6;$auto;$auto",
  "ROSADI ABDUL RAHMAT;X TKRO 5;$auto;$auto",
  "RUSTANDI;X TKRO 4;$auto;$auto",
  "SAENUDIN;X TKJ 3;$auto;$auto",
  "SAHLA FAJRIAWATI;X TKJ 3;$auto;$auto",
  "SAHRUL IRAWAN;X TKJ 7;$auto;$auto",
  "SALMAN APRILIANSYAH;X TKRO 3;$auto;$auto",
  "SALSA NABILA;X TKJ 4;$auto;$auto",
  "SALWA NURAENI;X TKJ 2;$auto;$auto",
  "SANDI ISHAN RAMADHANI;X TKJ 3;$auto;$auto",
  "SANDI PRATAMA;X TKRO 4;$auto;$auto",
  "SANI IHSAN RAMADHANI;X TKJ 5;$auto;$auto",
  "SANTIKA AULIYA;X TKJ 3;$auto;$auto",
  "SATYA ARYA DWIPA;X TKRO 5;$auto;$auto",
  "SHALMA RIZQI AMELLIA;X TKJ 2;$auto;$auto",
  "SHELLTA FARREL OKTAVIAN;X TKJ 5;$auto;$auto",
  "SHELLTA RIFFAL OKTAVIAN;X TKJ 7;$auto;$auto",
  "SINTIA PUTRI NURLAELA;X TKJ 1;$auto;$auto",
  "SISKA KURNIA;X TKJ 3;$auto;$auto",
  "SITI VITA AGUSTIANI;X TKJ 4;$auto;$auto",
  "SRI WAHYUNI;X TKJ 2;$auto;$auto",
  "SRI WIDAYANTI;X TKJ 1;$auto;$auto",
  "STEVEN MAHMUD;X TKRO 2;$auto;$auto",
  "SUSANTI;X TKJ 4;$auto;$auto",
  "SYARFA ANISA RAHMAN;X TKJ 1;$auto;$auto",
  "SYASKIA APRILIA;X TKJ 2;$auto;$auto",
  "SYIFA LATIPAH;X TKJ 3;$auto;$auto",
  "SYIFA NURLATIFAH;X TKJ 2;$auto;$auto",
  "SYLVIA MERIANA;X TKJ 3;$auto;$auto",
  "TANHA SAEPURACHMAN;X TKRO 3;$auto;$auto",
  "TAUFIK HIDAYAH;X TKJ 1;$auto;$auto",
  "TESA APRILLIA;X TKJ 1;$auto;$auto",
  "TIA ANDRIANI;X TKRO 5;$auto;$auto",
  "TIKTIK LESTARI;X TKJ 2;$auto;$auto",
  "UBAIDILLAH;X TKJ 7;$auto;$auto",
  "VANES RAYVAN HIDAYAT;X TKRO 5;$auto;$auto",
  "VIA NUR AZIZAH;X TKJ 1;$auto;$auto",
  "VICKRY MUDIANA SUDARYAT;X TKRO 2;$auto;$auto",
  "VINO ALVIAN;X TKRO 5;$auto;$auto",
  "VIRGI RAPID RABANI;X TKJ 3;$auto;$auto",
  "WANDA APRILIA;X TKRO 1;$auto;$auto",
  "WAWAN SUTIAWAN;X TKJ 7;$auto;$auto",
  "WIDIA NURCAHYA PUTRI;X TKJ 1;$auto;$auto",
  "WIDYA SINTA BELA;X TKJ 5;$auto;$auto",
  "WIKI TRISNADIN;X TKRO 3;$auto;$auto",
  "WILDAN ADITIA PRATAMA;X TKJ 2;$auto;$auto",
  "WILDAN SIDIK ABDILLAH;X TKRO 5;$auto;$auto",
  "WINA AGHISNA;X TKJ 1;$auto;$auto",
  "WIRA DJATIBUANA;X TKJ 1;$auto;$auto",
  "WISNU FEBRIAN;X TKJ 4;$auto;$auto",
  "WIWIN SAFITRI;X TKJ 5;$auto;$auto",
  "WULAN FEBRALIA PERTIWI;X TKJ 2;$auto;$auto",
  "WULAN LESTARI;X TKJ 1;$auto;$auto",
  "WULAN OKTAVIANI;X TKJ 5;$auto;$auto",
  "YANUAR ARBIANSKA;X TKRO 5;$auto;$auto",
  "YASA MUHAMAD;X TKRO 5;$auto;$auto",
  "YOGI FEBRI IRAWAN;X TKJ 7;$auto;$auto",
  "YOSEP RAMDHANI;X TKJ 6;$auto;$auto",
  "YUDI ADITYA SAEPUDIN;X TKJ 6;$auto;$auto",
  "YULIANTI;X TKJ 7;$auto;$auto",
  "YUYU WAHYUDIN;X TKRO 5;$auto;$auto",
  "ZAHRA ALAGISNA;X TKJ 4;$auto;$auto",
];

const cities = [
  "Aek Kanopan",
  "Arga Makmur",
  "Arosuka",
  "Balige",
  "Banda Aceh",
  "Bandar Lampung",
  "Bandar Seri Bentan",
  "Bangkinang",
  "Bangko",
  "Banyuasin",
  "Batam",
  "Baturaja",
  "Batusangkar",
  "Bengkalis",
  "Bengkulu",
  "Binjai",
  "Bintuhan",
  "Bireuen",
  "Blambangan Umpu",
  "Blangpidie",
  "Blang Kejeren",
  "Bukittinggi",
  "Calang",
  "Curup",
  "Daik",
  "Dolok Sanggul",
  "Dumai",
  "Gedong Tataan",
  "Gunung Sitoli",
  "Gunung Sugih",
  "Gunung Tua",
  "Idi Rayeuk",
  "Indralaya",
  "Jambi",
  "Jantho",
  "Kabanjahe",
  "Kalianda",
  "Karang Baru",
  "Karang Tinggi",
  "Kayu Agung",
  "Kepahiang",
  "Kisaran",
  "Koba",
  "Kota Agung",
  "Kota Bumi",
  "Kota Pinang",
  "Kuala Tungkal",
  "Kutacane",
  "Lahat",
  "Lahomi",
  "Langsa",
  "Lhokseumawe",
  "Lhoksukon",
  "Limapuluh",
  "Liwa",
  "Lotu",
  "Lubuk Basung",
  "Lubuk Bendaharo",
  "Lubuk Linggau",
  "Lubuk Pakam",
  "Lubuk Sikaping",
  "Manggar",
  "Manna",
  "Martapura",
  "Medan",
  "Menggala",
  "Mentok",
  "Metro",
  "Meulaboh",
  "Meureude",
  "Muara Aman",
  "Muara Bulian",
  "Muara Bungo",
  "Muara Dua",
  "Muara Enim",
  "Muara Sabak",
  "Muara Tebo",
  "Muaro Sijunjung",
  "Muko Muko",
  "Padang",
  "Padang Aro",
  "Padang Panjang",
  "Padang Sidempuan",
  "Pagaralam",
  "Painan",
  "Palembang",
  "Pandan",
  "Pangkalan Kerinci",
  "Pangkal Pinang",
  "Panguruan",
  "Panyabungan",
  "Pariaman",
  "Parit Malintang",
  "Pasir Pengarayan",
  "Payakumbuh",
  "Pekanbaru",
  "Pematang Siantar",
  "Prabumulih",
  "Pringsewu",
  "Pulau Punjung",
  "Ranai",
  "Rantau Prapat",
  "Raya",
  "Rengat",
  "Sabang",
  "Salak",
  "Sarilamak",
  "Sarolangun",
  "Sawahlunto",
  "Sei Rampah",
  "Sekayu",
  "Selat Panjang",
  "Sengeti",
  "Siak Sri Indrapura",
  "Sibolga",
  "Sibuhuan",
  "Sidikalang",
  "Sigli",
  "Simpang Empat",
  "Simpang Tiga Redelong",
  "Sinabang",
  "Singkil",
  "Sipirok",
  "Solok",
  "Stabat",
  "Subulussalam",
  "Sukadana",
  "Suka Makmue",
  "Sungailiat",
  "Sungai Penuh",
  "Takengon",
  "Tais",
  "Tanjung Balai",
  "Tanjung Balai Karimun",
  "Tanjung Enim",
  "Tanjung Pandan",
  "Tanjung Pinang",
  "Tapaktuan",
  "Tarempa",
  "Tarutung",
  "Tebing Tinggi",
  "Tebing Tinggi",
  "Teluk Dalam",
  "Teluk Kuantan",
  "Tembilahan",
  "Toboali",
  "Tuapejat",
  "Ujung Tanjung",
  "Bandung",
  "Bangil",
  "Banjar",
  "Banjarnegara",
  "Bangkalan",
  "Bantul",
  "Banyumas",
  "Banyuwangi",
  "Batang",
  "Batu",
  "Bekasi",
  "Blitar",
  "Blora",
  "Bogor",
  "Bojonegoro",
  "Bondowoso",
  "Boyolali",
  "Bumiayu",
  "Brebes",
  "Cianjur",
  "Ciamis",
  "Cibinong",
  "Cikampek",
  "Cikarang",
  "Cilacap",
  "Cilegon",
  "Cirebon",
  "Demak",
  "Depok",
  "Garut",
  "Gresik",
  "Indramayu",
  "Jakarta",
  "Jember",
  "Jepara",
  "Jombang",
  "Kajen",
  "Karanganyar",
  "Kebumen",
  "Kediri",
  "Kendal",
  "Kepanjen",
  "Klaten",
  "Kudus",
  "Kuningan",
  "Lamongan",
  "Lumajang",
  "Madiun",
  "Magelang",
  "Magetan",
  "Majalengka",
  "Malang",
  "Mojokerto",
  "Mungkid",
  "Ngamprah",
  "Nganjuk",
  "Ngawi",
  "Pacitan",
  "Pamekasan",
  "Pandeglang",
  "Pare",
  "Pati",
  "Pasuruan",
  "Pekalongan",
  "Pelabuhan Ratu",
  "Pemalang",
  "Ponorogo",
  "Probolinggo",
  "Purbalingga",
  "Purwakarta",
  "Purwodadi",
  "Purwokerto",
  "Purworejo",
  "Rangkasbitung",
  "Rembang",
  "Salatiga",
  "Sampang",
  "Semarang",
  "Serang",
  "Sidayu",
  "Sidoarjo",
  "Singaparna",
  "Situbondo",
  "Slawi",
  "Sleman",
  "Soreang",
  "Sragen",
  "Subang",
  "Sukabumi",
  "Sukoharjo",
  "Sumber",
  "Sumedang",
  "Sumenep",
  "Surabaya",
  "Surakarta",
  "Tasikmalaya",
  "Tangerang",
  "Tangerang Selatan",
  "Tegal",
  "Temanggung",
  "Tigaraksa",
  "Trenggalek",
  "Tuban",
  "Tulung Agung",
  "Ungaran",
  "Wates",
  "Wlingi",
  "Wonogiri",
  "Wonosari",
  "Wonosobo",
  "Yogyakarta",
  "Atambua",
  "Baa",
  "Badung",
  "Bajawa",
  "Bangli",
  "Bima",
  "Denpasar",
  "Dompu",
  "Ende",
  "Gianyar",
  "Kalabahi",
  "Karangasem",
  "Kefamenanu",
  "Klungkung",
  "Kupang",
  "Labuhan Bajo",
  "Larantuka",
  "Lewoleba",
  "Maumere",
  "Mataram",
  "Mbay",
  "Negara",
  "Praya",
  "Raba",
  "Ruteng",
  "Selong",
  "Singaraja",
  "Soe",
  "Sumbawa Besar",
  "Tabanan",
  "Taliwang",
  "Tambolaka",
  "Tanjung",
  "Waibakul",
  "Waikabubak",
  "Waingapu",
  "Pontianak",
  "Samarinda",
  "Banjarmasin",
  "Balikpapan",
  "Singkawang",
  "Palangkaraya",
  "Mempawah",
  "Ketapang",
  "Sintang",
  "Tarakan",
  "Putussibau",
  "Sambas",
  "Sampit",
  "Banjarbaru",
  "Barabai",
  "Batang Tarang",
  "Batulicin",
  "Bengkayang",
  "Bontang",
  "Buntok",
  "Kandangan",
  "Kotabaru",
  "Kuala Kapuas",
  "Kuala Kurun",
  "Kuala Pembuang",
  "Malinau",
  "Marabahan",
  "Martapura",
  "Muara Teweh",
  "Nanga Bulik",
  "Nanga Pinoh",
  "Ngabang",
  "Nunukan",
  "Pangkalan Bun",
  "Paringin",
  "Pelaihari",
  "Penajam",
  "Pulang Pisau",
  "Purukcahu",
  "Rantau",
  "Sangatta",
  "Sekadau",
  "Sendawar",
  "Sukadana",
  "Sukamara",
  "Sungai Raya",
  "Tamiang Layang",
  "Tanah Grogot",
  "Tanjung",
  "Tanjung Selor",
  "Tanjung Redeb",
  "Tenggarong",
  "Tideng Pale",
  "Airmadidi",
  "Ampana",
  "Amurang",
  "Andolo",
  "Banggai",
  "Bantaeng",
  "Barru",
  "Bau-Bau",
  "Benteng",
  "Bitung",
  "Bolaang Uki",
  "Boroko",
  "Bulukumba",
  "Bungku",
  "Buol",
  "Buranga",
  "Donggala",
  "Enrekang",
  "Gorontalo",
  "Jeneponto",
  "Kawangkoan",
  "Kendari",
  "Kolaka",
  "Kotamobagu",
  "Kwandang",
  "Lasusua",
  "Luwuk",
  "Majene",
  "Makale",
  "Makassar",
  "Malili",
  "Mamasa",
  "Mamuju",
  "Manado",
  "Marisa",
  "Maros",
  "Masamba",
  "Melonguane",
  "Ondong Siau",
  "Palopo",
  "Palu",
  "Pangkajene",
  "Pare-Pare",
  "Parigi",
  "Pasangkayu",
  "Pinrang",
  "Polewali",
  "Poso",
  "Raha",
  "Rantepao",
  "Ratahan",
  "Rumbia",
  "Sengkang",
  "Sidenreng",
  "Sigi Biromaru",
  "Sinjai",
  "Sunggu Minasa",
  "Suwawa",
  "Tahuna",
  "Takalar",
  "Tilamuta",
  "Toli Toli",
  "Tomohon",
  "Tondano",
  "Tutuyan",
  "Unaaha",
  "Wangi Wangi",
  "Wanggudu",
  "Watampone",
  "Watan Soppeng",
  "Cliquers",
  "Libuo Palma",
  "Agats",
  "Ambon",
  "Banda",
  "Biak",
  "Bintuni",
  "Botawa",
  "Burmeso",
  "Dataran Hunimoa",
  "Dataran Hunipopu",
  "Dobo",
  "Elelim",
  "Enarotali",
  "Fak Fak",
  "Fef",
  "Ilaga",
  "Jailolo",
  "Jayapura",
  "Kaimana",
  "Karubaga",
  "Kenyam",
  "Kepi",
  "Kigamani",
  "Kisar",
  "Kobakma",
  "Kota Mulia",
  "Kumurkek",
  "Labuha",
  "Larat",
  "Leksula",
  "Maba",
  "Manokwari",
  "Masohi",
  "Merauke",
  "Morotai Selatan",
  "Nabire",
  "Namlea",
  "Namrole",
  "Oksibil",
  "Oobo",
  "Passo",
  "Piru",
  "Rasiei",
  "Sanana",
  "Saparua",
  "Sarmi",
  "Saumlaki",
  "Sentani",
  "Serui",
  "Sorendiweri",
  "Sorong",
  "Sugapa",
  "Sumohai",
  "Tanah Merah",
  "Teminabuan",
  "Ternate",
  "Tiakur",
  "Tidore",
  "Tigi",
  "Timika",
  "Tiom",
  "Tobelo",
  "Tual",
  "Waisai",
  "Wamena",
  "Waris",
  "Weda",
];
