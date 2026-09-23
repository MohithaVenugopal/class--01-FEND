// ===============================
// INITIAL DATA
// ===============================

let users = JSON.parse(localStorage.getItem("users")) || [];

let campaigns = JSON.parse(localStorage.getItem("campaigns")) || [];

let donations = JSON.parse(localStorage.getItem("donations")) || [];


// ===============================
// DEFAULT ADMIN
// ===============================

if (!users.some(user => user.email === "admin@fundhope.com")) {

    users.push({
        name: "Administrator",
        email: "admin@fundhope.com",
        password: "admin123",
        role: "admin"
    });

    localStorage.setItem("users", JSON.stringify(users));
}


// ===============================
// SIGNUP
// ===============================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const role = document.getElementById("signupRole").value;

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            alert("An account with this email already exists.");
            return;
        }

        const newUser = {
            name: name,
            email: email,
            password: password,
            role: role
        };

        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));

        alert("Signup successful! Please login.");

        window.location.href = "login.html";
    });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const user = users.find(
            user =>
                user.email === email &&
                user.password === password
        );

        if (!user) {
            alert("Invalid email or password.");
            return;
        }

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        if (user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
    });
}


// ===============================
// USER DASHBOARD
// ===============================

if (document.getElementById("userName")) {

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );

    if (!loggedInUser || loggedInUser.role !== "user") {

        alert("Please login as a user.");

        window.location.href = "login.html";

    } else {

        document.getElementById("userName").textContent =
            loggedInUser.name;

        const userCampaigns = campaigns.filter(
            campaign => campaign.creator === loggedInUser.email
        );

        const userDonations = donations.filter(
            donation => donation.user === loggedInUser.email
        );

        document.getElementById("userCampaignCount").textContent =
            userCampaigns.length;

        document.getElementById("userDonationCount").textContent =
            userDonations.length;

        const totalAmount = userDonations.reduce(
            (total, donation) => total + Number(donation.amount),
            0
        );

        document.getElementById("userDonationAmount").textContent =
            totalAmount;
    }
}


// ===============================
// CREATE CAMPAIGN
// ===============================

const campaignForm = document.getElementById("campaignForm");

if (campaignForm) {

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );

    if (!loggedInUser || loggedInUser.role !== "user") {

        alert("Please login as a user first.");

        window.location.href = "login.html";
    }

    campaignForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const title =
            document.getElementById("campaignTitle").value.trim();

        const description =
            document.getElementById("campaignDescription").value.trim();

        const target =
            Number(document.getElementById("campaignTarget").value);

        const category =
            document.getElementById("campaignCategory").value;

        const newCampaign = {

            id: Date.now(),

            title: title,

            description: description,

            target: target,

            raised: 0,

            category: category,

            creator: loggedInUser.email,

            status: "Pending"
        };

        campaigns.push(newCampaign);

        localStorage.setItem(
            "campaigns",
            JSON.stringify(campaigns)
        );

        alert("Campaign created successfully!");

        window.location.href = "campaigns.html";
    });
}


// ===============================
// DISPLAY CAMPAIGNS
// ===============================

const campaignList = document.getElementById("campaignList");

if (campaignList) {

    displayCampaigns(campaignList);
}


function displayCampaigns(container) {

    container.innerHTML = "";

    const approvedCampaigns = campaigns.filter(
        campaign => campaign.status === "Approved"
    );

    if (approvedCampaigns.length === 0) {

        container.innerHTML = `
            <div class="campaign-card">
                <h3>No campaigns available</h3>
                <p>Be the first person to create a campaign.</p>
            </div>
        `;

        return;
    }

    approvedCampaigns.forEach(campaign => {

        const percentage =
            Math.min(
                (campaign.raised / campaign.target) * 100,
                100
            );

        const card = document.createElement("div");

        card.className = "campaign-card";

        card.innerHTML = `

            <h3>${campaign.title}</h3>

            <p>
                <strong>Category:</strong>
                ${campaign.category}
            </p>

            <p>${campaign.description}</p>

            <p>
                <strong>Target:</strong>
                ₹${campaign.target}
            </p>

            <p>
                <strong>Raised:</strong>
                ₹${campaign.raised}
            </p>

            <div class="progress-container">

                <div
                    class="progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>

            <p>${percentage.toFixed(0)}% funded</p>

            <button
                class="btn"
                onclick="donate(${campaign.id})"
            >
                Donate
            </button>
        `;

        container.appendChild(card);
    });
}


