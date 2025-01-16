const updateGroupTabSafe = (groupId: number | undefined, updateProperties: chrome.tabGroups.UpdateProperties) => {
    if (groupId !== undefined && groupId > 0) {
        chrome.tabGroups.update(groupId, updateProperties);
    }
}

const updateTabGroups = (currentTabIndex: number, newTabIndex: number, allTabs: chrome.tabs.Tab[]) => {
    const currentGroupId = allTabs[currentTabIndex].groupId;
    const newGroupId = allTabs[newTabIndex].groupId;

    if (currentGroupId !== newGroupId) {
        updateGroupTabSafe(currentGroupId, { collapsed: true });
        updateGroupTabSafe(newGroupId, { collapsed: false });
    }
}

const updateTab = (command: string, currentTabIndex: number, allTabs: chrome.tabs.Tab[]) => {
    const cnt = allTabs.length;
    const offset = (command === "switch_tab_left") ? -1 : 1;
    const newIndex = (currentTabIndex + offset + cnt) % cnt;
    const newTabId = allTabs[newIndex].id ?? currentTabIndex;
    updateTabGroups(currentTabIndex, newIndex, allTabs);
    chrome.tabs.update(newTabId, { active: true });
}

chrome.commands.onCommand.addListener((command: string) => {
    if (command === "switch_tab_left" || command === "switch_tab_right") {
        chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs: chrome.tabs.Tab[]) => {
            if (activeTabs.length === 0) {
                return;
            }
            const currentTabIndex = activeTabs[0].index;
            chrome.tabs.query({ currentWindow: true }, (allTabs: chrome.tabs.Tab[]) => {
                updateTab(command, currentTabIndex, allTabs);
            });
        });
    }

    if (command === "pop_new_window") {
        chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs: chrome.tabs.Tab[]) => {
            if (activeTabs.length === 0) {
                return;
            }
            const tabId = activeTabs[0].id;
            chrome.windows.create({ tabId, focused: true });
        });
    }
});