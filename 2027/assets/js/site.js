(() => {
  const siteRoot = new URL("../../", document.currentScript.src);
  const routes = {
    overview: "index.html",
    welcome: "introduction/welcome.html",
    location: "introduction/location.html",
    attractions: "introduction/attractions.html",
    registration: "attendance/registration.html",
    dates: "attendance/dates.html",
    "call-for-papers": "papers/call-for-papers.html",
    "paper-submission": "papers/paper-submission.html",
    proposals: "papers/proposals.html",
    "invited-papers": "papers/invited-papers.html",
    awards: "papers/awards.html",
    keynote: "program/keynote.html",
    tutorials: "program/tutorials.html",
    "young-researchers": "program/young-researchers.html",
    "special-events": "program/special-events.html",
    "organizing-committee": "committee/organizing-committee.html",
    "program-committee": "committee/program-committee.html",
  };
  const route = routes[window.location.hash.slice(1)];
  if (route) {
    const target = new URL(route, siteRoot);
    if (target.pathname !== window.location.pathname) {
      window.location.replace(target.href);
      return;
    }
  }

  async function read(path, type = "json") {
    const response = await fetch(new URL(path, siteRoot), { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response[type]();
  }

  function formatDate(value, banner = false, includeYear = true) {
    const [year, month, day] = value.split("-");
    const weekday = "일월화수목금토"[new Date(`${value}T00:00:00Z`).getUTCDay()];
    return banner
      ? `${includeYear ? `${year}. ` : ""}${month}. ${day} (${weekday})`
      : `${includeYear ? `${year}년 ` : ""}${month}월 ${day}일 (${weekday})`;
  }

  function formatSchedule(event, banner = false, duration = false) {
    let text = formatDate(event.start, banner);
    if (event.end) {
      const includeYear = !banner || event.start.slice(0, 4) !== event.end.slice(0, 4);
      text += ` ~ ${formatDate(event.end, banner, includeYear)}`;
      if (duration) {
        const days = (Date.parse(event.end) - Date.parse(event.start)) / 86400000 + 1;
        text += ` [${days}일간]`;
      }
    }
    if (event.time) text += ` ${event.time}`;
    return text;
  }

  function renderSchedule(schedule) {
    const eventFor = (id) => {
      const event = schedule.events[id];
      if (!event) throw new Error(`Unknown schedule: ${id}`);
      return event;
    };
    document.querySelectorAll("[data-schedule]").forEach((element) => {
      element.textContent = formatSchedule(
        eventFor(element.dataset.schedule),
        element.dataset.scheduleFormat === "banner",
        element.hasAttribute("data-schedule-duration"),
      );
    });
    const important = schedule.important_dates.map((id) => [id, eventFor(id)]);
    document.querySelectorAll("[data-schedule-table]").forEach((table) => {
      table.replaceChildren();
      important.forEach(([, event]) => {
        const row = document.createElement("tr");
        const label = document.createElement("th");
        label.scope = "row";
        label.textContent = event.label;
        const date = document.createElement("td");
        date.textContent = formatSchedule(event);
        row.append(label, date);
        table.append(row);
      });
    });
    document.querySelectorAll("[data-schedule-list]").forEach((list) => {
      list.replaceChildren();
      important.forEach(([id, event]) => {
        const item = document.createElement("li");
        item.className = "date-item";
        const title = document.createElement("div");
        title.className = `date-title${id === "conference" ? " conference-date" : ""}`;
        const icon = document.createElement("i");
        icon.className = id === "conference" ? "fa-solid fa-flag-checkered" : "fa-regular fa-calendar-check";
        icon.setAttribute("aria-hidden", "true");
        const dates = document.createElement("span");
        const start = document.createElement("span");
        start.className = "nowrap";
        start.textContent = formatDate(event.start);
        dates.append(start);
        if (event.end) {
          const end = document.createElement("span");
          end.className = "nowrap";
          end.textContent = formatDate(event.end);
          dates.append(" ~ ", end);
        }
        if (event.time) dates.append(` ${event.time}`);
        title.append(icon, dates);
        const label = document.createElement("span");
        label.className = "date-event";
        label.textContent = event.label;
        item.append(title, label);
        list.append(item);
      });
    });
  }

  async function loadSite() {
    const components = Array.from(document.querySelectorAll("[data-component]"));
    const [site, schedule, fragments] = await Promise.all([
      read("data/site.json"),
      read("data/schedule.json"),
      Promise.all(components.map((element) => read(`components/${element.dataset.component}.html`, "text"))),
    ]);
    components.forEach((element, index) => {
      const template = document.createElement("template");
      template.innerHTML = fragments[index];
      element.replaceWith(template.content);
    });

    const edition = Number(site.edition);
    const suffix = edition % 100 >= 10 && edition % 100 <= 20
      ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[edition % 10] || "th");
    site.edition_ordinal = `${edition}${suffix}`;
    document.querySelectorAll("[data-site]").forEach((element) => {
      const value = site[element.dataset.site];
      if (value === undefined) throw new Error(`Unknown site field: ${element.dataset.site}`);
      element.textContent = value;
    });
    document.querySelectorAll("[data-link]").forEach((element) => {
      element.setAttribute("href", new URL(element.dataset.link, siteRoot).href);
    });
    document.querySelectorAll("[data-site-url]").forEach((element) => {
      element.setAttribute("href", site[element.dataset.siteUrl]);
    });
    document.querySelectorAll(".nav-link[data-nav-group]").forEach((element) => {
      element.classList.toggle("active", element.dataset.navGroup === document.body.dataset.navGroup);
    });
    document.querySelectorAll(".dropdown-menu [data-nav-id]").forEach((element) => {
      element.classList.toggle("active", element.dataset.navId === document.body.dataset.navId);
    });
    document.title = `${document.querySelector("h1").textContent} | KCSE ${site.year}`;
    renderSchedule(schedule);
    document.body.dataset.siteStatus = "ready";
  }

  loadSite().catch((error) => {
    console.error("Could not load site information", error);
    document.body.dataset.siteStatus = "error";
    const status = document.getElementById("site-status");
    status.textContent = "페이지 정보를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.";
    status.hidden = false;
  });
})();
