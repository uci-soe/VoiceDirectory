window.onload = function(){
            
    var timeLeft = 45; // System countdown after initiation
    var timeToAsk = 30; // System will ask if user wants more time after this amount of seconds
    var timeToAsk2 = 15 // Second time asking
    var timeToEnd = 1; // System will reset the system with this amount of seconds left
    var grantTime = 45; // System will grant user extra time (grantTime will be set equal to "timeLeft")

    var roomLocator_active = false;
    var facultyLocator_active = false;

    var timer;
    var systemTimer_interval = 1000;

    var systemAsked = false; // Check if system has asked user for more time
    var yes = false;
    var no = false;

    // System's General Voice Responses
    var output_repeat = "Could you repeat that, please?";
    var output_moreTime = "Do you need more time?";
    var output_systemReset = "System will reset.";
    var output_ok = "Ok";


    // annyang Locator functions
    var roomLocator;
    var facultyLocator;

    var commands = {};
    
    
    //*********************************************************************************************************   FUNCTION DECLARATIONS

    $('#screen-menu').hide();
    
    function endSystem() {
        responsiveVoice.speak(output_systemReset); 
        window.location.reload();
    }
    
    function systemPause(wordCount) {

        $('#listening').html("Not Listening");
        annyang.pause();

        setTimeout(function(){ 
            annyang.resume() 
            $('#listening').html("Listening");
            }, wordCount*650);
    }
    function isLocatorActive() {
        return roomLocator_active || facultyLocator_active;
    }

    function moretime() {
        if(yes) {
            timeLeft = grantTime;
            systemPause(output_ok.split(' ').length);

            responsiveVoice.speak(output_ok);
            systemAsked = false;
            yes = false;
        }
        else if(no)
            endSystem();
    }

    function systemTimer() {                        
        timer = setTimeout(function(){

            timeLeft--; $('#timeLeft').html(timeLeft);
            if(timeLeft == timeToAsk || timeLeft == timeToAsk2) {
                if(!isLocatorActive()) {
                    responsiveVoice.speak(output_moreTime);
                    systemPause(output_moreTime.split(' ').length);
                    systemAsked = true; 
                }

                systemTimer();
            }   
            else if(timeLeft == timeToEnd)
                endSystem();
            else
                systemTimer();

            roomLocator_active = false;
            facultyLocator_active = false;

        },systemTimer_interval);
    }

    function startSystem(data) {              
        systemTimer();

        roomLocator = function(room_num) {  
            if(!(room_num in data.rooms)){
                responsiveVoice.speak(output_repeat);
                systemPause(output_repeat.split(' ').length);
            }                        
            else {
                roomLocator_active = true;
                responsiveVoice.speak(data.rooms[room_num].voiceResponse); 
            }
            timeLeft = grantTime;
            systemPause((data.rooms[room_num].voiceResponse).split(' ').length);
        };

        facultyLocator = function(fac_name) {  
            if(!(fac_name in data.faculty)) {
                responsiveVoice.speak(output_repeat); 
                systemPause(output_repeat.split(' ').length);
            }
            else {
                facultyLocator_active = true;
                responsiveVoice.speak(data.faculty[fac_name].voiceResponse);
            }
            timeLeft = grantTime;
            systemPause((data.faculty[fac_name].voiceResponse).split(' ').length);

        };

        var yesFunc = function() {
            if(systemAsked) {
                yes = true;
                moretime();
            }
            else {
                responsiveVoice.speak(output_repeat);
                timeLeft = grantTime;
                systemPause(output_repeat.split(' ').length);
            }
        };
        var noFunc = function() {
            if(systemAsked) {
                no = true;
                moretime();
            }
            else{
                responsiveVoice.speak(output_repeat);
                timeLeft = grantTime;
                systemPause(output_repeat.split(' ').length);
            }
        };

        commands = {
            'where is room *room_num' : roomLocator,
            'room *room_num' : roomLocator,

            'where is professor *fac_name' : facultyLocator,
            'professor *fac_name' : facultyLocator,

            'yes' : yesFunc,
            'no' : noFunc,
            'reset' : endSystem
        };
        annyang.addCommands(commands);
        annyang.start({continuous: false}); 
        $('#listening').html("Listening");

    }
    
    //*********************************************************************************************************   SYSTEM START

    $('#startButton').click(function(){

        $('#startButton').fadeOut();
        $('#screen-home').hide();
        $('#screen-menu').fadeIn();

        if (annyang) {

            var ajaxhttp = new XMLHttpRequest();
            var url = "data.json";

            ajaxhttp.open("GET", url, true);
            ajaxhttp.setRequestHeader("content-type", "application/json");

            ajaxhttp.onreadystatechange = function () {
                if(ajaxhttp.readyState == 4 && ajaxhttp.status == 200)
                    startSystem(JSON.parse(ajaxhttp.responseText));
            }
            ajaxhttp.send(null);
        }

    });
    
    $('#endButton').click(function(){
        endSystem();
    });
    


}