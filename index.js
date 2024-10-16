const data = [
  "Diandra Shafar Rahman;X TKJ 5;100",
  "Revi Satriana;X TKJ 5;100",
  "Cindi;X TKJ 5;100",
  "Anita;X TKJ 5;100",
  "Anisa;X TKJ 5;100",
  "Elsa;X TKJ 5;100",
  "Mutiara;X TKJ 5;100",
  "Reysha;X TKJ 5;100",
  "Alinda;X TKJ 5;100",
  "Kharysa;X TKJ 5;100",
  "Nurul;X TKJ 5;100",
  "Andari;X TKJ 5;100",
];

document.addEventListener("DOMContentLoaded", () => {
  data.forEach((person) => {
    const [name, _class, _] = person.split(";");
    const score = random_int(80, 100);

    create_row(name, _class, score);
  });
});

const animate_meter = (meter, target_percent) => {
  const initial_width = parseFloat(meter.style.width) || 0;
  const meter_head = meter.querySelector(".meter-head");
  const meter_indicator = meter.querySelector(".meter-indicator");
  const duration = 2000;

  meter_head.animate(
    [{ width: initial_width + "%" }, { width: target_percent + "%" }],
    {
      duration: duration,
      easing: "cubic-bezier(.95,.24,.1,.98)",
      fill: "forwards",
    },
  );

  const update_indicator = (timestamp) => {
    if (timestamp > duration) return;

    const parent_width = parseFloat(
      getComputedStyle(meter_head.parentElement).width,
    );
    const percent = parseFloat(getComputedStyle(meter_head).width);
    meter_indicator.textContent =
      Math.ceil((percent / parent_width) * 100) + "%";

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

const random_int = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const create_row = (name, _class, score) => {
  const table = document.getElementsByClassName("main-table")[0];

  const row = table.insertRow();

  let cell;
  cell = row.insertCell();
  cell.appendChild(document.createTextNode(name));

  cell = row.insertCell();
  cell.appendChild(document.createTextNode(_class));

  cell = row.insertCell();
  const meter = create_meter();
  cell.appendChild(meter);
  animate_meter(meter, score);
};
