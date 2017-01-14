;(function() {

  var strings = [
    "The game is brought to You by a little group from Slovakia. ",
    "Not always larger wins. Sometimes the faster is better. ",
    "In bonus world You are able to take runes, which may modify Your speed or size. ",
    "Show must go on, even if You die. ",
    "You can use Your active by left clicking on the screen, it will make You move faster, but loosing food. ",
    "If You are experiencing the server to be laggy, click on the ads so we can afford to buy a new server. "
  ];

  $('div#footer').append('<marquee>Welcome to GoFishy.io, we are glad to see You here. There are some simple rules which would help You to become the largest. </marquee>');
  var lastId = -1;
  var interval = setInterval(function() {

    if($('div#footer marquee').length == 0)
      clearInterval(interval);

    var newId = Math.floor(Math.random() * strings.length);
    while(newId == lastId) {
      newId = Math.floor(Math.random() * strings.length);
    }
    $('div#footer marquee').append(strings[newId]);
    lastId = newId;
  }, 500);
})();
