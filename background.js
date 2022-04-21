/*
 * HackerNew was created by DataFoundries LLC. The BrainTool company.
 * Copyright (C) 2022-present. MIT license <https://github.com/tconfrey/HackerNew/>
 * Tame your tabs and control your online life with BrainTool <https://braintool.org/>
 */


chrome.runtime.onMessage.addListener(async (msg, sender) => {
    // Open a tab w url as requested. Put it in the HackerNew tabgroup if it exists, create if not
    const url = msg.url;
    const hnTab = sender.tab.id;
    const hnWin = sender.tab.windowId;
    
    const tgs = await chrome.tabGroups.query({'title': 'HackerNew'});
    let tgid = tgs.length ? tgs[0].id : null;

    const tab = await chrome.tabs.create({'url': url});
    const args = tgid ?
          {'groupId': tgid, 'tabIds': [hnTab, tab.id]} :
          {'createProperties': {'windowId': hnWin}, 'tabIds': [hnTab, tab.id]};
//    const args = tgid ? {'groupId': tgid, 'tabIds': [hnTab, tab.id]} : {'tabIds': [hnTab, tab.id]};

    tgid = await chrome.tabs.group(args);
    chrome.tabGroups.update(tgid, {'title': 'HackerNew', 'color': 'orange'});
});
        
