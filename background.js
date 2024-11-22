chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getActiveTab") {
        // Query the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab) {
                sendResponse({
                    title: activeTab.title || "Untitled",
                    url: activeTab.url || "No URL available",
                });
            } else {
                sendResponse({ error: "No active tab found" });
            }
        });

        // Return true to indicate that the response is asynchronous
        return true;
    }
});
