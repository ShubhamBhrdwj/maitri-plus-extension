console.log("Maitri+ dashboard loaded");

(async () => {
  if (!location.href.includes("maitri.bmu.edu.in")) return;

  /* ---------- Floating Button ---------- */
  if (!document.getElementById("mp-fab")) {
    const fab = document.createElement("button");
    fab.id = "mp-fab";
    fab.innerText = "Maitri+";
    document.body.appendChild(fab);
    fab.onclick = () => openDashboard();
  }

  function openDashboard() {
    if (document.getElementById("mp-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "mp-overlay";
    overlay.innerHTML = `
      <div id="mp-app">
        <header class="mp-top">
          <div class="mp-left">
            <div class="mp-brand"><h1>Maitri+</h1></div>
          </div>
          <div class="mp-right">
            <div class="mp-user">
              <div id="mp-name"></div>
              <div id="mp-roll"></div>
            </div>
            <button id="mp-close">✕</button>
          </div>
        </header>

        <section class="mp-controls">
          <div class="mp-select">
            <label>Semester</label>
            <select id="mp-sem"></select>
          </div>

          <div class="mp-input">
            <label>Attend</label>
            <input type="number" id="mp-attend" value="0" min="0">
          </div>

          <div class="mp-input">
            <label>Skip</label>
            <input type="number" id="mp-skip" value="0" min="0">
          </div>
        </section>

        <section id="mp-subjects" class="mp-subjects"></section>

        <footer class="mp-footer">
          <span>
            Maitri+ · Built by Shubham Bhardwaj (CSE ’25–29)
          </span>

          <span class="mp-socials">
            <a
              href="https://www.linkedin.com/in/mr-shubham-bhardwaj/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4zM8.5 8.5h3.8v2.1h.1c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.77 2.65 4.77 6.1V24h-4v-7.8c0-1.86-.03-4.26-2.6-4.26-2.6 0-3 2.03-3 4.12V24h-4z"/>
              </svg>
            </a>

            <a
              href="https://www.instagram.com/shubham.bhrdwj/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.06 1.8.25 2.22.42.55.21.95.47 1.37.9.42.42.68.82.9 1.37.17.42.36 1.05.42 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.25 1.8-.42 2.22-.21.55-.47.95-.9 1.37-.42.42-.82.68-1.37.9-.42.17-1.05.36-2.22.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.8-.25-2.22-.42-.55-.21-.95-.47-1.37-.9-.42-.42-.68-.82-.9-1.37-.17-.42-.36-1.05-.42-2.22C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.06-1.17.25-1.8.42-2.22.21-.55.47-.95.9-1.37.42-.42.82-.68 1.37-.9.42-.17 1.05-.36 2.22-.42C8.42 2.21 8.8 2.2 12 2.2zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.15.63c-.78.3-1.44.7-2.1 1.36-.66.66-1.06 1.32-1.36 2.1-.3.75-.5 1.63-.56 2.9C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.9.3.78.7 1.44 1.36 2.1.66.66 1.32 1.06 2.1 1.36.75.3 1.63.5 2.9.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.9-.56.78-.3 1.44-.7 2.1-1.36.66-.66 1.06-1.32 1.36-2.1.3-.75.5-1.63.56-2.9.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.9-.3-.78-.7-1.44-1.36-2.1-.66-.66-1.32-1.06-2.1-1.36-.75-.3-1.63-.5-2.9-.56C15.67.01 15.26 0 12 0z"/>
                <path d="M12 5.8A6.2 6.2 0 1 0 12 18.2 6.2 6.2 0 0 0 12 5.8zm0 10.2A4 4 0 1 1 12 8a4 4 0 0 1 0 8z"/>
                <circle cx="18.4" cy="5.6" r="1.44"/>
              </svg>
            </a>
          </span>
        </footer>


      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("mp-close").onclick = () => overlay.remove();

    initLogic();
  }

  /* ---------- Helpers ---------- */
  async function fetchJSON(url) {
    const r = await fetch(url, { credentials: "include" });
    const text = await r.text();
    if (!text.trim() || text.startsWith("<")) return [];
    return JSON.parse(text);
  }

  function calcPct(present, absent) {
    const total = present + absent;
    if (total === 0) return "0.00";
    return ((present / total) * 100).toFixed(2);
  }

  /* ---------- Core Logic ---------- */
  async function initLogic() {
    const profile = (await fetchJSON("/stu_getStudentPersonalinfo.json"))[0];
    document.getElementById("mp-name").innerText =
      `${profile.firstName} ${profile.lastName}`;
    document.getElementById("mp-roll").innerText = profile.rollNo;

    const semEl = document.getElementById("mp-sem");
    const attendEl = document.getElementById("mp-attend");
    const skipEl = document.getElementById("mp-skip");

    let attendX = 0;
    let skipX = 0;

    /* ---------- Load semesters dynamically ---------- */
    const terms = await fetchJSON("/stu_getTermsOfStudentForCourceFile.json");
    semEl.innerHTML = "";

    let activeSem = null;

    terms.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.semesterId;
      opt.textContent = t.terms2Name;

      opt.dataset.subjectIds = t.subjectwiseStudentIds;
      opt.dataset.batchIds = t.subejctwiseBatchIds;
      opt.dataset.capacity = t.batchsemesterCapacity;

      if (t.terms2Status === true) activeSem = String(t.semesterId);
      semEl.appendChild(opt);
    });

    semEl.value = activeSem || semEl.options[0].value;

    semEl.onchange = loadSubjects;
    attendEl.oninput = () => {
      attendX = +attendEl.value;
      loadSubjects();
    };
    skipEl.oninput = () => {
      skipX = +skipEl.value;
      loadSubjects();
    };

    /* ---------- Load Subjects ---------- */
    async function loadSubjects() {
      const container = document.getElementById("mp-subjects");
      container.innerHTML = "Loading…";

      const opt = semEl.selectedOptions[0];

      const subjects = await fetchJSON(
        `/stu_getSubjectOnChangeWithSemId1.json` +
          `?termId=${semEl.value}` +
          `&refreshData=0` +
          `&subjectwisestudentids=${encodeURIComponent(opt.dataset.subjectIds)}` +
          `&subejctwiseBatchIds=${encodeURIComponent(opt.dataset.batchIds)}` +
          `&batchsemestercapacity=${encodeURIComponent(opt.dataset.capacity)}`
      );

      container.innerHTML = "";

      subjects.forEach(s => {
        const present = Number(s.presentCount);
        const absent = Number(s.absentCount);
        const livePct = calcPct(present, absent);

        const bunkable =
          present === 0
            ? 0
            : Math.max(0, Math.floor(present / 0.75 - (present + absent)));

        const card = document.createElement("div");
        card.className = "mp-card";
        card.innerHTML = `
          <div class="mp-card-head">
            <div>
              <div class="mp-code">${s.subjectCode}</div>
              <div class="mp-title">${s.subject}</div>
            </div>
            <div class="mp-att">${livePct}%</div>
          </div>

          <div class="mp-card-meta">
            Classes: ${present}/${present + absent} ·
            Bunkable: <b>${bunkable}</b>
          </div>

          <div class="mp-expand" hidden>
            <div class="mp-sim">
              <div>After Attend ${attendX}:
                <b>${calcPct(present + attendX, absent)}%</b>
              </div>
              <div>After Skip ${skipX}:
                <b>${calcPct(present, absent + skipX)}%</b>
              </div>
            </div>
            <div class="mp-marks">Loading marks…</div>
          </div>
        `;

        container.appendChild(card);

        const expand = card.querySelector(".mp-expand");
        const marksDiv = card.querySelector(".mp-marks");

        card.onclick = async () => {
          expand.hidden = !expand.hidden;
          if (marksDiv.dataset.loaded) return;

          const marks = await fetchJSON(
            `/stu_getStudentCourseFileMarks.json?__subBatchId=${s.encoSubBatchId}&__subjectWiseStudentID=${s.encoSubjectwiseStudentId}`
          );

          let scored = 0, outOf = 0;
          let html = "";

          marks.forEach(a => {
            scored += a.WeightageSumTotal ?? a.sumTotal;
            outOf += a.WeightageOutOf ?? a.outOf;

            html += `
              <div class="mp-mark-card">
                <b>${a.AssesmentName}</b>
                ${a.MarksDetails.map(
                  m => `<div>${m.name}: ${m.sumMarks}/${m.totalMarks}</div>`
                ).join("")}
              </div>
            `;
          });

          marksDiv.innerHTML = `
            <div class="mp-overall">
              Total: <b>${scored.toFixed(2)} / ${outOf.toFixed(2)}</b>
            </div>
            ${html}
          `;
          marksDiv.dataset.loaded = "1";
        };
      });
    }

    loadSubjects();
  }
})();
