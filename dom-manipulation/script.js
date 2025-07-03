let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The journey of a thousand miles begins with one step.", category: "Motivation" }, 
    { text: "All work and no play makes jack a dull boy.", category: "Inspiration" }
];

function saveQuotesToLocalStorage() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available.</p>";
    return;
  }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><em>[${quote.category}]</em></p>`;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotesToLocalStorage();
    textInput.value = "";
    categoryInput.value = "";
    showRandomQuote();
  } else {
    alert("Please enter both quote and category.");
  }
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);

            if (Array.isArray(importedQuotes)) {
                const validQuotes = importedQuotes.filter(q =>
                    q.text && q.category && typeof q.text === "string" && typeof q.category === "string"
                );

                if (validQuotes.length > 0) {
                    quotes.push(...validQuotes);
                    saveQuotesToLocalStorage();
                    alert(`${validQuotes.length} quote(s) imported successfully!`);
                } else {
                    alert("No valid quotes found in the file.");
                }
            } else {
                alert("Invalid file format: JSON must be an array of quote objects.");
            }
        } catch (err) {
            alert("Failed to import quotes: " + err.message);
        }
    };

    reader.readAsText(file);
}

function createExportButton() {
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export Quotes to JSON";

    exportButton.addEventListener("click", () => {
        const json = JSON.stringify(quotes, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "quotes.json";
        a.click();

        URL.revokeObjectURL(url);
    });

    document.body.appendChild(exportButton);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
    document.getElementById("addQuoteButton").addEventListener("click", addQuote);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

    showRandomQuote();
    createExportButton();
});
