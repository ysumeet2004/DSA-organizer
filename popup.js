document.addEventListener("DOMContentLoaded", () => {
    const tabs = ["create-sheet", "revision", "misc"];
    const topicsContainer = document.getElementById("topics-container");
    let currentTab = "create-sheet";
    
    // Default topics (these are the ones that exist initially)
    let topics = [
        "Array", "String", "Linked List", "Stack and Queue", "Hashing", "Trees",
        "Heap (Priority Queue)", "Graph", "Dynamic Programming", "Recursion and Backtracking",
        "Divide and Conquer", "Bit Manipulation", "Greedy Algorithms", "Mathematics",
        "Sorting and Searching", "Sliding Window", "Union Find (Disjoint Set)",
        "Trie (Prefix Tree)", "Segment Tree", "Binary Indexed Tree (Fenwick Tree)",
        "Mathematical Geometry"
    ];

    // Load the saved sections from chrome.storage
    function loadSections() {
        chrome.storage.local.get("userSections", (data) => {
            // If no custom sections are stored, use the default ones
            topics = data.userSections || topics;
            loadTopics();
        });
    }

    // Save the sections to chrome.storage
    function saveSections() {
        chrome.storage.local.set({ userSections: topics });
    }

    // Add Section Functionality
    const addSectionForm = document.createElement("div");
    addSectionForm.className = "add-section-form";
    addSectionForm.innerHTML = `
        <input type="text" id="new-section-name" placeholder="Enter section name" />
        <button id="add-section-button">Add</button>
    `;
    topicsContainer.parentNode.appendChild(addSectionForm);

    document.getElementById("add-section-button").addEventListener("click", () => {
        const newSectionName = document.getElementById("new-section-name").value.trim();
        if (!newSectionName) {
            alert("Section name cannot be empty.");
            return;
        }
        if (topics.includes(newSectionName)) {
            alert("Section already exists.");
            return;
        }
        topics.push(newSectionName); // Add to topics list
        saveSections(); // Save sections to storage
        loadTopics();
        document.getElementById("new-section-name").value = ""; // Clear input
    });

    // Function to handle smooth transition and topic rendering
    function switchTab(newTab) {
        if (currentTab === newTab) return;

        topicsContainer.classList.add("hidden");
        setTimeout(() => {
            currentTab = newTab;
            loadTopics();
            topicsContainer.classList.remove("hidden");
        }, 400);
    }

    // Function to save data in Chrome Storage for the current tab
    function saveTopicsData(tab, data) {
        const key = `topicsData_${tab}`;
        chrome.storage.local.set({ [key]: data });
    }

    // Function to load data from Chrome Storage for the current tab
    function loadTopicsData(tab, callback) {
        const key = `topicsData_${tab}`;
        chrome.storage.local.get(key, (result) => {
            callback(result[key] || {});
        });
    }

    // Function to fetch the active tab's URL via the background script
    function getActiveTabInfo(callback) {
        chrome.runtime.sendMessage({ action: "getActiveTab" }, (response) => {
            if (response.error) {
                console.error(response.error);
                return;
            }
            callback({
                title: response.title,
                url: response.url,
            });
        });
    }

    // Function to create the UI for each topic
    function createTopicUI(topicName, links = []) {
        const topicDiv = document.createElement("div");
        topicDiv.className = "topic";
        topicDiv.style.position = "relative";  // Ensure delete button appears correctly

        const topicHeader = document.createElement("h4");
        topicHeader.textContent = topicName;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "×";  // The "delete" cross sign
        deleteButton.className = "delete-section-btn";

        deleteButton.addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete the section "${topicName}"?`)) {
                // Remove from the topics array
                topics = topics.filter(topic => topic !== topicName);

                // Save the updated sections to storage
                saveSections();
                loadTopics();  // Reload sections
            }
        });

        const addButton = document.createElement("button");
        addButton.textContent = "+";
        addButton.className = "add-btn";

        const linkList = document.createElement("ul");
        linkList.className = "link-list";

        links.forEach(({ name, url }, index) => {
            const linkItem = document.createElement("li");

            const linkAnchor = document.createElement("a");
            linkAnchor.href = url;
            linkAnchor.textContent = name;
            linkAnchor.target = "_blank";

            const deleteLinkButton = document.createElement("button");
            deleteLinkButton.textContent = "Delete";

            deleteLinkButton.addEventListener("click", () => {
                loadTopicsData(currentTab, (data) => {
                    data[topicName].splice(index, 1);
                    saveTopicsData(currentTab, data);
                    loadTopics();  // Reload after deleting the link
                });
            });

            linkItem.append(linkAnchor, deleteLinkButton);
            linkList.appendChild(linkItem);
        });

        addButton.addEventListener("click", () => {
            getActiveTabInfo(({ title, url }) => {
                loadTopicsData(currentTab, (data) => {
                    if (!data[topicName]) data[topicName] = [];
                    data[topicName].push({ name: title, url });
                    saveTopicsData(currentTab, data);
                    loadTopics();  // Reload after adding new link
                });
            });
        });

        topicDiv.append(deleteButton, addButton, topicHeader);
        topicsContainer.appendChild(topicDiv);
        topicsContainer.appendChild(linkList);
    }

    // Function to load and render all topics for the current tab
    function loadTopics() {
        topicsContainer.innerHTML = "";
        loadTopicsData(currentTab, (data) => {
            topics.forEach((topic) => {
                createTopicUI(topic, data[topic] || []);
            });
        });
    }

    // Tab Switching Logic
    tabs.forEach((tab) => {
        document.getElementById(tab).addEventListener("click", () => {
            switchTab(tab);
            tabs.forEach((t) => {
                document.getElementById(t).classList.remove("active");
            });
            document.getElementById(tab).classList.add("active");
        });
    });

    // Load the stored sections initially
    loadSections();
});
