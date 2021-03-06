var GPS_UPDATE_INTERVAL = 1000;

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
    var $playerPanel = $('#playerPanel');

    // Prompt for setting a username
    var username;
    var connected = false;

    var ADMIN_NAME = "a";

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
        getStatus();
    }
    //Admin stuff for changing users statuses.
    $('#changeStatus').click(function(){
        var a = $('#userDropDown').val();
        var b = $('#Status').val();
        socket.emit('changeStatus', a, b);
    });

    $('#changeEscaped').click(function(){
        var a = $('#userDropDown').val();
        var b = $('#escaped').val();
        socket.emit('changeEscaped', a, b);
    });
    
    $('#startGame').click(function(){
        socket.emit('game started');
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
        getStatus();
    }

    function sendPosition(position) {
        if(connected) {
            socket.emit('gps position', position.coords.latitude, position.coords.longitude);
        }
        updatePlayerPosition(position);
    }

    function getStatus(){
        socket.emit('get status', username);
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

    socket.on('change status', function(status){
        myStatus = status;
        var text = "";
        if(myStatus == "SURV"){
            text = "Survivor";
        }
        else if(myStatus == "ZOMB"){
            text = "Zombie";
        }
        else{
            text = "Dead";
        }
        $("#currentStatus").text("Status: " + text);
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

    socket.on('survivor ping', function(data) {
        updateSurvivorPositions(data);
    });

    socket.on('zombie ping', function(data) {
        updateZombiePositions(data);
    });

    //Admin socket
    socket.on('appendDropDown', function(username){
        $('#userDropDown').append( new Option(username, username));
    });

    socket.on('removeDropDown', function(username){
        userDropDown.remove(username);            
    });

    socket.on('populate users', function(users){
        for(var user in users){
            $('#userDropDown').append( new Option(user, user));
        }
    });

    socket.on('successful escape', function(){
        alert("Congratulations! You are win!");
    });

    socket.on('announce start', function() {
        //TODO add anything for user side on start up
        //alert("Game has started");
        myStatus = "SURV";
    });

    socket.on('debug', function(message){
        alert(message);
    });

    setInterval(function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(sendPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, GPS_UPDATE_INTERVAL);

    function showPage(){
        if(username != ADMIN_NAME){
            $(adminPanel).hide();
            $(playerPanel).show();
        }
        else{
            $(playerPanel).hide();
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
