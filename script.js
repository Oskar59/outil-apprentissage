// Gestion des onglets
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Récupérer l'onglet cible
    const tabId = button.dataset.tab;

    // Masquer toutes les sections
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.add("hidden"); // Masquer chaque section
      tab.classList.remove("active"); // Retirer la classe active
    });

    // Désactiver tous les boutons
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));

    // Afficher la section sélectionnée et activer le bouton
    document.getElementById(tabId).classList.remove("hidden");
    document.getElementById(tabId).classList.add("active");
    button.classList.add("active");
  });
});

// Variables pour les données
let testQuestions = [];
let ficheData = [];
let trainingData = [];

// Fonction utilitaire pour parser le CSV
function parseCSV(csvContent) {
  const rows = csvContent.split("\n");
  return rows
    .map((row) => {
      const [question, answer] = row.split(",");
      return question && answer
        ? { question: question.trim(), answer: answer.trim() }
        : null;
    })
    .filter((item) => item !== null);
}

/* ------------------ Section Test ------------------ */
document
  .getElementById("fileInputTest")
  .addEventListener("change", handleTestFile);
document.getElementById("submitTestBtn").addEventListener("click", gradeTest);

function handleTestFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      testQuestions = parseCSV(e.target.result);
      if (testQuestions.length > 0) displayQuiz(testQuestions);
    };
    reader.readAsText(file);
  }
}

function displayQuiz(questions) {
  const quizForm = document.getElementById("quiz-form");
  quizForm.innerHTML = "";
  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
          <p>${q.question}</p>
          <input type="text" name="answer-${i}" data-correct="${q.answer}">
      `;
    quizForm.appendChild(div);
  });
  document.getElementById("quiz-container").classList.remove("hidden");
  document.getElementById("submitTestBtn").classList.remove("hidden");
}

function gradeTest() {
  const inputs = document.querySelectorAll("#quiz-form input");
  let correct = 0;
  let incorrectFeedback = "";

  inputs.forEach((input, index) => {
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = input.dataset.correct.trim().toLowerCase();

    if (userAnswer === correctAnswer) {
      correct++;
    } else {
      incorrectFeedback += `
              <p><strong>Question :</strong> ${
                testQuestions[index].question
              }</p>
              <p><strong>Votre réponse :</strong> ${
                input.value || "Pas de réponse"
              }</p>
              <p><strong>Bonne réponse :</strong> ${
                testQuestions[index].answer
              }</p>
              <hr>
          `;
    }
  });

  const result = document.getElementById("test-result");
  result.innerHTML = `
      <p>Vous avez ${correct} bonne(s) réponse(s) sur ${testQuestions.length}.</p>
  `;
  if (incorrectFeedback) {
    result.innerHTML += `
          <h3>Questions incorrectes :</h3>
          ${incorrectFeedback}
      `;
  }
  result.classList.remove("hidden");
}

/* ------------------ Section Fiche de Révision ------------------ */
document
  .getElementById("fileInputFiche")
  .addEventListener("change", handleFicheFile);
document
  .getElementById("generateFicheBtn")
  .addEventListener("click", generateFiche);
document
  .getElementById("downloadFicheBtn")
  .addEventListener("click", downloadFiche);
document
  .getElementById("downloadImageBtn")
  .addEventListener("click", downloadFicheAsImage);

function handleFicheFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      ficheData = parseCSV(e.target.result);
      document.getElementById("generateFicheBtn").classList.remove("hidden");
    };
    reader.readAsText(file);
  }
}

function generateFiche() {
  const content = document.getElementById("revision-content");
  content.innerHTML = "";
  const table = document.createElement("table");
  const header = `<tr><th>Question</th><th>Réponse</th></tr>`;
  table.innerHTML =
    header +
    ficheData
      .map((q) => `<tr><td>${q.question}</td><td>${q.answer}</td>`)
      .join("");
  content.appendChild(table);
  document.getElementById("revision-container").classList.remove("hidden");
  document.getElementById("downloadFicheBtn").classList.remove("hidden");
  document.getElementById("downloadImageBtn").classList.remove("hidden");
}

function downloadFiche() {
  const content = ficheData
    .map((q) => `Question: ${q.question}\nRéponse: ${q.answer}`)
    .join("\n\n");
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "fiche_de_revision.txt";
  link.click();
}

function downloadFicheAsImage() {
  const revisionContent = document.getElementById("revision-content");
  html2canvas(revisionContent).then((canvas) => {
    const link = document.createElement("a");
    link.download = "fiche_de_revision.png";
    link.href = canvas.toDataURL(); // Convertir le canvas en URL de l'image
    link.click();
  });
}

/* ------------------ Section Entraînement ------------------ */
document
  .getElementById("fileInputTraining")
  .addEventListener("change", handleTrainingFile);
document
  .getElementById("generateTrainingBtn")
  .addEventListener("click", generateTraining);

function handleTrainingFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      trainingData = parseCSV(e.target.result);
      document.getElementById("generateTrainingBtn").classList.remove("hidden");
    };
    reader.readAsText(file);
  }
}

function generateTraining() {
  const content = document.getElementById("training-content");
  content.innerHTML = "";
  const table = document.createElement("table");
  const header = `<tr><th>Question</th><th>Réponse</th><th>Action</th></tr>`;
  table.innerHTML =
    header +
    trainingData
      .map(
        (q, i) => `
      <tr>
          <td>${q.question}</td>
          <td id="answer-${i}" style="display: none;">${q.answer}</td>
          <td><button onclick="toggleAnswer(${i})" id="toggleBtn-${i}">Voir la réponse</button></td>
      </tr>
  `
      )
      .join("");
  content.appendChild(table);
  document.getElementById("training-container").classList.remove("hidden");
}

function toggleAnswer(index) {
  const answer = document.getElementById(`answer-${index}`);
  const button = document.getElementById(`toggleBtn-${index}`);
  if (answer.style.display === "none") {
    answer.style.display = "table-cell";
    button.textContent = "Masquer la réponse";
  } else {
    answer.style.display = "none";
    button.textContent = "Voir la réponse";
  }
}
