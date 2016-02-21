// ==UserScript==
// @name       BGG Shortcuts
// @namespace  BGG Shortcuts
// @version    0.8.1
// @description  Keyboard shortcuts for the Geek
// @include     http://*.boardgamegeek.*/*
// @include     http://boardgamegeek.*/*
// @include     https://*.boardgamegeek.*/*
// @include     https://boardgamegeek.*/*
// @copyright  2013+, JB McMichael
// ==/UserScript==

/*
 * CHANGLOG::
 * ============================================
 * 0.8.1 - Updated to work on https
 * 0.8.0 - Forum links pop up in a modal so that you don't lose your place on a page
 * 0.7.0 - Changed the links to just be J for next item, H for home, and / for search, but disabled shortcuts in form elements
 * 0.6.1 - Give the page some time to load its scripts before changing links
 * 0.6.0 - Added a shortcut to go to the searchbox Ctrl + /
 * 0.5.0 - Added homepage links opening in new tab
 * 0.4.0 - If search returns one result just go to that result
 * 0.3.0 - Added homepage shortcut; Ctrl + Shift + H
 * 0.2.0 - Cleaned up the subscription jump link
 * 0.1.0 - First version, shortcut for subscriptions; Ctrl + M
 * 
 */

(function () {
    "use strict";
    console.log('Loaded BGG Shortcuts');
    
    document.body.addEventListener('keydown', function(e) {
        var active = document.activeElement.tagName.toLowerCase(),
            badElements = ['input', 'textarea', 'select'];

        // ignore shortcuts if we are in some form of input
        if (badElements.indexOf(active) === -1) {
            
            // Next subscription item J
            if (e.keyCode === 74) {
                [].slice.call(document.querySelectorAll("img:not(dn).nextsubcol"))[0].parentNode.parentNode.click();
            }
            
            // Home page H
            if (e.keyCode === 72 && window.location.href !== window.location.origin) {
                window.location.href = window.location.origin;
            }
            
            // Search box jump /
            if (e.keyCode === 191) {
                var searchbox = document.getElementById('sitesearch');
                document.body.scrollTop = 0;
                searchbox.focus();
                window.setTimeout(function() { searchbox.value = ''; }, 10);
            }
        }
        
    }, false);
    
    //check for one result on the search page
    if (window.location.pathname === '/geeksearch.php' && window.location.search.search(/action=search/)) {
        var results = document.querySelectorAll('#collectionitems tbody tr');
        console.log('We are searching');
        if (results.length === 2) {
            console.log('Found just one result, redirect');
            var link = results[1].querySelectorAll('#results_objectname1 a'),
                href = link[0].getAttribute('href');
            
            window.location.href = window.location.origin + href;
        }
    }
    
    // set all homepage module links to open in new tab
    if (window.location.pathname === '/') {
        window.setTimeout(function(){
            console.log('Changing homepage links');
            var links = document.querySelectorAll('.innermoduletable tbody td a.ng-binding'),
                linkArray = [].slice.call(links);
        
            linkArray.forEach(function(item, index){
                item.setAttribute('target', '_blank');
            });
        },500);
    }

    // popup forum links in a dialog
       if (window.location.pathname.split('/')[1] === 'boardgame') {
           // grab all forum link clicks        
           document.addEventListener('click', forumClick, false);
       }
       
       function forumClick(e) {        
           if (e.target.tagName === 'A' && e.target.href.split('/')[3] === 'thread') {
               e.preventDefault();
               
               // use the BGG API to get the thread
               var req = new XMLHttpRequest(),
                   apiUrl = window.location.protocol + '//' + window.location.host + '/xmlapi2/thread?id=',
                   diag = document.createElement('dialog'),
                   content = document.createElement('div'),
                   close = document.createElement('button'),
                   thread = e.target.href.split('/')[4];
               
               diag.style.width = '80%';
               diag.style.height = '80%';
               diag.style.border = '2px solid rgba(0, 0, 0, 0.3)';
               diag.style.borderRadius = '6px';
               diag.style.boxShadow = '0 3px 7px rgba(0, 0, 0, 0.3)';
               
               content.style.overflowY = 'auto';
               content.style.height = '95%';
               content.style.margin = '5px 0px';
               
               close.innerText = 'Close';
               
               req.onreadystatechange = showContents;
               
               req.open('GET', apiUrl + thread, true);
               
               req.send();
               
               function showContents(e) {
                   if (req.readyState === 4 && req.status === 200) {
                       var subject = req.responseXML.documentElement.children[0].firstChild.nodeValue,
                           articles = req.responseXML.documentElement.children[1].children;
                       
                       for (var i = 0; i < articles.length; i++) {
                           var article = articles[i];
                           var user = article.getAttribute('username');
                           var title = article.children[0].firstChild.nodeValue;
                           var body = article.children[1].firstChild.nodeValue;
                           var postdate = article.getAttribute('postdate');
                           var articleDiv = document.createElement('div');
                           var dl = document.createElement('dl');
                           var ddLeft = document.createElement('dd');
                           var ddRight = document.createElement('dd');
                           var userDiv = document.createElement('div');
                           var bottomDl =document.createElement('dl');
                           var ddLeft2 = document.createElement('dd');
                           var ddCommands = document.createElement('dd');
                           var ul = document.createElement('ul');
                           var li = document.createElement('li');
                           var ulInfo = document.createElement('ul');
                           var liInfo = document.createElement('li');
                           var postLink = document.createElement('a');
                           var clearDiv = document.createElement('div');
                           var rollsDiv = document.createElement('div');
                           var userInfo = getUser(user);
                           
                           articleDiv.addClass('article');
                           
                           rollsDiv.addClass('rollsblock');
                           
                           ddLeft.addClass('left');
                           ddRight.addClass('right');
                           userDiv.addClass('username');
                           userDiv.innerHTML = user;
                           
                           ddLeft.appendChild(userDiv);
                           ddRight.innerHTML = body;
                           
                           dl.appendChild(ddLeft);
                           dl.appendChild(ddRight);
                           
                           articleDiv.appendChild(dl);
                           
                           ddLeft2.addClass('left');
                           ddCommands.addClass('commands');
                           
                           ul.appendChild(li);
                           ddCommands.appendChild(ul);
                           
                           clearDiv.addClass('clear');
                           ulInfo.addClass('information');
                           
                           postLink.innerHTML = postdate;
                           liInfo.appendChild(postLink);
                           ulInfo.appendChild(liInfo);
                           ddCommands.appendChild(ulInfo);
                           
                           bottomDl.appendChild(ddLeft2);
                           bottomDl.appendChild(ddCommands);
                           
                           articleDiv.appendChild(bottomDl);
                           articleDiv.appendChild(clearDiv);
                           articleDiv.appendChild(rollsDiv);
                           
                           content.appendChild(articleDiv);
                       }
                       
                       diag.insertBefore(close, diag.childNodes[0]);
                       diag.insertBefore(content, diag.childNodes[0]);
                       close.addEventListener('click', function(e) { diag.close(); });
                       document.body.insertBefore(diag,document.body.childNodes[0]);
                       diag.showModal();
                   }
               }
           }
       }
       
       function getUser(name) {
           var req = new XMLHttpRequest(),
               apiUrl = window.location.protocol + '//' + window.location.host + '/xmlapi2/user?name=' + name;
           
           req.onreadystatechange = function(e) {
               if (req.readyState === 4 && req.status === 200) {
                console.log(req.responseXML);
               }
           };
           
           req.open('GET', apiUrl, true);
           
           req.send();
       }
}());