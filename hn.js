
const openT = document.getElementById("openT");
chrome.storage.local.get({'newTabsOn': true}, data => {
    if (data.newTabsOn) openT.checked = true;
    else openT.checked = false;
});
openT.addEventListener('change', e => {
    if (openT.checked)
        chrome.storage.local.set({'newTabsOn': true});
    else
        chrome.storage.local.set({'newTabsOn': false});
});

const favicons = document.getElementById("favicons");
chrome.storage.local.get({'faviconsOn': false}, data => {
    if (data.faviconsOn) favicons.checked = true;
    else favicons.checked = false;
});
favicons.addEventListener('change', e => {
    if (favicons.checked)
        chrome.storage.local.set({'faviconsOn': true});
    else
        chrome.storage.local.set({'faviconsOn': false});
});
