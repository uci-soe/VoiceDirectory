window.onload = function(){
            
    var timeLeft = 35; // System countdown after initiation
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
    
    var resultShown = false;

    // System's General Voice Responses
    var output_speak = "Please speak your request!";
    var output_repeat = "Could you repeat that, please?";
    var output_moreTime = "Do you need more time?";
    var output_systemReset = "System will reset.";
    var output_ok = "Ok";
    var welcome = "Hello, what can I help you with today?";


    // annyang Locator functions
    var roomLocator;
    var facultyLocator;

    var commands = {};
    
    //*********************************************************************************************************   FUNCTION DECLARATIONS

//    $(".intro-block").hide();
    $(".menu-block").hide();
    $(".result-block").hide();
    $("#systemMic").hide();
    $("#subtitle").hide();
   
    function endSystem() {
        responsiveVoice.speak(output_systemReset); 
        window.location.reload();
    }
    
    function systemPause(word, wordCount) {

        $('#subtitle').html(word);
        annyang.pause();

        setTimeout(function(){ 
            annyang.resume() 
            $('#subtitle').html("I'm Listening...");
            }, wordCount*650);
    }
    
    function displayResult(data, inputType){
        
        $(".menu-block").hide();
        $(".result-block").show();
        
        if(isNaN(inputType)) {
            var num = data.faculty[inputType].roomName;
            responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
        }
        else {
            var num = inputType;
            responsiveVoice.speak(data.rooms[num].voiceResponse_room);
        }
                
        $(".room-name").html(data.rooms[num].roomName);
        $(".room-type").html(data.rooms[num].roomType);
        $(".room-img").css('background-image', 'url(/css/' + data.rooms[num].roomImage + ')');
            
        $(".faculty-name").html(data.rooms[num].facultyName);
        $(".faculty-email").html(data.rooms[num].facultyEmail);
        $(".faculty-number").html(data.rooms[num].facultyNumber);
//        $("#faculty-hours").html();
       
        var officeHours = data.rooms[num].officeHours;
        
        var myStr = "";
        
        for (var day in officeHours){
            
            myStr = myStr + day + "<br/>";
            if(officeHours[day].length > 1){
                for(var i = 0 ; i < officeHours[day].length ; i++)
                    myStr = myStr + officeHours[day][i] + "<br/>";
            }
            else
                myStr = myStr + officeHours[day] + "<br/>";
            myStr = myStr + "<div class=\"spacer-xs\"></div>";
            
        }
        $(".faculty-hours").html(myStr);
        
        
                
    }
    
    function moretime() {
        if(yes) {
            timeLeft = grantTime;
            systemPause(output_ok, output_ok.split(' ').length);

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
                
                if(timeLeft == timeToAsk2 && !resultShown) {
                    endSystem();
                }
                
                if(resultShown) {
                    responsiveVoice.speak(output_moreTime);
                    systemPause(output_moreTime, output_moreTime.split(' ').length);
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

        responsiveVoice.speak(welcome);

        roomLocator = function(room_num) {  
            if(!(room_num in data.rooms)){
                responsiveVoice.speak(output_repeat);
                systemPause(output_repeat, output_repeat.split(' ').length);
            }                        
            else {

                displayResult(data, room_num);
                resultShown = true; 
//                responsiveVoice.speak(data.rooms[room_num].voiceResponse_room); 
                systemPause((data.rooms[room_num].voiceResponse_room), (data.rooms[room_num].voiceResponse_room).split(' ').length);
                
            }
            timeLeft = grantTime;
            
        };

        facultyLocator = function(fac_name) {  
            if(!(fac_name in data.faculty)) {
                alert(fac_name);
                responsiveVoice.speak(output_repeat); 
                systemPause(output_repeat, output_repeat.split(' ').length);
            }
            else {
               
                displayResult(data, fac_name);
                resultShown = true; 
                               
                var num = data.faculty[fac_name].roomName;
//                responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
                systemPause((data.rooms[num].voiceResponse_faculty), (data.rooms[num].voiceResponse_faculty).split(' ').length);
            }
            timeLeft = grantTime;
            
        };
        
        var randomFunction = function(randomWord){
            if(systemAsked) {
                if(randomWord == "yes")
                    yes = true;
                else if(randomWord == "no")
                    no = true;
                moretime();
            }
            
            if(resultShown){
                if(randomWord == "go back"){
                    $(".menu-block").show();
                    $(".result-block").hide();
                    resultShown = false;

                    timeLeft = grantTime;

                    responsiveVoice.speak(welcome);
                }
                
            }
            
            
            
        }
        
    

        commands = {
            'I am looking for room *room_num' : roomLocator,
            'I\'m looking for room *room_num' : roomLocator,
            'Where is room *room_num' : roomLocator,
            'room *room_num' : roomLocator,

            'I am looking for professor *fac_name' : facultyLocator,
            'professor *fac_name' : facultyLocator,
            
            '*randomWord' : randomFunction
        };
        annyang.addCommands(commands);
        annyang.start({continuous: false}); 
        $('#subtitle').html("I'm Listening...");

    }
    
    //*********************************************************************************************************   SYSTEM START

    $('#startButton').click(function(){

        $(".intro-block").hide();
        $(".menu-block").show();
        $("#systemMic").show();
        $("#subtitle").show();
        
        //ANIMATION   ******************************
        
        //bubble animation
        $(".left-bubble .bubble").addClass("slideInLeft");
        $(".right-bubble .bubble").addClass("slideInRight");
        $(".center-bubble .bubble").addClass("slideInDown");

        //prompt animation
        $(".prompt-block h2").addClass("fadeInUp");
        
        
        //END - ANIMATION   ******************************

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
    
    $("#systemMic").click(function(){
        
        $(".left-bubble .bubble").removeClass("slideInLeft");
        $(".right-bubble .bubble").removeClass("slideInRight");
        $(".center-bubble .bubble").removeClass("slideInDown");
        
        $(".bubble").addClass("tada");
        
        setTimeout(function(){ 
            $(".bubble").removeClass("tada");
        }, 1000);
        
        responsiveVoice.speak(output_speak);
        systemPause(output_speak, output_speak.split(' ').length);
        
    });

    
}
