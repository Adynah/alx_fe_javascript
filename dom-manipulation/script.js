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
    const newQuote = { text, category };
    quotes.push(newQuote)
    saveQuotesToLocalStorage();
    postQuoteToAPI(newQuote);
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

async function fetchQuotesFromAPI() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json();

        const fetchedQuotes = data.slice(20, 25).map(post => ({
            text: post.title,
            category: "API"
        }));

        const newQuotes = fetchedQuotes.filter(apiQuote =>
            !quotes.some(localQuote => localQuote.text === apiQuote.text)
        );

        if (newQuotes.length === 0) {
            showNotification("No new unique quotes found in API fetch.", "info");
            return;
        }

        quotes.push(...fetchedQuotes);
        saveQuotesToLocalStorage();
        populateCategories();
        showRandomQuote();

        showNotification(`${newQuotes.length} quote(s) fetched from API.`, "success");

    } catch (error) {
        console.error("Error fetching quotes:", error);
        showNotification("Error fetching quotes from API.", "error");
    }
}

async function postQuoteToAPI(quote) {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1
            }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        });

        const data = await response.json();
        console.log("Posted to API:", data);
    } catch (error) {
        console.error("Error posting to API:", error);
    }
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json();

        const serverQuotes = data.slice(0, 10).map(post => ({
            text: post.title,
            category: "Server"
        }));

        let updatesMade = 0;
        let conflicts = [];

        serverQuotes.forEach(serverQuote => {
            const existingIndex = quotes.findIndex(
                localQuote => localQuote.text === serverQuote.text
            );

            if (existingIndex === -1) {
                quotes.push(serverQuote);
                updatesMade++;
            } else if (quotes[existingIndex].category !== serverQuote.category) {
                conflicts.push({
                    text: serverQuote.text,
                    localCategory: quotes[existingIndex].category,
                    serverCategory: serverQuote.category,
                    index: existingIndex
                });
            }
        });

        if (conflicts.length > 0) {
            handleConflicts(conflicts);
        }

        if (updatesMade > 0) {
            saveQuotesToLocalStorage();
            populateCategories();
            showNotification(`${updatesMade} new quote(s) synced from server.`, "success");
        } else if (conflicts.length === 0) {
            showNotification("No new quotes or conflicts from server.", "info");
        }
    } catch (error) {
        console.error("Sync error:", error);
        showNotification("Failed to sync quotes from server.", "error");
    }
}

function showNotification(message, type = "info") {
    const notificationArea = document.getElementById("notificationArea");

    const colorMap = {
        info: "#e0f7fa",
        success: "#d0f8ce",
        warning: "#fff3cd",
        error: "#f8d7da"
    };

    notificationArea.innerHTML = `<div style="background-color:${colorMap[type]}; padding:10px; border-radius:4px;">${message}</div>`;

    setTimeout(() => {
        notificationArea.innerHTML = "";
    }, 4000);
}

function handleConflicts(conflictList) {
    conflictList.forEach(conflict => {
        const userChoice = confirm(
            `Conflict for quote:\n"${conflict.text}"\n\nLocal: ${conflict.localCategory}\nServer: ${conflict.serverCategory}\n\nClick OK to use server version, Cancel to keep local version.`
        );

        if (userChoice) {
            quotes[conflict.index].category = conflict.serverCategory;
            showNotification(`Server version used for: "${conflict.text}"`, "warning");
        } else {
            showNotification(`Kept local version of: "${conflict.text}"`, "info");
        }
    });

    saveQuotesToLocalStorage();
    populateCategories();
    showRandomQuote();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
    document.getElementById("importFile").addEventListener("change", importFromJsonFile);
    document.getElementById("addQuoteButton").addEventListener("click", addQuote);
    document.getElementById("fetchQuotes").addEventListener("click", fetchQuotesFromAPI);

    showRandomQuote();
    createExportButton();
    populateCategories();
    fetchQuotesFromServer();
    setInterval(fetchQuotesFromServer, 15000);
});
