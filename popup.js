document.getElementById("open").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      document.dispatchEvent(new CustomEvent("OPEN_MAITRI_PLUS"));
    }
  });
};
