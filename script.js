document.addEventListener("DOMContentLoaded", () => {
    initDarkMode();
    initCollapsibleSections();
    initProjectToggles();
    initDynamicSkills();
    initContactForm();
    initGitHubRepos();
    initQuoteAPI();
});

/**
 * Dark Mode Toggle & Persistence
 */
function initDarkMode() {
    const darkModeBtn = document.getElementById("darkModeBtn");
    if (!darkModeBtn) return;

    const setMode = (isDark) => {
        document.body.classList.toggle("dark-mode", isDark);
        darkModeBtn.textContent = isDark ? "Light mode" : "Dark mode";
        localStorage.setItem("darkMode", isDark);
    };

    // Restore preference
    if (localStorage.getItem("darkMode") === "true") {
        setMode(true);
    } else {
        darkModeBtn.textContent = "Dark mode";
    }

    darkModeBtn.addEventListener("click", () => {
        const currentlyDark = document.body.classList.contains("dark-mode");
        setMode(!currentlyDark);
    });
}

/**
 * Collapsible Sections (Skills / Achievements)
 */
function initCollapsibleSections() {
    ["skills", "achievements"].forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;

        const heading = section.querySelector("h2");
        const label = heading.textContent;
        const content = document.createElement("div");
        content.className = "section-content";

        // Move all children after the heading into the content wrapper
        while (section.children.length > 1) {
            content.appendChild(section.children[1]);
        }
        section.appendChild(content);

        // Add toggle button
        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = `Hide ${label}`;
        toggleBtn.className = "btn-outline";
        toggleBtn.style.marginTop = "10px";
        heading.after(toggleBtn);

        toggleBtn.addEventListener("click", () => {
            const isHidden = content.style.display === "none";
            content.style.display = isHidden ? "" : "none";
            toggleBtn.textContent = isHidden ? `Hide ${label}` : `Show ${label}`;
        });
    });
}

/**
 * Project Detail Toggles
 */
function initProjectToggles() {
    document.querySelectorAll(".detail-toggle").forEach(btn => {
        const list = btn.nextElementSibling;
        btn.addEventListener("click", () => {
            const isHidden = list.hidden;
            list.hidden = !isHidden;
            btn.textContent = isHidden ? "Hide Details" : "Show Details";
        });
    });
}

/**
 * Add Skill Dynamically
 */
function initDynamicSkills() {
    const input = document.getElementById("skillInput");
    const addBtn = document.getElementById("addSkillBtn");
    if (!input || !addBtn) return;

    const addSkill = () => {
        const val = input.value.trim();
        if (!val) return;

        let customGroup = document.getElementById("custom-skill-group");
        if (!customGroup) {
            customGroup = document.createElement("div");
            customGroup.className = "skill-group";
            customGroup.id = "custom-skill-group";
            customGroup.innerHTML = '<h4>Custom</h4><div class="tags" id="custom-tags"></div>';
            document.querySelector(".skills-grid").appendChild(customGroup);
        }

        const tag = document.createElement("span");
        tag.textContent = val;
        document.getElementById("custom-tags").appendChild(tag);
        input.value = "";
        input.focus();
    };

    addBtn.addEventListener("click", addSkill);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addSkill();
    });
}

/**
 * Contact Form Validation
 */
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        // Reset feedback
        ["nameError", "emailError", "messageError", "formSuccess"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.hidden = true;
        });

        let isValid = true;
        if (!name) {
            document.getElementById("nameError").hidden = false;
            isValid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById("emailError").hidden = false;
            isValid = false;
        }
        if (!message) {
            document.getElementById("messageError").hidden = false;
            isValid = false;
        }

        if (isValid) {
            document.getElementById("formSuccess").hidden = false;
            form.reset();
        }
    });
}

/**
 * GitHub API - Repositories
 */
async function initGitHubRepos() {
    const GITHUB_USER = "SamarAhmed1";
    const loading = document.getElementById("github-loading");
    const errorDiv = document.getElementById("github-error");
    const cardsDiv = document.getElementById("github-cards");
    const retryBtn = document.getElementById("github-retry");

    if (!cardsDiv) return;

    const fetchRepos = async () => {
        loading.hidden = false;
        errorDiv.hidden = true;
        cardsDiv.innerHTML = "";

        try {
            const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`);
            if (!res.ok) throw new Error("GitHub error");

            const repos = await res.json();
            loading.hidden = true;

            if (repos.length === 0) {
                cardsDiv.innerHTML = "<p>No public repositories found.</p>";
                return;
            }

            repos.forEach(repo => {
                const card = document.createElement("div");
                card.className = "repo-card";
                card.innerHTML = `
                    <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                    <p>${repo.description || "<em>No description</em>"}</p>
                    <div class="repo-meta">
                        ${repo.language ? `<span class="repo-lang">${repo.language}</span>` : ""}
                        <span class="repo-stars">⭐ ${repo.stargazers_count}</span>
                    </div>
                `;
                cardsDiv.appendChild(card);
            });
        } catch (err) {
            loading.hidden = true;
            errorDiv.hidden = false;
        }
    };

    retryBtn?.addEventListener("click", fetchRepos);
    fetchRepos();
}

/**
 * Quote API - Daily Motivation
 */
async function initQuoteAPI() {
    const loading = document.getElementById("quote-loading");
    const errorDiv = document.getElementById("quote-error");
    const content = document.getElementById("quote-content");
    const quoteText = document.getElementById("quote-text");
    const quoteAuth = document.getElementById("quote-author");
    const newBtn = document.getElementById("new-quote-btn");

    if (!content) return;

    const fetchQuote = async () => {
        loading.hidden = false;
        errorDiv.hidden = true;
        content.hidden = true;
        newBtn.hidden = true;

        try {
            const res = await fetch("https://api.quotable.kurokeita.dev/api/quotes/random");
            if (!res.ok) throw new Error("Quote API error");

            const data = await res.json();
            const q = data.quote || data;
            
            quoteText.textContent = q.content || q.text;
            quoteAuth.textContent = q.author || "Unknown";

            loading.hidden = true;
            content.hidden = false;
            newBtn.hidden = false;
        } catch (err) {
            // Native fallback for robustness
            const fallbacks = [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                { text: "Security is always excessive until it's not enough.", author: "Robbie Sinclair" },
                { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" }
            ];
            const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            quoteText.textContent = pick.text;
            quoteAuth.textContent = `${pick.author} (Offline)`;

            loading.hidden = true;
            content.hidden = false;
            newBtn.hidden = false;
        }
    };

    newBtn?.addEventListener("click", fetchQuote);
    fetchQuote();
}
