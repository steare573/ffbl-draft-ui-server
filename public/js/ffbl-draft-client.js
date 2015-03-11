var DRAFTCLIENT = {};
(function (globalClient, window, document, $) {
  $(document).ready(function () {
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

    function renderChat(msgArray) {
      $('.conversation').html('');
      msgArray.forEach(function (obj) {
        
        var message =  '<div><span class="username">' + obj.username + ':</span><span class="message">' + obj.message + '</span></div>';
        $('.conversation').append(message);
      });
    };

    var queryData = getQueryStringData();
    var primus = Primus.connect('http://localhost:3000');
    var initData = generateInitData();
    var players = [];

    console.log(initData);
    primus.send('init', generateInitData());
    primus.send('room.getAllUsers', {data: 'myData'});
    primus.on('room.getAllUsers.response', function (data) {
      console.log('room.getAllUsers.response', data);   
    });
    
    primus.send('chat.getConversation', {
      username: queryData.username,
      roomId: queryData.roomId,
    });

    primus.send('player.getAvailable', {
      username: queryData.username,
      roomId: queryData.roomId,
    });

    primus.on('player.getAvailable.response', function (data) {

      players = data.data;
      $('.component-players-available ul').html('');
      players.forEach(function (player) {
        $('.component-players-available ul')
          .append('<li>' + player.firstName + ' ' + player.lastName + '<span class="player-draft-link" data-playerid="' + player.id + '">Draft</span><span class="player-queue-link" data-playerid="' + player.id + '">Queue</span></li>');
      });
    });

    primus.send('player.getQueued', {
      username: queryData.username,
      roomId: queryData.roomId
    });

    primus.on('player.getQueued.response', function (data) {
      $('.component-players-queued ul').html('');
      data.data.forEach(function (player) {
        $('.component-players-queued ul')
          .append('<li>' + player.firstName + ' ' + player.lastName + '<span class="player-draft-link" data-playerid="' + player.id + '">Draft</span><span class="player-unqueue-link" data-playerid="' + player.id + '">Unqueue</span></li>');
      
      });
    }.bind(this));

    primus.send('player.getDrafted', {
      username: queryData.username,
      roomId: queryData.roomId
    });
    primus.on('player.getDrafted.response', function (data) {
      $('.draftboard ul').html('');
      data.data.forEach(function (player, key) {
        $('.draftboard ul').append('<li>' + (key + 1) + ': ' + player.firstName + ' ' + player.lastName + '</li>');
        
      });
    });

    $('.list').on("click", '.player-draft-link', function () {
      primus.send('player.draft', {
        playerId: $(this).data('playerid'),
        username: queryData.username,
        roomId: queryData.roomId,
      });
    });

    $('.list').on('click', '.player-queue-link', function () {
      primus.send('player.queue', {
        playerId: $(this).data('playerid'),
        username: queryData.username,
        roomId: queryData.roomId,
      })
    });
    
    $('.queue').on('click', '.player-draft-link', function () {
      console.log('draft from queue');
      primus.send('player.draft', {
        playerId: $(this).data('playerid'),
        username: queryData.username,
        roomId: queryData.roomId,
      });
    });

    $('.queue').on('click', '.player-unqueue-link', function () {
        console.log('unqueue player');
        primus.send('player.unqueue', {
          playerId: $(this).data('playerid'),
          username: queryData.username,
          roomId: queryData.roomId,
        });
    });
    primus.on('player.queue.response', function (data) {

      $('.component-players-queued ul').html('');
      data.data.forEach(function (player) {
        $('.component-players-queued ul')
          .append('<li>' + player.firstName + ' ' + player.lastName + '<span class="player-draft-link" data-playerid="' + player.id + '">Draft</span><span class="player-unqueue-link" data-playerid="' + player.id + '">Unqueue</span></li>');
      
      });
    });

    primus.on('player.unqueue.response', function (data) {
      $('.component-players-queued ul').html('');
      data.data.forEach(function (player) {
        $('.component-players-queued ul')
          .append('<li>' + player.firstName + ' ' + player.lastName + '<span class="player-draft-link" data-playerid="' + player.id + '">Draft</span><span class="player-unqueue-link" data-playerid="' + player.id + '">Unqueue</span></li>');
      
      });
    });
    
    primus.on('player.draft.response', function (data) {
      primus.send('player.getQueued', {
        roomId: queryData.roomId,
        username: queryData.username
      });

      primus.send('player.getAvailable', {
        roomId: queryData.roomId,
        username: queryData.username
      });

      primus.send('player.getDrafted', {
        roomId: queryData.roomId,
        username: queryData.username
      });
    });

    primus.on('chat.getConversation.response', function (data) {
      renderChat(data.data);
    });
    primus.on('chat.sendMessage.response', function (data) {
      renderChat(data.data);
    });


    $('.submit-message').click(function () {
      
      var payload = {
        username: queryData.username,
        roomId: queryData.roomId,
        message: $('.user-message').val()
      }
      console.log('we done sent it', payload);
      primus.send('chat.sendMessage', payload);
    });
    globalClient = globalClient || {};
});
  
	

})(DRAFTCLIENT, window, document, jQuery);
