window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;
   console.log(key);

   if (key>=37 && key <= 40)
   {
        var pan=0;
        var tilt=0;
	switch(key)
        {
            case 37:
               pan=1;
               break;
            case 38:
               tilt=1;
               break;
            case 39:
               pan=-1;
               break;
            case 40:
               tilt=-1;
               break;
        }


   fetch('https://$DOMAIN/drive?tilt='+tilt+'&pan='+pan, { method: 'get', mode: 'no-cors' }
   ).then(function(response) {
       // do nothing
   }).catch(function(err) {
       alert('An error occured: '+err);
   });
   }

}
alert('Remote control scripts injected.');
