
/* Insert hideAll button on applicable pages */
const Topbar = document.getElementsByClassName("pagetop")[0];
const Type = document.getElementsByTagName('html')[0].getAttribute('op');
let Table, Tbody, NextId, Newtab;
if (['newest', 'news'].includes(Type)) {
    const hide = addHide();
    hide.addEventListener("click", hideAll);
    Table = document.getElementsByClassName('itemlist')[0];
    Tbody = Table.getElementsByTagName('tbody')[0];
    NextId = parseFloat(document.getElementsByClassName('morelink')[0].href.split('next=')[1]);
}

if (['newest', 'news', 'front', 'ask', 'show', 'jobs'].includes(Type)) {
    Newtab = addNewTabs();
    Newtab.addEventListener('change', () => setTitleTarget(Newtab.checked));
    
    chrome.storage.local.get({'titleTarget': true}, tt => {
        setTitleTarget(tt.titleTarget);
        Newtab.checked = tt.titleTarget;
    });
}

function addHide() {
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

function addNewTabs() {
    // Add newTab to header
    const span = document.createElement('span');
    span.innerHTML = " | <input type='checkbox' name='newtab' id='newtab' style='position:relative; top: 2px; accent-color: darkgreen; cursor: pointer'><label for='newtab'>newTabs</label>";
    span.style.color = "darkgreen";
    Topbar.appendChild(span);
    return document.getElementById('newtab');
}

function setTitleTarget(t) {
    chrome.storage.local.set({'titleTarget': t});
    const titleLinks = document.getElementsByClassName('titlelink');
    if (t)
        Array.from(titleLinks).forEach(l => l.target = '_blank');
    else
        Array.from(titleLinks).forEach(l => l.removeAttribute('target'));
}

async function hideAll() {
    // Iterate thru 'hide' links removing element and requesting replacement
    const hidelinks = Array.from(document.querySelectorAll("td.subtext .clicky"));

    while (hidelinks.length) {
        let clicky = hidelinks.shift();
        try {
            let url = clicky.href.replace('hide', 'snip-story').replace('goto', 'onop');
            url += '&next='+NextId;
            let json = await loadNext(url);
            if (json) {
                NextId = json[1];
                removeElement(clicky.parentNode.parentNode);
                addElement(json[0]);
            }
        } catch (err) {
            console.log(err);
        }
    }
    setTitleTarget(Newtab.checked);          // add traget to newly populated stories
}

async function loadNext(url) {
    let rsp, rj, wait = 64;
    try {
        console.log('fetching: ', url);
        rsp = await fetch(url);
        while (!rsp.ok) {
            console.log(`waiting ${wait}ms`);
            await timeout(wait);
            wait = wait * 2;
            rsp = await fetch(url);
        }
        rj = await rsp.json();
        return rj;
    } catch (err) {
        console.log(err);
        return null;
    }
}
    
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addElement(elt) {
    lastElt = Array.from(document.querySelectorAll('.spacer')).pop();
    lastElt.insertAdjacentHTML('afterend', elt + lastElt.outerHTML);

    const ranks = Array.from(document.getElementsByClassName('rank'));
    let first = parseInt(ranks[0].textContent);
    ranks.forEach(r => r.innerText = first++ + '.');
}

function removeElement(tr) {
    // remove this news item. this is the middle of 3 table rows
    const parent = tr.parentNode;
    parent.removeChild(tr.previousSibling);
    parent.removeChild(tr.nextElementSibling);
    parent.removeChild(tr);
}