// ===============================
// DONATION
// ===============================

function donate(campaignId) {

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );

    if (!loggedInUser) {

        alert("Please login to donate.");

        window.location.href = "login.html";

        return;
    }

    if (loggedInUser.role !== "user") {

        alert("Only users can make donations.");

        return;
    }

    const amount = prompt(
        "Enter donation amount:"
    );

    if (!amount || Number(amount) <= 0) {

        alert("Please enter a valid amount.");

        return;
    }

    const campaign = campaigns.find(
        campaign => campaign.id === campaignId
    );

    if (!campaign) {

        alert("Campaign not found.");

        return;
    }

    campaign.raised += Number(amount);

    donations.push({

        id: Date.now(),

        campaignId: campaignId,

        user: loggedInUser.email,

        amount: Number(amount)
    });

    localStorage.setItem(
        "campaigns",
        JSON.stringify(campaigns)
    );

    localStorage.setItem(
        "donations",
        JSON.stringify(donations)
    );

    alert("Thank you for your donation of ₹" + amount + "!");

    location.reload();
}


// ===============================
// ADMIN DASHBOARD
// ===============================

if (document.getElementById("totalUsers")) {

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );

    if (!loggedInUser || loggedInUser.role !== "admin") {

        alert("Admin access required.");

        window.location.href = "login.html";

    } else {

        document.getElementById("totalUsers").textContent =
            users.filter(user => user.role === "user").length;

        document.getElementById("totalCampaigns").textContent =
            campaigns.length;

        document.getElementById("totalDonations").textContent =
            donations.length;

        displayAdminCampaigns();
    }
}


// ===============================
// ADMIN CAMPAIGN MANAGEMENT
// ===============================

function displayAdminCampaigns() {

    const container =
        document.getElementById("adminCampaignList");

    if (!container) return;

    container.innerHTML = "";

    if (campaigns.length === 0) {

        container.innerHTML = `
            <div class="campaign-card">
                <h3>No campaigns found</h3>
            </div>
        `;

        return;
    }

    campaigns.forEach(campaign => {

        const card = document.createElement("div");

        card.className = "campaign-card";

        card.innerHTML = `

            <h3>${campaign.title}</h3>

            <p>${campaign.description}</p>

            <p>
                <strong>Category:</strong>
                ${campaign.category}
            </p>

            <p>
                <strong>Target:</strong>
                ₹${campaign.target}
            </p>

            <p>
                <strong>Status:</strong>
                ${campaign.status}
            </p>

            <button
                class="btn"
                onclick="approveCampaign(${campaign.id})"
            >
                Approve
            </button>

            <button
                class="logout-btn"
                onclick="deleteCampaign(${campaign.id})"
            >
                Delete
            </button>
        `;

        container.appendChild(card);
    });
}


// ===============================
// APPROVE CAMPAIGN
// ===============================

function approveCampaign(id) {

    const campaign = campaigns.find(
        campaign => campaign.id === id
    );

    if (campaign) {

        campaign.status = "Approved";

        localStorage.setItem(
            "campaigns",
            JSON.stringify(campaigns)
        );

        alert("Campaign approved.");

        displayAdminCampaigns();
    }
}


// ===============================
// DELETE CAMPAIGN
// ===============================

function deleteCampaign(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this campaign?");

    if (!confirmDelete) return;

    campaigns = campaigns.filter(
        campaign => campaign.id !== id
    );

    localStorage.setItem(
        "campaigns",
        JSON.stringify(campaigns)
    );

    alert("Campaign deleted.");

    displayAdminCampaigns();
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("loggedInUser");

    alert("You have been logged out.");

    window.location.href = "index.html";
}
