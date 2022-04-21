/*
 * HackerNew was created by DataFoundries LLC. The BrainTool company.
 * Copyright (C) 2022-present. MIT license <https://github.com/tconfrey/HackerNew/>
 * Tame your tabs and control your online life with BrainTool <https://braintool.org/>
 */


/* Page elements of interest */
const Topbar = document.getElementsByClassName("pagetop")[0];
const Type = document.getElementsByTagName('html')[0].getAttribute('op');
let Table, Tbody, Newtab;

/* hideAll setup */
if (['newest', 'news'].includes(Type)) {
    const hideButton = addHideButton();
    hideButton.addEventListener("click", hideAll);
    Table = document.getElementsByClassName('itemlist')[0];
    Tbody = Table.getElementsByTagName('tbody')[0];
    
    chrome.storage.local.get({'urlsToHide': []}, data => {
        if (data.urlsToHide.length) snipUrls(data.urlsToHide);
    });
}
/* newTabs setup */
if (['newest', 'news', 'front', 'ask', 'show', 'jobs'].includes(Type)) {
    Newtab = addNewTabsCheckbox();
    Newtab.addEventListener('change', () => setNewTabsOn(Newtab.checked));
    
    chrome.storage.local.get({'newTabsOn': true}, data => {
        setNewTabsOn(data.newTabsOn);
        Newtab.checked = data.newTabsOn;
    });
}

/* favicons setup. See https://news.ycombinator.com/item?id=31095046 */
chrome.storage.local.get({'faviconsOn': false}, data => {
    if (data.faviconsOn) showFavicons();
});
    
function showFavicons() {
    // See https://gist.github.com/frabert/48b12088441f6195ea9292c2a5a77e3a#file-favicons-js

    for(let link of document.links) {
        if(!link.href.match("ycombinator.com") && !link.href.match("javascript:void") && link.firstChild.nodeName !== "IMG"){
            const domain = new URL(link.href).hostname
            const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`
            const image = document.createElement('img')
            image.src = imageUrl
            image.width = 12
            image.height = 12
            image.style.paddingRight = '0.25em'
            image.style.paddingLeft = '0.25em'
            link.prepend(image)
        }
    }
}

function addHideButton() {
    // Add hideAll to header
    const bar = document.createTextNode(" | ");
    const hide = document.createElement("a");
    hide.innerText = "hideAll";
    hide.href="javascript:void(0);";
    hide.style.color = "darkgreen";
    Topbar.appendChild(bar);
    Topbar.appendChild(hide);
    return hide;
}

function addNewTabsCheckbox() {
    // Add newTab checkbox to header
    const span = document.createElement('span');
    span.innerHTML = " | <input type='checkbox' name='newtab' id='newtab' style='position:relative; top: 2px; accent-color: darkgreen; cursor: pointer'><label for='newtab'>newTabs</label>";
    span.style.color = "darkgreen";
    Topbar.appendChild(span);
    return document.getElementById('newtab');
}

function setNewTabsOn(t) {
    // Store newTabs value and set link destination appropriately
    chrome.storage.local.set({'newTabsOn': t});
    const titleLinks = document.getElementsByClassName('titlelink');
    if (t)
        Array.from(titleLinks).forEach(l => l.addEventListener('click', storyClick));
    else
        Array.from(titleLinks).forEach(l => l.removeEventListener('click', storyClick));
}

function storyClick(e) {
    // click on story link, send to background for opening in tg
    console.log('story clicked');
    const url = e.target.href;
    chrome.runtime.sendMessage({'url': url});
    e.preventDefault();
    e.stopPropagation();
}

async function hideAll() {
    // Iterate thru 'hide' links removing element and storing link. Then get more
    const hideLinks = Array.from(document.querySelectorAll("td.subtext .clicky"));
    let urlsToHide = [];

    for (const clicky of hideLinks) {
        let url = clicky.href.replace('hide', 'snip-story').replace(/&goto.*/, '');
        urlsToHide.push(url);
        removeElement(clicky.parentNode.parentNode);
        await timeout(50);
    };
    chrome.storage.local.set({'urlsToHide': urlsToHide});
    document.getElementsByClassName('morelink')[0].click();
}

function removeElement(tr) {
    // remove this news item. this is the middle of 3 table rows
    const parent = tr.parentNode;
    parent.removeChild(tr.previousSibling);
    parent.removeChild(tr.nextElementSibling);
    parent.removeChild(tr);
}

async function snipUrls(urls) {
    // iterate thru urls w snip story details and send to yc, throttle and backoff as needed

    while(urls.length) {
        let url = urls.shift();
        console.log('snipping: ', url);
        let wait = 64;
        let rsp = await fetch(url);
        while (!rsp.ok) {
            console.log(`waiting ${wait}ms`);
            await timeout(wait);
            wait = wait * 2;
            rsp = await fetch(url);
        }
    }
    chrome.storage.local.set({'urlsToHide': []});
}

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
