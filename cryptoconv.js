// Function to scroll to the "Home Section" when the button is clicked
function scrollToHome() {
    const homeSection = document.getElementById("Home");
    homeSection.scrollIntoView({ behavior: "smooth" });
}

// Function to toggle FAQ answers
function toggleFAQ(id) {
    const answer = document.getElementById(`faq-answer-${id}`);
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
    } else {
        answer.style.display = 'block';
    }
}

// Object to store cached conversion rates
let cachedRates = {};
let lastFetchTime = null;

// Function to fetch rates and update the cache
async function fetchConversionRates() {
    try {
        console.log("Fetching conversion rates from API...");
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,tether,solana,dogecoin,binancecoin,cardano,ripple&vs_currencies=usd,eur,tnd`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        cachedRates = await response.json();
        lastFetchTime = Date.now();
        console.log("Cached Conversion Rates:", cachedRates);
    } catch (error) {
        console.error("Error fetching conversion rates:", error);
    }
}

// Function to get conversion rate from cache
function getConversionRate(fromCurrency, toCurrency) {
    return cachedRates[fromCurrency]?.[toCurrency] || null;
}

// Function to handle conversion
async function convertCurrency() {
    let fromAmountInput = document.getElementById("fromAmount").value.trim();
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;
    const toAmountField = document.getElementById("toAmount");

    // Replace commas with dots for decimal compatibility
    fromAmountInput = fromAmountInput.replace(',', '.');
    const fromAmount = parseFloat(fromAmountInput);

    if (isNaN(fromAmount) || fromAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    // Check if data is older than 5 minutes (300,000 ms)
    if (!lastFetchTime || Date.now() - lastFetchTime > 300000) {
        await fetchConversionRates(); // Fetch new data if needed
    }

    const conversionRate = getConversionRate(fromCurrency, toCurrency);

    if (conversionRate) {
        const convertedAmount = (fromAmount * conversionRate).toFixed(2);
        toAmountField.value = convertedAmount;
    } else {
        alert("Conversion rate not available for the selected currencies.");
    }
}

// Attach event listener to the Convert button
document.getElementById("convertButton").addEventListener("click", convertCurrency);

// Fetch rates every 5 minutes automatically
setInterval(fetchConversionRates, 300000); // 300,000 ms = 5 minutes

// Fetch rates immediately on page load
fetchConversionRates();

// EmailJS functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', sendEmail);
        console.log("Event listener attached to feedback form");
    } else {
        console.error("Feedback form element not found");
    }
});

function sendEmail(event) {
    event.preventDefault();
    console.log("SendEmail function called");

    if (typeof emailjs === 'undefined') {
        console.error('EmailJS library not loaded');
        alert('Unable to send email. Please try again later.');
        return;
    }

    const submitButton = document.querySelector('.feedback-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    const userEmail = document.getElementById("user_email").value;
    const userMessage = document.getElementById("user_message").value;

    console.log("Email:", userEmail, "Message:", userMessage);

    if (!userEmail || !userMessage) {
        alert("Please fill in both email and message fields.");
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        return;
    }

    const templateParams = {
        from_email: userEmail,
        message: userMessage,
    };

    emailjs.send('service_20nwjvo', 'template_1mwbiej', templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response.status, response.text);
            alert('Message sent successfully!');
            document.getElementById("feedbackForm").reset();
        })
        .catch(function(error) {
            console.error('Email sending failed:', error);
            alert('Failed to send message. Please try again.');
        })
        .finally(function() {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        });
}