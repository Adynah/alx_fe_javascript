let quotes = [{text: "The journey of a thousand miles begins with one step.", category: "Motivation"}];

function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><em>[${quote.category}]</em></p>`;
}

function createAddQuoteForm() {
    const formContainer = document.createElement("div");
    
    const quoteInput = document.createElement("input")
    quoteInput.type = "text";
    quoteInput.id = "newQuoteText";
    quoteInput.placeholder = "Enter a new quote";

    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.id = "newQuoteCategory";
    categoryInput.placeholder = "Enter quote category";

    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";
    addButton.addEventListener("click", () => {
        const text = quoteInput.value.trim();
        const category = categoryInput.value.trim();

    if (text && category) {
        quotes.push({ text, category});

        quoteInput.value = "";
        categoryInput.value = "";

    } else {
            alert("Please enter both quote and category.");
        }    
    });

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer);
}

document.addEventListener("DOMContentLoaded", () => {
    const quoteButton = document.getElementById("newQuote");
    quoteButton.addEventListener("click", showRandomQuote);

    showRandomQuote();
    createAddQuoteForm();
});
