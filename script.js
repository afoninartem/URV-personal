const timesheets = {};
const senesys = {};
const departments = [];
const csvTitle = [
  `№`,
  `ФИО`,
  `Должность`,
  `Норма дней`,
  `Норма часов`,
  `всего отработано дней`,
  `всего отработано часов`,
  `из них удаленно в часах`,
  `из них отпуск оплачиваемый/больничный`,
  `не рабочий`,
  `день	за свой счет`,
  `Командировка`,
  `Переработка`,
  `Простой`,
  `Компенсация`,
  `Дата увольнения`,
  `Примечание`,
];

let numberOfTimesheets = 0;
// let numberOfEmployees = 0;

const showDepartments = () => {
  document.querySelector("ul").innerHTML = "";
  const set = [...new Set(departments)];
  set.forEach((el) => {
    const li = document.createElement("li");
    li.textContent = el;
    document.querySelector("ul").appendChild(li);
  });
};

const showDetails = () => {
  document.querySelector("details").style.display = "block";
};

const getDepartment = (str) => {
  const tmp = str
    .split("_")
    .join("")
    .split("Подразделение")
    .join("")
    .split(":")
    .join("")
    .trim();
  const first = tmp[0];
  let other = tmp.split("");
  other.shift();
  other = other.join("");
  return `${first.toUpperCase()}${other.toLowerCase()}`;
};

const isName = (str) => {
  let result = true;
  if (str.trim()) {
    const arr = str.split(" ");
    const re = /^[А-Я][а-я]+/;
    if (arr.length === 2 || arr.length === 3 || arr.length === 4) {
      arr.forEach((el) => {
        if (!re.test(el)) result = false;
      });
    } else {
      result = false;
    }
  } else {
    result = false;
  }
  return result;
};

const getOverJob = (obj) => {
  const fullTime = {
    src: obj.time.split(":"),
  };
  const normTime = {
    src: obj.normHours.split(":"),
  };

  [(fullTime, normTime)].forEach((time) => {
    if (time.src.length === 3) time.pop();
    // time.mls = 
  });
  console.log(fullTime, normTime);

  return "ведутся работы";
};

document.querySelector(".result-btn").addEventListener("click", () => {
  // console.log(timesheets)
  let csv = "";
  csvTitle.forEach((el, i) => {
    csv += el;
    if (i + 1 !== csvTitle.length) {
      csv += ";";
    }
  });
  csv += "\n";
  let num = 1;
  // console.log(csv)
  for (emp in timesheets) {
    if (senesys[emp]) {
      timesheets[emp].time = senesys[emp].time;
      timesheets[emp].overjob = getOverJob(timesheets[emp]);
    } else {
      alert(
        `В Сенезисе нет такого сотрудника: ${emp}, ${timesheets[emp].department}`
      );
    }
    csv += `${num};${emp};${timesheets[emp].position};${timesheets[emp].normDays};${timesheets[emp].normHours};;${timesheets[emp].time};;;;;;;;;;;`;
    csv += "\n";
    num += 1;
  }
  var hiddenElement = document.createElement("a");
  hiddenElement.href =
    "data:text/csv;charset=utf-8," + encodeURI("\uFEFF" + csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = `Конец месяца.csv`;
  hiddenElement.click();
  // console.log(csv);
});

const fileHandle = (file) => {
  numberOfTimesheets += 1;
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawTimesheets = this.result.split(`\n`).map((el) => el.split(`;`));
    departments.push(getDepartment(rawTimesheets[1][0]));
    for (elem in rawTimesheets) {
      const el = rawTimesheets[elem];
      if (el[1] !== undefined) {
        if (isName(el[1])) {
          timesheets[el[1]] = {
            name: el[1],
            position: el[2],
            normDays: el[42],
            normHours: el[43],
            department: getDepartment(rawTimesheets[1][0]),
          };
        }
      }
    }
  };
  reader.readAsText(file, `windows-1251`);
  document.querySelector(".ts-quan").textContent = numberOfTimesheets;
  // document.querySelector('.emps-quan').textContent = numberOfEmployees;
};

document.querySelector("#timesheet").onchange = function () {
  showDetails();
  for (file in this.files) {
    fileHandle(this.files[file]);
  }
};

document.querySelector("#senesys").onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function (progressEvent) {
    let rawSenesys = this.result.split(`\n`).map((el) => el.split(`;`));
    rawSenesys.pop();
    const filteredSenesys = rawSenesys.filter((el) => {
      return el[0] === "ПИН:" || el[5] === "Итого:";
    });
    for (let i = 0; i < filteredSenesys.length - 1; i += 2) {
      const name = filteredSenesys[i][4];
      const time = filteredSenesys[i + 1][7];
      senesys[name] = {
        name: name,
        time: time,
      };
    }
  };
  reader.readAsText(file, `windows-1251`);
};
