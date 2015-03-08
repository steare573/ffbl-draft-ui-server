var DRAFTCLIENT = {};
(function (globalClient, window) {
  function getQueryStringData(queryString) {
    if(!queryString) queryString = window.location.search.substr(1);
    var a = queryString.split('&');
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;

  };

  function generateInitData () {
    var queryData = getQueryStringData();

    return {
      username: queryData.username,
      roomId: queryData.roomId
    }
  };

	var primus = Primus.connect('http://localhost:3000');
  var initData = generateInitData();
  console.log(initData);
  primus.send('init', generateInitData());
	primus.send('room.getAllUsers', {data: 'myData'});
	primus.on('room.getAllUsers.response', function (data) {
		console.log(data);		
	});

	globalClient = globalClient || {};
	

})(DRAFTCLIENT, window);
