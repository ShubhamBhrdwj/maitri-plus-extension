async function loadDashboard() {
  const profile = await window.MAITRI_PLUS.getProfile();

  let term = null;
  let attendX = 0;
  let skipX = 0;

  document.getElementById("studentName").innerText =
    `${profile.firstName} ${profile.lastName}`;

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="controls">
      <select id="sem"></select>

      <div class="num">
        <label>Attend</label>
        <input type="number" id="attend" value="0" min="0" />
      </div>

      <div class="num">
        <label>Skip</label>
        <input type="number" id="skip" value="0" min="0" />
      </div>
    </div>

    <table id="subjects">
      <thead>
        <tr>
          <th>Code</th>
          <th>Subject</th>
          <th>Classes</th>
          <th>%</th>
          <th>Bunkable</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  document.getElementById("close").onclick = () =>
    document.getElementById("mp-overlay").remove();

  const semEl = document.getElementById("sem");
  const attendEl = document.getElementById("attend");
  const skipEl = document.getElementById("skip");

/* ---------- Load semesters (TRULY DYNAMIC) ---------- */
const terms = await window.MAITRI_PLUS.getTerms();
semEl.innerHTML = "";

const savedSem = sessionStorage.getItem("mp_selected_sem");

let hasSaved = false;

terms.forEach(t => {
  const opt = document.createElement("option");

  opt.value = String(t.semesterId);
  opt.textContent = t.terms2Name;

  opt.dataset.subjectIds = t.subjectwiseStudentIds;
  opt.dataset.batchIds = t.subejctwiseBatchIds;
  opt.dataset.capacity = t.batchsemesterCapacity;

  if (savedSem && savedSem === opt.value) {
    hasSaved = true;
  }

  semEl.appendChild(opt);
});

if (hasSaved) {
  semEl.value = savedSem;
} else {
  const active = terms.find(t => t.terms2Status === true);
  semEl.value = active
    ? String(active.semesterId)
    : semEl.options[0]?.value;
}

term = Number(semEl.value);

semEl.onchange = () => {
  sessionStorage.setItem("mp_selected_sem", semEl.value);
  term = Number(semEl.value);
  loadSubjects();
};


  attendEl.oninput = e => {
    attendX = +e.target.value;
    loadSubjects();
  };

  skipEl.oninput = e => {
    skipX = +e.target.value;
    loadSubjects();
  };

  /* ---------- Helpers ---------- */
  function calcPct(present, absent) {
    const total = present + absent;
    if (total === 0) return "0.00";
    return ((present / total) * 100).toFixed(2);
  }

  /* ---------- Load Subjects ---------- */
  async function loadSubjects() {
    const tbody = document.querySelector("#subjects tbody");
    tbody.innerHTML = "<tr><td colspan='6'>Loading…</td></tr>";

    const selected = semEl.selectedOptions[0];

    const subjects = await window.MAITRI_PLUS.getSubjects({
      termId: term,
      subjectIds: selected.dataset.subjectIds,
      batchIds: selected.dataset.batchIds,
      capacity: selected.dataset.capacity
    });

    tbody.innerHTML = "";

    for (const s of subjects) {
      const present = Number(s.presentCount);
      const absent = Number(s.absentCount);
      const total = present + absent;

      const livePct = calcPct(present, absent);

      const bunkable =
        present === 0
          ? 0
          : Math.max(0, Math.floor(present / 0.75 - total));

      const attendPct = calcPct(present + attendX, absent);
      const skipPct = calcPct(present, absent + skipX);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.subjectCode}</td>
        <td class="left">${s.subject}</td>
        <td>${present}/${total}</td>
        <td>${livePct}%</td>
        <td>${bunkable}</td>
        <td><button class="view">View</button></td>
      `;

      tbody.appendChild(tr);

      const detailRow = document.createElement("tr");
      detailRow.style.display = "none";
      detailRow.innerHTML = `
        <td colspan="6">
          <div class="details">
            <div class="sim">
              <div>After Attend ${attendX}: <b>${attendPct}%</b></div>
              <div>After Skip ${skipX}: <b>${skipPct}%</b></div>
            </div>
            <div class="marks">Loading marks…</div>
          </div>
        </td>
      `;

      tbody.appendChild(detailRow);

      tr.querySelector(".view").onclick = async () => {
        detailRow.style.display =
          detailRow.style.display === "none" ? "table-row" : "none";

        const marksDiv = detailRow.querySelector(".marks");
        if (marksDiv.dataset.loaded) return;

        const marks = await window.MAITRI_PLUS.getMarks(
          s.encoSubBatchId,
          s.encoSubjectwiseStudentId
        );

        let scored = 0;
        let outOf = 0;
        let html = "";

        for (const a of marks) {
          scored += a.WeightageSumTotal ?? a.sumTotal;
          outOf += a.WeightageOutOf ?? a.outOf;

          html += `
            <div class="card">
              <h4>${a.AssesmentName}</h4>
              ${a.MarksDetails.map(
                m => `<div>${m.name}: ${m.sumMarks}/${m.totalMarks}</div>`
              ).join("")}
            </div>
          `;
        }

        marksDiv.innerHTML = `
          <div class="overall">
            Overall Marks: <b>${scored.toFixed(2)} / ${outOf.toFixed(2)}</b>
          </div>
          <div class="grid">${html}</div>
        `;

        marksDiv.dataset.loaded = "1";
      };
    }
  }

  loadSubjects();
}

loadDashboard();
