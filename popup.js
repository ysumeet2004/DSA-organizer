document.addEventListener("DOMContentLoaded", () => {
    const tabs = ["create-sheet", "revision", "misc"];
    const topicsContainer = document.getElementById("topics-container");
    let currentTab = "create-sheet"; // Default active tab

    const topics = [
        "Array", "String", "Linked List", "Stack and Queue", "Hashing", "Trees",
        "Heap (Priority Queue)", "Graph", "Dynamic Programming", "Recursion and Backtracking",
        "Divide and Conquer", "Bit Manipulation", "Greedy Algorithms", "Mathematics",
        "Sorting and Searching", "Sliding Window", "Union Find (Disjoint Set)",
        "Trie (Prefix Tree)", "Segment Tree", "Binary Indexed Tree (Fenwick Tree)",
        "Mathematical Geometry"
    ];

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

        const topicHeader = document.createElement("h4");
        topicHeader.textContent = topicName;

        // Add Button for Auto-detection
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

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                loadTopicsData(currentTab, (data) => {
                    data[topicName].splice(index, 1);
                    saveTopicsData(currentTab, data);
                    loadTopics();
                });
            });

            linkItem.append(linkAnchor, deleteButton);
            linkList.appendChild(linkItem);
        });

        // On clicking the + button, fetch the current tab's URL and add it
        addButton.addEventListener("click", () => {
            getActiveTabInfo(({ title, url }) => {
                loadTopicsData(currentTab, (data) => {
                    if (!data[topicName]) data[topicName] = [];
                    data[topicName].push({ name: title, url });
                    saveTopicsData(currentTab, data);
                    loadTopics();
                });
            });
        });

        topicDiv.append(addButton, topicHeader);
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
            currentTab = tab; // Set the active tab
            tabs.forEach((t) => {
                document.getElementById(t).classList.remove("active");
            });
            document.getElementById(tab).classList.add("active");
            loadTopics();
        });
    });

    // Initial Load
    loadTopics();
});
