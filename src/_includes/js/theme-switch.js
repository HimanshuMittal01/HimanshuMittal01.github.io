const toggleButton = document.querySelector(".color-mode-toggle");
console.log(toggleButton);
const toggleIcon = document.querySelector(".toggle-icon");

// Function to toggle color mode
function toggleColorMode() {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    console.log(isDark)

    // Update the toggle icon
    toggleIcon.textContent = isDark ? "🌙" : "🌞";

    // Save the user's preference in localStorage
    localStorage.setItem("color-mode", isDark ? "dark" : "light");
}

// Attach the event listener
toggleButton.addEventListener("click", toggleColorMode);

// Determine initial color mode
const savedMode = localStorage.getItem("color-mode");
if (savedMode) {
    // Apply saved preference
    if (savedMode === "dark") {
        document.documentElement.classList.add("dark-mode");
        toggleIcon.textContent = "🌙";
    } else {
        toggleIcon.textContent = "🌞";
    }
} else {
    // Default to system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark-mode");
        toggleIcon.textContent = "🌙";
    } else {
        toggleIcon.textContent = "🌞";
    }
}
