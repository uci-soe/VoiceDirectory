window.onload = function(){
            
    var timeLeft = 4500; // System countdown after initiation
    var timeToAsk = 30; // System will ask if user wants more time after this amount of seconds
    var timeToAsk2 = 15 // Second time asking
    var timeToEnd = 1; // System will reset the system with this amount of seconds left
    var grantTime = 4005; // System will grant user extra time (grantTime will be set equal to "timeLeft")

    var roomLocator_active = false;
    var facultyLocator_active = false;

    var timer;
    var systemTimer_interval = 1200;

    var systemAsked = false; // Check if system has asked user for more time
    var yes = false;
    var no = false;
    
    var resultShown = false;

    // System's General Voice Responses
    var output_speak = "Please speak your request!";
    var output_repeat = "Could you repeat that please?";
    var output_moreTime = "Do you need more time?";
    var output_systemReset = "System will reset.";
    var output_ok = "Ok";
    var output_pleasewait = "Please Wait...";
    var welcome = "Hello, what can I help you with today?";
    
    //Events Voice Responses
    var eventWelcome = "Here's what's happening this week.";
    
    //Modal Voice Responses
    var output_options = "There seems to be multiple faculty members with that name. Which one are you referring to?";

    // annyang Locator functions
    var roomLocator;
    var facultyLocator;
    var calendarView;
    
    // array of possible faculty
    var possibleFaculty = [];

    var commands = {};
    
    var annyangPaused = false
    
    
    
    
    
    
    
    //Creating voice synthesis utterance object.
    if('speechSynthesis' in window)
    {
        var message = new SpeechSynthesisUtterance();
        message.text = " ";
        message.lang = 'en-US';
        message.rate = 1.23;
    }
    
    universalTime();
    /*
    function isSpeaking()
    {
        if(window.speechSynthesis.speaking == true)
            {
                if(annyangPaused == false)
                    {
                        annyang.pause();
                        console.log("Annyang paused");
                        annyangPaused = true;
                    }
            }
        
        else if(window.speechSynthesis.speaking == false)
            {
                if(annyangPaused == true)
                    {
                        annyang.resume();
                        console.log("Annyang resumed");
                        annyangPaused = false;
                    }
            }
    }*/
    
    //*********************************************************************************************************   FUNCTION DECLARATIONS

//    $(".intro-block").hide();
    
    $(".blue-block").hide();
    $(".menu-block").hide();
    $("#systemMic").hide();
    $("#subtitle").hide();
    
    $(".result-block").hide();
    $(".events-block").hide(); //hide events block
    
    
    $(".modal-bg").hide();
   
    /*
        Data
        - Name of Faculty
        - Picture of Faculty
        
        Number of Duplicates
            
    */
    function resultOptions(data,duplicatesArray) {
        
        commandManager("FacultyOptions");
        
        timeLeft = grantTime;
        
        $(".modal-bg").show();
        
        alert(duplicatesArray.length);
        var htmlString = "<ul>";
        
        var num;
        var count;
        
        var newClass = "";
            
        for(var i = 0; i < duplicatesArray.length ; i++){
            
            count = i;
            countDisplay = i+1;
            var stringCount = count.toString();
                        
            newClass = "faculty-shot-" + stringCount;
            
            var myStr_col4 = "<div class=\"col-sm-2\">";
            var myStr_col8 = "<div class=\"col-sm-8\">";
            var end_div = "</div>";
            
            var myStr = "";
            var myStr2 = "";
            
            
            myStr = myStr_col4 + "<div class=\"faculty-shot " + newClass + "\"></div>" + end_div;
            
            myStr2 = myStr_col8 + "<div class=\"faculty-name\">" + data.faculty[duplicatesArray[i]].fullName + end_div + end_div;
  
            $("#dynamic-options").append(myStr);
            $("#dynamic-options").append(myStr2);
            $("#dynamic-options").append("<div class=\"clear\"></div>");
                        
            num = data.faculty[duplicatesArray[i]].roomName;
            $("."+newClass).css('background-image', 'url('+ data.rooms[num].facultyImage + ')');
            
        }
        
    }
    
    function modalResponse(){
        //Notify user that there are multiple faculty members with the last name
        message.text = output_options;
        window.speechSynthesis.speak(message);
        
        systemPause(output_options, output_options.split(' ').length);
//        delay(output_options, output_options.split(' ').length);
        
    }
    
    
    function endSystem() {

        //responsiveVoice.speak(output_systemReset); 
        
        message.text = output_systemReset;
        window.speechSynthesis.speak(message);
        
        window.location.reload();
    }
    
    function universalTime() {
        var time = new Date();

        time = time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true });

        document.getElementById("time").innerHTML = time;

    }
    
    function systemPause(word, wordCount) {

        $('#subtitle').html(word);
//        annyang.pause();
        $('#systemMic').attr("src", "css/images/mic-disabled2.png");

        setTimeout(function(){ 
//            annyang.resume() 

            $('#subtitle').html("I'm Listening...");
            $('#systemMic').attr("src", "css/images/microphone.png");
            
            }, wordCount*450);
    }
    
    function delay(word, wordCount) {
        
        $('#subtitle').html(word);
        $('#systemMic').attr("src", "css/images/mic-disabled2.png");

        setTimeout(function(){ 
            $('#subtitle').html("I'm Listening...");
            $('#systemMic').attr("src", "css/images/microphone.png");
            
            }, wordCount * 500);
        
    }
    
    function displayMainMenu(reset)
    {
        $(".result-block").hide();
        $(".events-block").hide();
        $(".modal-bg").hide();
        
        
        $(".menu-block").show();
        $("#systemMic").show();
        $("#subtitle").show();
        
        timeLeft = grantTime;
    }
    
    function displayResult(data, input){
        
        commandManager("ResultsView");
        
        $(".menu-block").hide();
        $(".result-block").show();
        $(".modal-bg").hide();
        

        if(isNaN(input)) {
            var num = data.faculty[input].roomName;
            
            //responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
            
            message.text = data.rooms[num].voiceResponse_faculty;
            window.speechSynthesis.speak(message);
            
//            delay(data.rooms[num].voiceResponse_faculty, data.rooms[num].voiceResponse_faculty.split(' ').length);
        }
        else {
            var num = input;
            
            //responsiveVoice.speak(data.rooms[num].voiceResponse_room);
            
            message.text = data.rooms[num].voiceResponse_room;
            window.speechSynthesis.speak(message);
            
//            delay(data.rooms[num].voiceResponse_room, data.rooms[num].voiceResponse_room.split(' ').length);
        }
             
        $(".room-name").html(data.rooms[num].roomName);
        $(".room-type").html(data.rooms[num].roomType);
        $(".room-img").css('background-image', 'url(css/' + data.rooms[num].roomImage + ')');
        $(".room-map").attr("src", data.rooms[num].mapImage);
            
        $(".faculty-name").html(data.rooms[num].facultyName);
        $(".faculty-email").html(data.rooms[num].facultyEmail);
        $(".faculty-number").html(data.rooms[num].facultyNumber);
        $(".faculty-img").attr("src", data.rooms[num].facultyImage);
        
        
        var roomType = data.rooms[num].roomType;
        
        if(roomType == "Faculty Office")
            $('.room-img').css('height', '0px');
        else
            $('.fac-info').css('display', 'none');
       
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

           
            //responsiveVoice.speak(output_ok);
            
            message.text = output_ok;
            window.speechSynthesis.speak(message);
            
            
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
                    
                    //responsiveVoice.speak(output_moreTime);
                    
                    message.text = output_moreTime;
                    window.speechSynthesis.speak(message);
                    
                    
                    systemPause(output_moreTime, output_moreTime.split(' ').length);
//                    delay(output_moreTime, output_moreTime.split(' ').length);
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

    
    function commandManager(commandKey)
    {
        
        switch(commandKey)
        {
            case "MainMenu": 
                annyang.addCommands(mainMenuCommands);
                break;
            case "ResultsView":
                annyang.init(commands,true);
                break;
            case "FacultyOptions":
                annyang.init(commands,true);
                annyang.addCommands(facultyOptionsCommands);
                break;
            case "CalendarView":
                annyang.init(commands,true);
                break;
        }
        
    }
    
    function startSystem(data) {     
        
        systemTimer();
        
        systemPause(output_pleasewait, welcome.split(' ').length);
        
        message.text = welcome;
        window.speechSynthesis.speak(message);
        
        roomLocator = function(room_num) {  
            if(!(room_num in data.rooms)){
                
                
                //responsiveVoice.speak(output_repeat);
                
                message.text = output_repeat;
                window.speechSynthesis.speak(message);
                
                systemPause(output_repeat, output_repeat.split(' ').length);
                
//                delay(output_repeat, output_repeat.split(' ').length);
            }                        
            else {

                displayResult(data, room_num);
                resultShown = true; 
//                responsiveVoice.speak(data.rooms[room_num].voiceResponse_room); 
                systemPause((data.rooms[room_num].voiceResponse_room), (data.rooms[room_num].voiceResponse_room).split(' ').length);
                
            }
            timeLeft = grantTime;
            
        };

       /* facultyLocator = function(fac_name) {  
            if(!(fac_name in data.faculty)) {
//                alert(fac_name);
                responsiveVoice.speak(output_repeat); 
                systemPause(output_repeat, output_repeat.split(' ').length);
                
                delay(output_repeat, output_repeat.split(' ').length);
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
        */
        
        
        // Testing full name faculty locator
        
        
        /*
        Search last name
            when they search last name we search through keys
            if match save in temp array 


            if duplicates add to array 

            then ask user which one?

            if no duplicates present results	

            if no match at all return ask again
        */
        
        facultyLocator = function(fac_name) {  
            //alert(fac_name);
            var splitFacName = fac_name.split(" ");
            //alert(splitFacName[0]);
            
            var firstName = splitFacName[0];
            var lastName = splitFacName[1];
            
            var matchFound = false;
            
            possibleFaculty = [];
            
            //If they only provided one name (i.e. Professor Denenberg)
            if(lastName == null)
                {
                    for(key in data.faculty)
                        {
                            
                            var keyCheck = key.split(" ");
                           // console.log("Key: " + key + " | faculty Input: " + fac_name + " | Key Comparrison: " + keyCheck[1]);
                            
                            if(fac_name == keyCheck[1])
                            {
                                matchFound = true;
                                possibleFaculty.push(key);
                                //alert("Possible Faculty: " + possibleFaculty.length);
                                
                            }
                        }
                    alert(possibleFaculty.length);
                    if(matchFound == false)
                    {
                        message.text = output_repeat;
                        window.speechSynthesis.speak(message);
                        systemPause(output_repeat, output_repeat.split(' ').length);  
                    }
                    
                    /*
                    if(!(fac_name in data.faculty))
                        {
                            message.text = output_repeat;
                            window.speechSynthesis.speak(message);
                            systemPause(output_repeat, output_repeat.split(' ').length);  
                        }
                    */
                    
                    else
                        {   
                            /*var possibleFaculty = [];
                            var count = 0;
                            
                            for(key in data.faculty)
                                {
                                    //alert(key);
                                    if (key == fac_name)
                                        {
                                            possibleFaculty.push(key);
                                            alert("Possible Faculty: " + possibleFaculty.length);
                                        }
                                    count++;
                                }
                            */
                           if(possibleFaculty.length > 1) // ooo
                                {
                                    // Ask user which one they meant.
                                    alert("ASK USER WHICH ONE");
                                    resultOptions(data, possibleFaculty);
                                    modalResponse();
                                    
                                }
                            else
                                {
                                    displayResult(data, possibleFaculty[0]);
                                    resultShown = true;
                            
                                    var num = data.faculty[fac_name].roomName;
//                                  responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
                                    systemPause((data.rooms[num].voiceResponse_faculty), (data.rooms[num].voiceResponse_faculty).split(' ').length);
                                
                                }
                            
                        }
                }
            // If they provide first and last name.
            else
                {

                    if(!(fac_name in data.faculty))
                        {
                            message.text = output_repeat;
                            window.speechSynthesis.speak(message);
                            systemPause(output_repeat, output_repeat.split(' ').length);  
                        }
                    else
                        {
                            displayResult(data, fac_name);
                            resultShown = true;
                            
                            var num = data.faculty[fac_name].roomName;
//                          responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
                            systemPause((data.rooms[num].voiceResponse_faculty), (data.rooms[num].voiceResponse_faculty).split(' ').length);
                        }
                }
            
            timeLeft = grantTime;
            
            
            
            
            
            
            
            /*
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
            */
        };
        
        
        
        
        
        
        /*
        // Adding two word faculty search
        facultyLocator2 = function(fac_first_name,fac_last_name) { 
            var full_name = fac_first_name.concat(" ");
            full_name = full_name.concat(fac_last_name);
            
            //alert(full_name);
            
            
            if(!(full_name in data.faculty)) {
                //alert(fac_name);
                responsiveVoice.speak(output_repeat); 
                systemPause(output_repeat, output_repeat.split(' ').length);
            }
            else {
               
                displayResult(data, full_name);
                resultShown = true; 
                               
                var num = data.faculty[full_name].roomName;
//                responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
                systemPause((data.rooms[num].voiceResponse_faculty), (data.rooms[num].voiceResponse_faculty).split(' ').length);
            }
            timeLeft = grantTime;
            
        };
        
        */
        
        // Calendar View Function //
        
        calendarView = function(hello) {
            //alert("here");
            
            //responsiveVoice.speak(eventWelcome);
                        
            message.text = eventWelcome;
            window.speechSynthesis.speak(message);
            
            systemPause(eventWelcome, eventWelcome.split(' ').length);
//            delay(eventWelcome, eventWelcome.split(' ').length);
            resultShown = true; 
            
            timeLeft = grantTime;
            
            $(".menu-block").hide();
            $(".events-block").show();
        }
        
        var randomFunction = function(randomWord){
            //alert(randomWord);
            if(systemAsked) {
                if(randomWord == "yes")
                    yes = true;
                else if(randomWord == "no")
                    no = true;
                moretime();
            }
            
            if(randomWord =="back"){
                if(resultShown){
                    $(".menu-block").show();
                    $(".result-block").hide();
                    resultShown = false;

                    timeLeft = grantTime;

                    //responsiveVoice.speak(welcome);
                    
                    message.text = welcome;
                    window.speechSynthesis.speak(message);
                }
                
            }
   
        };
        
        var optionFunc = function(num){
            
            var facultyIndex = parseInt(num) - 1;
            annyang.addCommands(commands);
            annyang.removeCommands(facultyOptionsCommands);
            
            displayResult(data, possibleFaculty[facultyIndex]);
            
        };

         
        mainMenuCommands = {
            // Room Locator
            'I am looking for room *room_num' : roomLocator,
            'Where is room *room_num' : roomLocator,
            'room *room_num' : roomLocator,
            
            // Faculty Locator
            'professor *name': facultyLocator,
           // 'I am looking for (dr.) *name':facultyLocator,
            'I am looking for (professor) *name':facultyLocator,
            'Im looking for (professor) *name':facultyLocator, 
            
            // 'I am looking for professor *fac_name' : facultyLocator,
           // 'I am looking for professor *fac_first_name :fac_last_name' : facultyLocator,
            //'professor *fac_first_name (*fac_last_name)' : facultyLocator,
            
            //Event View
            'What events are coming up' : calendarView,
            'I want to know upcoming events' : calendarView
            // randomWord can only be yes or no now to avoid it being called very    time.
            
        };
    
        
        commands = {
            
            // * = capture everything after 
            // : = capture only one word
            
            
            //RESET COMMAND
            ':reset' : {'regexp' : /^(reset)$/, 'callback' : displayMainMenu},
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : randomFunction}
        };
        
        facultyOptionsCommands = {
            '(option) (number) :number' : optionFunc
        };
        
        eventsOptionsCommands = {
            //'(This) :viewType': 
            '(this) :timeFrame' : {'regexp' : /^(month|today|week)$/, 'callback' : randomFunction}
        };

        
        annyang.addCommands(commands);
        commandManager("MainMenu");
        
        annyang.setLanguage("en-US");
        annyang.start({continuous: false}); 
        
        
        annyang.debug([newState=true]);
        
        //$('#subtitle').html("I'm Listening...");

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
        
       
        
        //responsiveVoice.speak(output_speak);
        
        message.text = output_speak;
        window.speechSynthesis.speak(message);
        
        systemPause(output_speak, output_speak.split(' ').length);
//        delay(output_speak, output_speak.split(' ').length);

        
    });

    
}
