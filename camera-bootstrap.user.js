//as suggested in http://superuser.com/questions/496212/shortcut-to-open-specific-bookmark-url-in-chrome

// ==UserScript==
// @name          Camera Head Launcher
// @description   Injects remote control scripts for camera head on Ctrl+Alt+C
// ==/UserScript==

var cameraLauncherSetup = (function() {
    window.addEventListener('keyup', function() {
        if(event.ctrlKey && event.altKey && !event.shiftKey)
            if(String.fromCharCode(event.keyCode)=='C') {
                var a=document.createElement('script');
                a.setAttribute('src','https://$DOMAIN/keyboard.js');
                document.body.appendChild(a);
            }
    });
}());
