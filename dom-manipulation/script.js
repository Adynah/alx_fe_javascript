let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The journey of a thousand miles begins with one step.", category: "Motivation" }, 
    { text: "All work and no play makes jack a dull boy.", category: "Inspiration" }
];

function saveQuotesToLocalStorage() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const selectedCategory = document.getElementById("categoryFilter").value;

    let filteredQuotes = quotes;
    if (selectedCategory !== "all") {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes found in this category.</p>";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

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
    populateCategories();

    const categorySelect = document.getElementById("categoryFilter");
    categorySelect.value = category;
    localStorage.setItem("selectedCategory", category);
    filterQuotes();

  } else {
    alert("Please enter both quote and category.");
  }
}

function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteButton";
  addButton.textContent = "Add Quote";

  // Attach the addQuote handler here
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
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
    const exportButton = document.getElementById("exportButton");
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
}

function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categorySelect.querySelector(`option[value="${savedCategory}"]`)) {
    categorySelect.value = savedCategory;
    filterQuotes();
  }
}

function filterQuotes() {
  const categorySelect = document.getElementById("categoryFilter");
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");

  let filtered = quotes;

  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found in this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><em>[${quote.category}]</em></p>`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
    document.getElementById("importFile").addEventListener("change", importFromJsonFile);
    document.getElementById("addQuoteButton").addEventListener("click", addQuote);

    showRandomQuote();
    createExportButton();
    populateCategories();
});
