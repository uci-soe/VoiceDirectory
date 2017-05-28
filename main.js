window.onload = function(){
            
    var timeLeft = 45; // System countdown after initiation
    var timeToAsk = 30; // System will ask if user wants more time after this amount of seconds
    var timeToAsk2 = 15 // Second time asking
    var timeToEnd = 1; // System will reset the system with this amount of seconds left
    var grantTime = 45; // System will grant user extra time (grantTime will be set equal to "timeLeft")

    var roomLocator_active = false;
    var facultyLocator_active = false;

    var timer;
    var systemTimer_interval = 1200;

    var systemAsked = false; // Check if system has asked user for more time
    var yes = false;
    var no = false;
    
    var resultShown = false;

    // System's General Voice Responses
    var output_speak = "Please say your request!";
    var output_repeat = "Could you repeat that please?";
    var output_moreTime = "Do you need more time?";
    var output_systemReset = "System will reset.";
    var output_ok = "Ok";
    var output_pleasewait = "Please Wait...";
    var welcome = "Hello, what can I help you with today?";
    var vaildCommand = "Please make a valid request.";
    var output_listening = "I'm Listening...";
    
    
    //Events Voice Responses
    var eventWeekWelcome = "Here's what's happening this week.";
    var eventTodayWelcome = "Here's what's happening today.";
    var eventMonthWelcome = "Here's what's happening this month.";
    
    //Modal Voice Responses
    var output_options = "There seems to be multiple faculty members with that name. Which one are you referring to?";

    // annyang Locator functions
    var roomLocator;
    var facultyLocator;
    var calendarView;
    
    // array of possible faculty
    var possibleFaculty = [];

    var commands = {};
    
    var annyangPaused = false;
    
    var caption = "";
    var resultsCaption = "";

    
    //Creating voice synthesis utterance object.
    if('speechSynthesis' in window)
    {
        var message = new SpeechSynthesisUtterance();
        
        message.text = " ";
        message.lang = 'en-US';
        message.rate = 1;
        message.onstart = function(event)
        { 
            annyang.abort();
            $('#systemMic').attr("src", "css/images/mic-disabled2.png");
            $('#subtitle').html(caption);
        };
        message.onend = function(event)
        { 
            annyang.resume();
            $('#systemMic').attr("src", "css/images/microphone.png");
            
            if(!resultShown){
                caption = output_listening;
                $('#subtitle').html(caption);
            }
            else   
                $('#subtitle').html(resultsCaption);
        };
    }
    
//    Failed to execute 'start' on 'SpeechRecognition': recognition has already started.
    
    universalTime();
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
        
        caption = output_options;
        //Notify user that there are multiple faculty members with the last name
        message.text = output_options;
        window.speechSynthesis.speak(message);
        
//        systemPause(output_options, output_options.split(' ').length);
//        delay(output_options, output_options.split(' ').length);
        
    }
    
    
    function endSystem() {
        
        message.text = output_systemReset;
        window.speechSynthesis.speak(message);
        
        window.location.reload();
    }
    
    // Is called everytime a user talks and annyang does not find a valid command.
    function noMatch()
    {
        message.text = vaildCommand;
        window.speechSynthesis.speak(message);
        caption = message.text;
//        systemPause(message.text,message.text.split(" ").length);
    }
    
    function universalTime() {
        var time = new Date();

        time = time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true });

        document.getElementById("time").innerHTML = time;

    }
    
   /* function isTalking()
    {
        if(window.speechSynthesis.speaking == true)
        {
            annyang.pause();
        }
        else if(window.speechSynthesis.speaking == false)
        {
            annyang.resume()       
        }
    }
    */
    
    function systemPause(word, wordCount) {
        caption = word;
    }
    
    function delay(word, wordCount) {
        
        $('#subtitle').html(word);
//        $('#systemMic').attr("src", "css/images/mic-disabled2.png");

        setTimeout(function(){ 
            $('#subtitle').html(output_listening);
//            $('#systemMic').attr("src", "css/images/microphone.png");
            
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
        resultShown = false;
        
        commandManager("MainMenu");
        
        caption = output_pleasewait;
        
        message.text = welcome;
        window.speechSynthesis.speak(message);
    }
    
    function displayResult(data, input){
        
        commandManager("ResultsView");
        console.log("result commands added");
        $(".menu-block").hide();
        $(".result-block").show();
        $(".modal-bg").hide();
        

        if(isNaN(input)) {
            var num = data.faculty[input].roomName;
            
            message.text = data.rooms[num].voiceResponse_faculty;
            window.speechSynthesis.speak(message);
            
//            delay(data.rooms[num].voiceResponse_faculty, data.rooms[num].voiceResponse_faculty.split(' ').length);
        }
        else {
            var num = input;
            
            message.text = data.rooms[num].voiceResponse_room;
            window.speechSynthesis.speak(message);
            
//            delay(data.rooms[num].voiceResponse_room, data.rooms[num].voiceResponse_room.split(' ').length);
        }
             
        $(".room-name").html(data.rooms[num].roomName);
        $(".room-type").html(data.rooms[num].roomType);
        $(".room-img").css('background-image', 'url(css/' + data.rooms[num].roomImage + ')');
        $(".room-map").attr("src", "css/" + data.rooms[num].mapImage);
            
        $(".faculty-name").html(data.rooms[num].facultyName);
        $(".faculty-email").html(data.rooms[num].facultyEmail);
        $(".faculty-number").html(data.rooms[num].facultyNumber);
        $(".faculty-img").attr("src", "css/" + data.rooms[num].facultyImage);
        var roomType = data.rooms[num].roomType;
        
        if(roomType == "Faculty Office")
            $('.room-img').css('height', '0px');
        else{
            $('.fac-info').css('display', 'none');
            $(".room-type").css('display','none');
        }
       
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
//            systemPause(output_ok, output_ok.split(' ').length);
//            
            caption = output_ok;
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
                    
                    message.text = output_moreTime;
                    window.speechSynthesis.speak(message);
                    
                    caption = output_moreTime;
//                    systemPause(output_moreTime, output_moreTime.split(' ').length);
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
                annyang.addCommands(commands);
                break;
            case "FacultyOptions":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.addCommands(facultyOptionsCommands);
                break;
            case "CalendarView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.addCommands(eventsOptionsCommands);
                break;
        }   
    }
    
    function startSystem(data) {     
        
        systemTimer();
        
//        systemPause(welcome, welcome.split(' ').length);
        
        caption = welcome;
        message.text = welcome;
        window.speechSynthesis.speak(message);
        
        roomLocator = function(room_num) {  
            if(!(room_num in data.rooms)){
                
                message.text = output_repeat;
                window.speechSynthesis.speak(message);
                
//                systemPause(output_repeat, output_repeat.split(' ').length);
                caption = output_repeat;
                
//                delay(output_repeat, output_repeat.split(' ').length);
            }                        
            else {

                displayResult(data, room_num);
                resultShown = true; 
//                systemPause((data.rooms[room_num].voiceResponse_room), (data.rooms[room_num].voiceResponse_room).split(' ').length);
                caption = data.rooms[room_num].voiceResponse_room;
                resultsCaption = caption;
                
            }
            timeLeft = grantTime;
            
        };

        
        facultyLocator = function(fac_name) {  
            
            
            if(fac_name == "cambridge" || fac_name == "Cambridge" || fac_name == "Kim Birge" || fac_name == "Kim Bridge")
            {  
                fac_name = "Kim Burge";
                alert(fac_name);
            }
            else if(fac_name == "Janelle Lau" )
            {  
                fac_name = "Jenel Lao";
                alert(fac_name);
            }
            else if(fac_name == "die shoe")
            {
                fac_name = "Di Xu";
                alert(fac_name);
            }
            else if(fac_name == "constance iloh")
            {
                fac_name = "Constance Iloh";
                alert(fac_name);
            }
            else if(fac_name == "Melinda petre")
            {
                fac_name = "Melinda Petre";
                alert(fac_name);
            }
            else if(fac_name == "Jacqueline Echols")
            {
                fac_name = "Jacquelynne Eccles";
                alert(fac_name);
            }
            else if(fac_name == "Geneva Lopez Sandoval")
            {
                fac_name = "Geneva Lopez-Sandoval";
                alert(fac_name);
            }
            else if(fac_name == "Sarah sing")
            {
                fac_name = "Sarah Singh";
                alert(fac_name);
            }
            else if(fac_name == "Susan Toma bears" || fac_name == "Susan Toma Berg" || fac_name == "Susan Toma bush" || fac_name == "Susan Toma Burj")
            {
                fac_name = "Susan Toma Berge";
                alert(fac_name);
            }
            else if(fac_name == "Gene Stone" || fac_name == "June Stone")
            {
                fac_name = "Jeanne Stone";
                alert(fac_name);
            }
            else if(fac_name == "Maria tax" || fac_name == "Murrieta Cox")
            {
                fac_name = "Maria Takacs";
                alert(fac_name);
            }
            else if(fac_name == "Sandra Simkins")
            {
                fac_name = "Sandra Simpkins";
                alert(fac_name);
            }
            else if(fac_name == "Virginia panish")
            {
                fac_name = "Virginia Panish";
                alert(fac_name);
            }
            
            
            
            
            
            
            
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
                                alert("Possible Faculty: " + possibleFaculty.length);
                            }
                        }
                    alert(possibleFaculty.length);
                    if(matchFound == false)
                    {
                        caption = output_repeat;
                        message.text = output_repeat;
                        window.speechSynthesis.speak(message);
//                        systemPause(output_repeat, output_repeat.split(' ').length);  
                    }
                    
                    else
                        {   
                           if(possibleFaculty.length > 1) // ooo
                                {
                                    // Ask user which one they meant.
                                    //alert("ASK USER WHICH ONE");
                                    resultOptions(data, possibleFaculty);
                                    modalResponse(); 
                                }
                            else
                                {
                                    displayResult(data, possibleFaculty[0]);
                                    resultShown = true;
                                    
                                    
                                    alert(data.faculty[possibleFaculty[0]].roomName);
                                    
                                    var num = data.faculty[possibleFaculty[0]].roomName;
                                    
                                    caption = data.rooms[num].voiceResponse_faculty;
                                    resultsCaption = caption;
//                                    systemPause((data.rooms[num].voiceResponse_faculty), (data.rooms[num].voiceResponse_faculty).split(' ').length);
                                }
                        }
                }
            // If they provide first and last name.
            else
                {
                    
                        
                    if(!(fac_name in data.faculty))
                        {
                            caption = output_repeat;
                            message.text = output_repeat;
                            window.speechSynthesis.speak(message);
//                            systemPause(output_repeat, output_repeat.split(' ').length);  
                        }
                    else
                        {
                            displayResult(data, fac_name);
                            resultShown = true;
                            
                            var num = data.faculty[fac_name].roomName;
//                          responsiveVoice.speak(data.rooms[num].voiceResponse_faculty);
//                            systemPause((data.rooms[num].voiceResponse_faculty), (data.rooms[num].voiceResponse_faculty).split(' ').length);
                            
                            caption = data.rooms[num].voiceResponse_faculty;
                            resultsCaption = caption;
                        }
                }
            
            timeLeft = grantTime;
        };
        
        // Calendar View Function //

        calendarView = function(viewMode = "what's happening this week") {
           /* var source = "https://calendar.google.com/calendar/embed?mode=MONTH&amp;showNav=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=ucieducationevents%40gmail.com&amp;color=%238D6F47&amp;ctz=America%2FLos_Angeles"
            commandManager("CalendarView");
            
            if(viewMode == "what's happening this week")
                {
                    source = "https://calendar.google.com/calendar/embed?mode=MONTH&amp;showNav=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=ucieducationevents%40gmail.com&amp;color=%238D6F47&amp;ctz=America%2FLos_Angeles";
                   
                    $("#calendarFrame").attr('src',source);
                    
                    message.text = eventWeekWelcome;
                }
            else if(viewMode == "what's happening today")
                {
                    
                    source = "https://calendar.google.com/calendar/embed?mode=AGENDA&amp;showNav=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=tp813fc8tfi3uoeb2k1kr8ivn8%40group.calendar.google.com&amp;color=%238D6F47&amp;ctz=America%2FLos_Angeles";
                    
                    $("#calendarFrame").attr('src',source);
                    
                    message.text = eventTodayWelcome;
                }
            else if(viewMode == "what's happening this month")
                {
                    source = "https://calendar.google.com/calendar/embed?mode=MONTH&amp;showNav=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=tp813fc8tfi3uoeb2k1kr8ivn8%40group.calendar.google.com&amp;color=%238D6F47&amp;ctz=America%2FLos_Angeles";
                    
                    $("#calendarFrame").attr('src',source);
                    
                    message.text = eventMonthWelcome; 
                }
            */
            
            message.text = eventMonthWelcome; 
            caption = eventMonthWelcome;
            window.speechSynthesis.speak(message);
            resultsCaption = caption;
//            systemPause(eventMonthWelcome, eventMonthWelcome.split(' ').length);
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
            'What events are coming up' : calendarView,
            // Faculty Locator
            '(professor) *name': facultyLocator,
           // 'I am looking for (dr.) *name':facultyLocator,
            'I am looking for (professor) *name':facultyLocator,
            'Im looking for (professor) *name':facultyLocator, 
            
            // 'I am looking for professor *fac_name' : facultyLocator,
           // 'I am looking for professor *fac_first_name :fac_last_name' : facultyLocator,
            //'professor *fac_first_name (*fac_last_name)' : facultyLocator,
            
            //Event View
            
            'I want to know upcoming events' : calendarView
            // randomWord can only be yes or no now to avoid it being called very    time. 
        };
    
        
        commands = {
            // * = capture everything after 
            // : = capture only one word
            
            //RESET COMMAND
            'reset' : displayMainMenu,
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : randomFunction}
        };
        
        facultyOptionsCommands = {
            '(option) (number) :number' : optionFunc
        };
        
        eventsOptionsCommands = {
            //'(This) :viewType': 
            '*timeFrame' : {'regexp' : /^(what's happening this month|what's happening today|what's happening this week)$/, 'callback' : calendarView}
        };
   
        annyang.addCommands(commands);
        commandManager("MainMenu");
        
        annyang.setLanguage("en-US");
        annyang.start({continuous: false}); 
        
        annyang.debug([newState=true]);
        
        // adds NoMatch everytime no match is found.
        annyang.addCallback('resultNoMatch',noMatch);
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
        
        
        caption = output_speak;
        message.text = output_speak;
        window.speechSynthesis.speak(message);
        
//        systemPause(output_speak, output_speak.split(' ').length);
//        delay(output_speak, output_speak.split(' ').length);

    });
 
}
