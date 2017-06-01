window.onload = function(){
            
    var timeLeft = 550; // System countdown after initiation
    var timeToAsk = 30; // System will ask if user wants more time after this amount of seconds
    var timeToAsk2 = 15; // Second time asking
    var timeToEnd = 1; // System will reset the system with this amount of seconds left
    var grantTime = 550; // System will grant user extra time (grantTime will be set equal to "timeLeft")

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
//    var output_repeat = "Could you repeat that please?";
//    var output_repeat = "Please make a valid request.";
    var output_moreTime = "Do you need more time?";
    var output_systemReset = "System will reset.";
    var output_ok = "Ok";
    var output_pleasewait = "Please Wait...";
    var welcome = "Hello, what can I help you with today?";
    var output_invalidRoom = "";
    var output_invalidFaculty = "";
    var validCommand = "Please say a valid command.";
    var output_listening = "I'm Listening...";
    
    function outputRepeat (output_item){
//        alert(output_item);
        if(isNaN(output_item)){
            if(/\d/.test(output_item))
                output_repeat = "Sorry, Room " + output_item + " does not exist. Please make a valid request.";
            else{
                output_item = output_item.charAt(0).toUpperCase() + output_item.slice(1);
                 output_repeat = "Sorry, " + output_item + " does not exist. Please make a valid request.";
            }
               
        }
        else{
            output_repeat = "Sorry, Room " + output_item + " does not exist. Please make a valid request.";
        }

            
    }
    
    //Events Voice Responses
    var eventWeekWelcome = "Here's what's happening this week.";
    var eventTodayWelcome = "Here's what's happening today.";
    var eventMonthWelcome = "Here's what's happening this month.";
    

    // annyang Locator functions
    var roomLocator;
    var facultyLocator;
    var calendarView;
    
    // array of possible faculty
    var possibleFaculty = [];
    
    // array of possible room
    var possibleRoom = [];

    var commands = {};
    
    var annyangPaused = false;
    
    var caption = "";
    var resultsCaption = "";

    
    // Function to check if an object is empty
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    
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
    
    function spellChecker(fac_name){
        if(fac_name == "cambridge" || fac_name == "Cambridge" || fac_name == "Kim Birge" || fac_name == "Kim Bridge" || fac_name == "Burg" || fac_name == "Birch")
            return "Kim Burge";
        else if(fac_name == "Janelle Lau" || fac_name == "Professor Lau"  || fac_name == "Lau")
            return "Jenel Lao";
        else if(fac_name == "die shoe")
            return "Di Xu";
        else if(fac_name == "constance iloh" || fac_name == "Constance Ehlo" || fac_name == "constants Hilo" || fac_name == "Constance I love" || fac_name == "Constance Ela")
            return "Constance Iloh";
        else if(fac_name == "Deborah vendell" || fac_name == "Deborah vandal" || fac_name == "Deborah vandal" || fac_name == "Deborah vandell")
            return "Deborah Vandell";
        else if(fac_name == "Melinda petre" || fac_name == "Melinda Petrie" || fac_name == "Melinda Petry" || fac_name == "Melinda Peter" || fac_name == "Petra")
            return "Melinda Petre";
        else if(fac_name == "Jacqueline Echols")
            return "Jacquelynne Eccles";
        else if(fac_name == "Geneva Lopez Sandoval")
            return "Geneva Lopez-Sandoval";
        else if(fac_name == "Sarah sing")
            return "Sarah Singh";
        else if(fac_name == "Susan Toma bears" || fac_name == "Susan Toma Berg" || fac_name == "Susan Toma bush" || fac_name == "Susan Toma Burj")
            return "Susan Toma Berge";
        else if(fac_name == "Gene Stone" || fac_name == "June Stone")
            return "Jeanne Stone";
        else if(fac_name == "Maria tax" || fac_name == "Murrieta Cox")
            return "Maria Takacs";
        else if(fac_name == "Sandra Simkins")
            return "Sandra Simpkins";
        else if(fac_name == "Virginia panish")
            return "Virginia Panish";
        else if(fac_name == "cute King" || fac_name == "cute Kang" || fac_name == "Kyu Kang" || fac_name == "Hugh Kang" || fac_name == "puke King")
            return "Hyuk Kang";

        return fac_name;
        
    }
    function resultOptions(data,duplicatesArray) {
        
        $('#dynamic-options').empty();

        commandManager("FacultyOptions");
        timeLeft = grantTime;
        $(".modal-bg").show();
        
//        alert(duplicatesArray.length);
        var htmlString = "<ul>";
        
        var myStr = "";
        var count;
        
        if(isNaN(duplicatesArray[0])){
            for(var i = 0; i < duplicatesArray.length ; i++){
                 myStr = myStr + "<p>" + (i+1) + " - " + data.faculty[duplicatesArray[i]].fullName + "</p>"
            }
        }
        else{
//            alert(duplicatesArray);
        
            
            for(var i = 0; i < duplicatesArray.length ; i++){
                 myStr = myStr + "<p>" + (i+1) + " - " + data.rooms[duplicatesArray[i]].roomName + " - " + data.rooms[duplicatesArray[i]].facultyName +  "</p>"
            }
        }
        
        
        $('#dynamic-options').append(myStr);        
    }
    
    function modalResponse(item){
        
        caption = "Please say the number of the " + item + " you're referring to.";
        //Notify user that there are multiple faculty members with the last name
        message.text = caption;
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
        message.text = validCommand;
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
    
    function removeResults(){
        $(".room-name").html("");
        $(".room-type").html("");
        $(".room-img").css('background-image', 'none');
        $(".room-map").attr("src", "");
        $(".faculty-name").html("");
        
//        $(".faculty-email").html("");
//        $(".faculty-number").html("");
//        $(".faculty-img").attr("src", "");
        
        $('.fac-info').css('display','none');
        $('.officeHours').hide();        
        $('.faculty-hours').html("");
        
    }
    
    function displayMainMenu(reset)
    {
        removeResults();
        
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
        
//        alert("input: " + isNaN(input));
//        alert(input.includes("a"));
        
        var num;
        
        if(isNaN(input)) {
            if(/\d/.test(input)){
                num = input;
                message.text = data.rooms[num].voiceResponse_room;
                window.speechSynthesis.speak(message);    
            }
            else{
                num = data.faculty[input].roomName;
                message.text = data.rooms[num].voiceResponse_faculty;
                window.speechSynthesis.speak(message);
                
                $(".faculty-name").html(data.rooms[num].facultyName);
                $(".faculty-email").html(data.rooms[num].facultyEmail);
                $(".faculty-number").html(data.rooms[num].facultyNumber);
                $(".faculty-img").attr("src", "css/" + data.rooms[num].facultyImage);
            }            
        }
        else {
            num = input;
            message.text = data.rooms[num].voiceResponse_room;
            window.speechSynthesis.speak(message);
        }
        
        
        $(".room-name").html(data.rooms[num].roomName);
        $(".room-type").html(data.rooms[num].roomType);
        $(".room-img").css('background-image', 'url(css/' + data.rooms[num].roomImage + ')');
        $(".room-map").attr("src", "css/" + data.rooms[num].mapImage);
            
        
        var roomType = data.rooms[num].roomType;
        
        if(roomType == "Faculty Office"){
            $('.room-img').css('display', 'none');
            $('.fac-info').css('display','block');
        }
        else if(roomType == "Classroom"){
            $('.room-img').css('display', 'block');
//            if(data.rooms[num].facultyName == "")
            $('.fac-info').css('display', 'none');
        }
        else {
            $('.fac-info').css('display', 'none');
            $('.room-type').css('display','none');
        }
        
        if(isEmpty(data.rooms[num].officeHours))
            $('.officeHours').hide();
        else
            $('.officeHours').show();

       
        var officeHours = data.rooms[num].officeHours;
        
        var myStr = "";
        
        for (var day in officeHours){
            
            myStr = myStr + day + "<br/>";
            if(officeHours[day].length > 1)
                for(var i = 0 ; i < officeHours[day].length ; i++)
                    myStr = myStr + officeHours[day][i] + "<br/>";
            else
                myStr = myStr + officeHours[day] + "<br/>";
            myStr = myStr + "<div class=\"spacer-xs\"></div>";
            
        }
        $(".faculty-hours").html(myStr);  
        
        roomLocator_active = false;
        facultyLocator_active = false;
    
    }
    
    function moretime() {
        if(yes) {
            timeLeft = grantTime;

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
            
//            alert(room_num);
            
            if(!(room_num in data.rooms)){
                
                outputRepeat(room_num);
                
                message.text = output_repeat;
                window.speechSynthesis.speak(message);
                
                caption = output_repeat;
                
            }                        
            else {
                
                roomLocator_active = true;
                
                var tempStr = "";
                var letter = "a";
                
                possibleRoom = [room_num];
                
                for(var i = 0; ;i++){
                    tempStr = room_num + letter;
                    
                    if(tempStr in data.rooms)
                        possibleRoom.push(tempStr);
                    else
                        break;
                    
                    letter = String.fromCharCode(letter.charCodeAt() + 1);
                }
                    
                if(possibleRoom.length > 1){
                    resultOptions(data, possibleRoom);
                    modalResponse("room");
                }
                else{
                    console.log(room_num);
                    displayResult(data, room_num);
                    resultShown = true; 

                    caption = data.rooms[room_num].voiceResponse_room;
                    resultsCaption = caption;
                }                
                
            }
            timeLeft = grantTime;
            
        };
//giaa
        
        facultyLocator = function(fac_name) {  
            
            //Spell check faculty name input
            fac_name = spellChecker(fac_name);
            
            //alert(fac_name);
            var splitFacName = fac_name.split(" ");
            //alert(splitFacName[0]);
            
            var firstName = splitFacName[0];
            var lastName = splitFacName[1];
            
            var matchFound = false;
            
            possibleFaculty = [];
            
            facultyLocator_active = true;
            
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
//                                alert("Possible Faculty: " + possibleFaculty.length);
                        }
                    }
//                    alert(possibleFaculty.length);
                    if(!matchFound)
                    {
                        outputRepeat(fac_name);
                        caption = output_repeat;
                        message.text = output_repeat;
                        window.speechSynthesis.speak(message);
//                        systemPause(output_repeat, output_repeat.split(' ').length);          
                    }
                    else
                        {   
                           if(possibleFaculty.length > 1) // ooo
                                {
                                    //display to DOM
                                    resultOptions(data, possibleFaculty);
                                    
                                    //speech for modal
                                    modalResponse("faculty member");
                                }
                            else
                                {
                                    displayResult(data, possibleFaculty[0]);
                                    resultShown = true;
                                    
                                    
//                                    alert(data.faculty[possibleFaculty[0]].roomName);
                                    
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
        
        var convertToNumber = function(word){
            if(word == "one")
                return 1;
            else if(word == "two" || word == "to" || word == "too")
                return 2;
            else if (word == "three" || word == "tree")
                return 3;
            else if(word == "four" || word == "for")
                return 4;
            else if (word == "five")
                return 5;
        }
        var optionFunc = function(numString){
            
            var index = convertToNumber(numString) - 1;

            annyang.addCommands(commands);
            
            var indexItem = "";
//            alert(roomLocator_active + " " + facultyLocator_active);
            if(roomLocator_active){
                indexItem = possibleRoom[index];  
//                alert(data.rooms[indexItem].voiceResponse_room);
                caption = data.rooms[indexItem].voiceResponse_room;
            }
            else if(facultyLocator_active){
                indexItem = possibleFaculty[index];
                num = data.faculty[possibleFaculty[index]].roomName;
                caption = data.rooms[num].voiceResponse_faculty;
            }
            resultsCaption = caption;
           
//            alert(indexItem);
            
            annyang.removeCommands(facultyOptionsCommands);
            displayResult(data, indexItem);
            resultShown = true;

        };
        
        var yourWelcome = function(){
            caption = "You're Welcome!";
            message.text = "You're Welcome!";
            window.speechSynthesis.speak(message);
        }
         
        mainMenuCommands = {
            // Room Locator
            'I am looking for room *room_num' : roomLocator,
            "I'm looking for room *room_num" : roomLocator,
            'Where is room *room_num' : roomLocator,
            'room *room_num' : roomLocator,
            
            
            // Faculty Locator            
            "I'm looking for mr. *name":facultyLocator,
            "I'm looking for ms. *name":facultyLocator,
            "I'm looking for Miss *name":facultyLocator,
            "I'm looking for mrs. *name":facultyLocator,
            "I'm looking for dr. *name":facultyLocator,
            "I'm looking for dr *name":facultyLocator,
            "I'm looking for (professor) *name":facultyLocator, 
            'I am looking for (professor) *name':facultyLocator,

            'professor *name': facultyLocator,
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
            'new search' : displayMainMenu,
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : randomFunction},
            'thank you' : yourWelcome
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
