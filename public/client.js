$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize varibles
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username

    var $loginPage = $('#loginPage'); // The login page
    var $mapPage = $('#mapPage'); // The chatroom page
    var $adminPanel = $('#adminPanel');

    // Prompt for setting a username
    var username;
    var connected = false;

    var adminName = "a";

    var socket = io();
    
    var myStatus = "";

    //Run these immediately on start.

    if (getCookie('username')) {
        username = getCookie('username');
        $loginPage.hide();
        showPage();
        initMap();
        $loginPage.off('click');
        connected = true;
        socket.emit('add user', username);
    }
    //Admin stuff for changing users statuses.
    $('#changeStatus').click(function(){
        var a = $('#userDropDown').val();
        var b = $('#Status').val();
        socket.emit('changeStatus', a, b);
    });

    function checkUsername(){
        username = cleanInput($usernameInput.val().trim());
        if (username) {
            socket.emit('username list');
        }
    }

    // Sets the client's username
    function setUsername () {
        $loginPage.fadeOut();
        showPage();
        initMap();
        $loginPage.off('click');

        //set username locally
        setCookie('username', username);
        
        // Tell the server your username
        socket.emit('add user', username);
    }

    function sendPosition(position) {
        if(connected) {
            socket.emit('gps position', position.coords.latitude, position.coords.longitude);
        }
        updatePlayerPosition(position);
    }

    // Click events

    // Focus input when clicking anywhere on login page
    $loginPage.click(function () {
        $usernameInput.focus();
    });

    //Keyboard Event
    $window.keydown(function(event){
        if(event.which === 13 && !connected){
            checkUsername();
        }
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        connected = true;
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

    // Whenever the server emits 'user reconnected', log it in the chat body
    socket.on('user reconnected', function (data) {
        addParticipantsMessage(data);
    });

    socket.on('change status', function(status){
        myStatus = status;
    });

    socket.on('usernames sent', function(data) {
        var found = false;
        for(var user in data){
            if(user == username){
                found = true;
                alert("Username is currently in use, please use a different username.");
                username = "";
            }
        }
        if(!found){
            setUsername();
        }
    });

    //Admin socket
    socket.on('appendDropDown', function(username){
        $('#userDropDown').append( new Option(username, username));

    });
    socket.on('removeDropDown', function(username){
        if(username == adminName){
            userDropDown.remove(username);            
        }
    });

    setInterval(function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(sendPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, 1000);
    function showPage(){
        if(username != adminName){
            $(adminPanel).hide(); 
        }
        else{
            $(adminPanel).show();
        }
        $(mapPage).show();
    }

    // Prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).text();
    }
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }

});

