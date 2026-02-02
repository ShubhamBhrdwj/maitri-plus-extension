// Inject React UI script
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
script.type = "module";
document.documentElement.appendChild(script);