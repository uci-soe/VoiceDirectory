window.onload = function(){
    var timeLeft = 55; // This variable represents the amount of time users have in interacting with the system after initiation. This variable will continually be decremented by 1 in seconds. 
    var timeToAskFirst = 30; // This variable represents the first checkpoint for timeLeft to reach (as it gets decremented by 1) where the system would ask users if they need more time. 
    var timeToAskSecond = 10; // This variable represents the second checkpoint for timeLeft to reach (as it gets decremented by 1) where the system would ask users if they need more time. 
    var timeToEnd = 1; // This variable represents the last checkpoint for timeLeft to reach (as it gets decremented by 1) where the system would come to an end. 
    var grantTime = 55; // This variable represents the amount of time set/granted to the current time (timeLeft) when user interacts with the system in any way. 

    var resultShown = false; // This variable will be set to true if the user successfully makes a request and the results page is shown.
    var roomLocatorActive = false;  // This variable will be set to true if user requests for room information. 
    var facultyLocatorActive = false; // This variable will be set to true if user requests for faculty information.
    var clarifyFacultyActive = false; // This variable will be set to true if user requests for faculty with the same last names. 
    var eventsActive = false; // This variable will be set to true if user requests for upcoming events. 
    
    var timer; // This variable will be set to the setTimeout function that will facilitate the system's timer.
    var systemTimerInterval = 1200; // The amount of time (in milliseconds) it takes for the systemTimer to be called.

    var systemAsked = false; // This variable will be set to true if the system asks the user if they need more time.
    var yes = false; // This variable will later be used to check if user says yes.
    var no = false; // This variable will later be used to check if user says no.

    // System's General Voice Responses
    var outputSpeak = "Please say your request!";
    var outputValidRequest = "Please make a valid request.";
    var outputMoreTime = "Do you need more time?";
    var outputSystemReset = "System will reset.";
    var outputOk = "Ok";
    var outputPleaseWait = "Please Wait...";
    var outputWelcome = "Hello, what can I help you with today?";
    var outputMoreRequest = "What else can I help you with today?";
    var outputInvalidRoom = "";
    var outputInvalidFaculty = "";
    var outputListening = "I'm Listening...";
    var outputEvents = "Here's what's happening this month.";
    
    // This is an array of words that the system will visually restrict users from seeing.
    var badWords = ["stupid","a stupid","dumbass","a dumbass", "your mama","idiot","a idiot","dumb","a dumb"];
    
    // This functions handles invalid commands throughout the system's use. Whenever a user says an invalid part of a command such as an invalid room number, a room number that does not exist, a professor name that does not exist, or if they try to say something inapropriate to the system, the system will update the system caption, and Speech Synthesis message to the corresponding error message according to the type of search the user is attempting.
    function outputRepeat (outputItem){            
        var outputTemp = "";

        // If the room number they provided is not a number (i.e. Room Hello), the user will be told that the room they are searching for does not exist. If they are making a professor search and the professor does not exist, they will be told that the professor they are searching for does not exist. 
        if(isNaN(outputItem)){
            if(/\d/.test(outputItem))
                outputTemp = "Sorry, Room " + outputItem + " does not exist. Please make a valid request.";   
            else if(badWords.includes(outputItem))
                outputTemp = "Sorry, that's inappropriate.";  
            else{
                outputItem = outputItem.charAt(0).toUpperCase() + outputItem.slice(1);
                outputTemp = "Sorry, " + outputItem + " does not exist. Please make a valid request.";
            }
        }
        // If the user is searching for a Room that is a number but does not exist in the system, they will be told that the room they are searching for does not exist.
        else
            outputTemp = "Sorry, Room " + outputItem + " does not exist. Please make a valid request.";
        
        // Update the system caption, and Speech Synthesis message to the corresponding error message according to the type of search the user is attempting.
        caption = outputTemp;
        message.text = outputTemp;
        window.speechSynthesis.speak(message);          
    }
    
    // annyang Locator functions
    var roomLocator;
    var facultyLocator;
    
    // Declaration of arrays that will later store strings for faculty members or rooms that have similarities.
    var possibleFaculty = [];
    var possibleRoom = [];

    // Declaration of command objects that will later be used to store different commands that users can use
    var commands = {};
    var mainMenuCommands = {};
    var optionCommands = {};
    
    // Declaration of strings that will later be used to display what is being said by the system, as subtitles. 
    var caption = "";
    var resultsCaption = "";
    
    // This function loops a selection of prefixes in the FACULTY speech bubble of the UI. It give users a flexible visual queue of what prefixes they can use when requesting for faculty members. 
    function facultyPrefixLoop (){
        var text = $(".faculty-commandText .prefix-dynamicText");
        var textIndex = -1;
        $(".faculty-commandText .prefix-dynamicText").addClass("slideInLeft");
        
        setTimeout(function(){
            $(".faculty-commandText .prefix-dynamicText").removeClass("slideInLeft");
        }, 1000);
        
        function showNextText() {
            ++textIndex;
            text.eq(textIndex % text.length)
                .fadeIn(500)
                .delay(2500)
                .fadeOut(500, showNextText);
        }
        showNextText();
    }
    
    // This function loops a selection of commands in the FACULTY speech bubble of the UI. It give users a flexible visual queue of what commands they can use when requesting for faculty members.
    function facultyCommandLoop (){
        var text = $(".faculty-commandText .command-dynamicText");
        var textIndex = -1;
        $(".faculty-commandText .command-dynamicText").addClass("slideInLeft");
        
        setTimeout(function(){
            $(".faculty-commandText .command-dynamicText").removeClass("slideInLeft");
        }, 1000);
        
        function showNextText() {
            ++textIndex;
            text.eq(textIndex % text.length)
                .fadeIn(500)
                .delay(3500)
                .fadeOut(500, showNextText);
        }
        showNextText();
    }
    
    // This function loops a selection of room types in the ROOM speech bubble of the UI. It give users a flexible visual queue to say either a specific room number or a restroom.
    function roomTypeLoop (){
        var text = $(".room-commandText .room-dynamicText");
        var textIndex = -1;
        $(".room-commandText .room-dynamicText").addClass("slideInDown");
        
        setTimeout(function(){
            $(".room-commandText .room-dynamicText").removeClass("slideInDown");
        }, 1000);
        
        function showNextText() {
            ++textIndex;
            text.eq(textIndex % text.length)
                .fadeIn(500)
                .delay(2500)
                .fadeOut(500, showNextText);
        }
        showNextText();
    }
    
    // This function loops a selection of commands in the ROOM speech bubble of the UI. It give users a flexible visual queue of what commands they can use when requesting for rooms.
    function roomCommandLoop (){
        var text = $(".room-commandText .command-dynamicText");
        var textIndex = -1;
        $(".room-commandText .command-dynamicText").addClass("slideInDown");
        
        setTimeout(function(){
            $(".room-commandText .command-dynamicText").removeClass("slideInDown");
        }, 1000);
        
        function showNextText() {
            ++textIndex;
            text.eq(textIndex % text.length)
                .fadeIn(500)
                .delay(3500)
                .fadeOut(500, showNextText);
        }
        showNextText();
    }
    
    // This function animates the text inside the event bubble in the menu page. The animation is for the text to slide in from the right. 
    function eventCommandAnimation(){
        $(".event-dynamicText").addClass("slideInLeft");
        
        setTimeout(function(){
            $(".event-dynamicText").removeClass("slideInLeft");
        }, 1000);
    }
    
    // Function to check if an object is empty
    function isEmpty(obj) {
        for(var key in obj) 
            if(obj.hasOwnProperty(key))
                return false;
        return true;
    }
    
    //Creating voice synthesis utterance object is the current browser has SpeechSynthesis
    if('speechSynthesis' in window){
        var message = new SpeechSynthesisUtterance();
        
        message.text = " ";                 // Sets the initial message
        message.lang = 'en-US';             // Sets the language of the Speech Synthesis Utterance to English
        message.rate = 1;                   // Sets the speaking rate of the Speech Synthesis Utterance to 1 
        
        // Function that is called on the start of every Speech Synthesis Utterance message 
        message.onstart = function(event){ 
            annyang.abort();                                                // Stops annyang from capturing voice while the Speech Synthesis object is talking
                            
            $('#systemMic').attr("src", "css/images/mic-disabled2.png");    // Change mic image to disabled (red mic image).
            $('#subtitle').html(caption);                                   // Updates the caption to the proper corresponding Speech Synthesis Utterance message
        };
        
        // This function is called at the end of every Speech Synthesis Utterance message. It changes the mic image on the system’s interface back to active (green mic image), updates the caption to the proper corresponding Speech Synthesis Utterance message, and calls the promptNewSearch function to animate a prompt to users about making a new search. The caption and the type that is passed on to the promptNewSearch function depends on the current page the users are in, which explains why there is an if statement. Lastly, this function resumes annyang so that users can interact with the system. 
        message.onend = function(event)
        { 
            $('#systemMic').attr("src", "css/images/microphone.png");
            
            //Guiding bubbles (located on the bottom left)
            if(resultShown)  {
                $('#subtitle').html(resultsCaption);
                promptNewSearch("main");
            } 
            else if(clarifyFacultyActive){
                caption = outputListening;
                $('#subtitle').html(caption);
                promptNewSearch("modal");
            }
            else if(eventsActive){
                caption = outputEvents;
                $('#subtitle').html(caption);               
                promptNewSearch("modal");
            }
            else {
                caption = outputListening;
                $('#subtitle').html(caption);
            }
            annyang.resume();
        };
    }
    
    startTime();
 
    $(".blue-block").hide();
    $(".menu-block").hide();
    $("#systemMic").hide();
    $("#subtitle").hide();
    
    $(".result-block").hide();
    $(".events-block").hide();
    
    $(".systemModal").hide();
   
    $(".newSearch-bubble").hide(); 
    $(".newSearch-prompt").hide(); 
      
    $(".newSearch-modalBubble").hide(); 
    $(".newSearch-modalPrompt").hide(); 
    
    // This function displays a prompt for users to make a new search. The location of this animated prompt will depend on the type of screen that the users are in. 
    function promptNewSearch(type){
        // If a user is in the main menu screen, the prompt will appear in the bottom-left corner of the screen
        if(type == "main"){
            $(".newSearch-prompt").show();
            $('.newSearch-prompt').addClass('animated fadeInLeft');
            setTimeout(function(){
                $(".newSearch-bubble").show();
                $('.newSearch-bubble').addClass('animated fadeInDown');
            }, 1000);
        }
        // If a user is in any modal screen, the prompt will appear in the bottom-center of the modal.
        else if(type == "modal"){
            $(".newSearch-modalPrompt").show();
            $('.newSearch-modalPrompt').addClass('animated fadeInLeft');
            setTimeout(function(){
                $(".newSearch-modalBubble").show();
                $('.newSearch-modalBubble').addClass('animated fadeInDown');
            }, 1000);
        }    
    }
    
    //This function is a utility function that is called when a user utilizes a Faculty Location command. When a user makes a Faculty Location command the facultyLocator function will pass the word that was heard by annyang to this function, and this function will check to see if the word is equal to any of the name variations for professor names. If the word is equal to any of the name variations, the word will be returned to the facultyLocator function as the correct faculty name to be used to retrieve the correct faculty information.
    function spellChecker(facName){
        // "Duncan" name vairations"
        if(facName == "Dunkin" || facName == "Dunking")
            return "Duncan";
        
        // "Kim Burge" name variations
        else if(facName == "cambridge" || facName == "Cambridge" || facName == "Kim Birge" || facName == "Kim Bridge"  || facName == "Kim birge" || facName == "Kim Berg" || facName == "Kim Birch" || facName == "Kim Burch")
            return "Kim Burge";
        
        // "Burge" name variations
        else if(facName == "Berg" || facName == "Cambridge" || facName == "Burg" || facName == "Birch" || facName == "Bridge" || facName == "birge" || facName == "Birge" || facName == "bridge" || facName == "Burch" || facName == "burch")
            return "Burge";
        
        // "Jenel Lao" name variations
        else if(facName == "Janelle Lau" || facName == "Professor Lau" || facName == "Janelle now" || facName == "Janelle Lao" || facName == "genola" || facName == "genola" || facName == "genello" || facName == "Janelle out" || facName == "Janel Lao")
            return "Jenel Lao";
        
        // "Lao" name variations
        else if(facName == "Lau" || facName == "out" || facName == "now")
            return "Lao";
        
        // "Di Xu" name variations
        else if(facName == "die shoe" || facName == "disha" || facName == "disa" || facName == "D shoe" || facName == "Daiso" || facName == "DC" || facName == "DC" || facName == "zissou" || facName == "the zoo" || facName == "Dai Chu" || facName == "deitch" || facName == "dye shoe" || facName == "dice shoe" || facName == "D Sue")
            return "Di Xu";
        
        // "Xu" name variations
        else if(facName == "shoe" || facName == "sure" || facName == "Sue" || facName == "zoo")
            return "Xu"; 
        
        // "Young" name variations
        else if(facName == "young" || facName == "You")
            return "Young";
        
        // "Constance Iloh" name variations
        else if(facName == "constance iloh" || facName == "Constance Ehlo" || facName == "constants Hilo" || facName == "Constance I love" || facName == "Constance Ela" || facName == "Constance eilo" || facName == "Constance Isla" || facName == "Constance Hilo" || facName == "Constance eloah" || facName == "Constance Islas")
            return "Constance Iloh";
        
        // "Iloh" name variations
        else if(facName == "I know" || facName == "I lo" || facName == "Missy Lowe" || facName == "Constance eloah" || facName == "Ehlo" || facName == "Hilo" || facName == "I low" || facName == "I love" || facName == "eloah")
            return "Iloh";
        
        // "Deborah Vandell" name variations
        else if(facName == "Deborah vendell" || facName == "Deborah vandal" || facName == "Deborah vandal" || facName == "Deborah vandell" || facName == "Deborah Vando" || facName == "Deborah Van Dale" || facName == "Deborah Venta" || facName == "Deborah Vendome" || facName == "Deborah vendal" || facName == "Deborah van daele" || facName == "Deborah Venda" || facName == "Deborah Van-Del" || facName == "Deborah Vendo" || facName == "Debra vendal" || facName == "Debra vendel" || facName == "Debra Vendo" || facName == "Debra Van-Del")
            return "Deborah Vandell";
        
        // "Vandell" name variations
        else if(facName == "vendell" || facName == "bandel" || facName == "Van Dell" || facName == "vandal" || facName == "Vandell" || facName == "vandell" || facName == "van daele" || facName == "Venda" || facName == "Vendo" || facName == "Van-Del" || facName == "Bendo" || facName == "Vindale" || facName == "vendal" || facName == "Bendell")
            return "Vandell";
        
        // "Melinda Petre" name variations
        else if(facName == "Melinda petre" || facName == "Melinda Petrie" || facName == "Melinda Petry" || facName == "Melinda Peter" || facName == "Melinda better" || facName == "Melinda Petra" || facName == "Melinda Penner")
            return "Melinda Petre";
        
        // "Petre" name variations
        else if(facName == "Petri" || facName == "Petrie" || facName == "Petry" || facName == "Peter" || facName == "petre" || facName == "Petra" || facName == "Putter")
            return "Petre";
        
        // "Jacquelynne Eccles" name variations
        else if(facName == "Jacqueline Echols" || facName == "Jacqueline eckley's" || facName == "Jaclyn eckley's" || facName == "Jacqueline eclise" || facName == "Jaclyn a class" || facName == "Jacqueline Ellis" || facName == "Jacqueline eClass" || facName == "Jacqueline Equus" )         
            return "Jacquelynne Eccles";
        
        // "Eccles" name variations
        else if(facName == "Echols"|| facName == "a class" || facName == "glass" || facName=="at glass" || facName == "akhilesh" || facName == "ecla" || facName == "eckley's" || facName == "X")
            return "Eccles";
         
        // "Liane Brouillette" name variations
        else if(facName == "Liane brouillette" || facName == "Leon brouillette" || facName == "Leanne bralette" || facName == "Lee Ann brouillette" || facName == "Lee Ann Brewery" || facName == "Lee Anne Burrell at" || facName == "Lee Anne Burrell"  || facName == "Leon roulette" || facName == "Leanne Grill at" || facName == "Leon bralette")
            return "Liane Brouillette";
        
        // "Brouillette" name variations
        else if(facName == "brouillette" || facName == "bralette")
            return "Brouillette";
        
        // "David Lim" name variations
        else if(facName == "David Lynn")
            return "David Lim";
        
        // "Lim" name variations
        else if(facName == "Lynn")
            return "Lim";    
        
        // "Geneva Lopez-Sandoval" name variations
        else if(facName == "Geneva Lopez Sandoval" || facName == "jenefir lopez sandoval" || facName == "Geneva Lopez" || facName == "Geneva Sandoval" || facName == "Geneva sandals")
            return "Geneva Lopez-Sandoval";
        
        // "Lopez-Sandoval" name variations
        else if(facName == "Lopez Sandoval")
            return "Lopez-Sandoval"
            
        // "Sarah Singh" name variations
        else if(facName == "Sarah sing" || facName == "ceresin" || facName == "Sarah singe" || facName == "Sarah sink" || facName == "terracing") 
            return "Sarah Singh";
        
        // "Singh" name variations
        else if(facName == "sing")
            return "Singh";
        
        // "Susan Toma-Berge" name variations
        else if(facName == "Susan Toma bears" || facName == "Susan Toma Berg" || facName == "Susan Toma bush" || facName == "Susan Toma Burj" || facName == "Susan Toma Burge" || facName == "Susan Toma Birch" || facName == "Susan Thelma Burge" || facName == "Susan Tama Burge" || facName == "Susan Birch" || facName == "Susan Tory Burch" || facName == "Susan Toma Bridge" || facName == "Susan Toma bersch" || facName == "Susan Toma Berge")
            return "Susan Toma-Berge";
        
        // "Toma-Berge" name variations
        else if (facName == "Toma Berg" || facName == "Toma bersch" || facName == "Toma Burge" || facName == "Toma bears" || facName == "Toma Bridge" || facName == "Tama Burge" || facName == "Toma Birch" || facName == "Thelma Burge" || facName == "Toma Burj" || facName == "Toma Berge")
            return "Toma-Berge";
        
        // "Jeanne Stone" name variations
        else if(facName == "Gene Stone" || facName == "June Stone" || facName == "jeans Stone" || facName == "Jean Stone")
            return "Jeanne Stone";
        
        // "Stone" name variations
        else if(facName == "stone")
            return "Stone";
        
        // "Maria Takacs" name variations
        else if(facName == "Maria tax" || facName == "Murrieta Cox" || facName == "Maria tactics" || facName == "Maria tac-x" || facName == "Mystic X" || facName == "Murrieta")
            return "Maria Takacs";
        
        // "Takacs" name variations
        else if(facName == "tac-x" || facName == "cats" || facName == "tacacs" || facName == "the cats" || facName == "it to cats" || facName == "tax" || facName == "tactics" || facName == "Technics" || facName == "a tech X" || facName == "Tech X")
            return "Takacs";
        
        // "Sandra Simpkins" name variations
        else if(facName == "Sandra Simkins")
            return "Sandra Simpkins";
        
        // "Simpkins" name variations
        else if(facName == "Simkins")
            return "Simpkins";
        
        // "Maria Rosales-Rueda" name variations
        else if(facName == "Maria Rosales weather" || facName == "Maria Rosales Loretta" || facName == "Maria Rosales Ruda" || facName == "Maria Rosales reta" || facName == "Maria Rosales Beretta" || facName == "Maria Rosales" || facName == "Maria Goretti" || facName == "Maria Rosales Murrieta" || facName == "Maria Rosales Florida" || facName == "Maria Rosales Rueda" || facName == "Maria Rosales Bru weather")
            return "Maria Rosales-Rueda";
        
        // "Rosales-Rueda" name variations
        else if(facName == "Rosales Rueda" || facName == "Rosales Beretta" || facName == "Rosales Murrieta" || facName == "Rosales reta" || facName == "Rosales Loretta" || facName == "Rosales weather" || facName == "Maria Rosales La Mirada" || facName == "Rosales ruella")
            return "Rosales-Rueda";
        
        // "Jamal Abedi" name variations
        else if(facName == "Jamal a Betty" || facName == "Jamal abedi" || facName == "Chemawa Betty" || facName == "Jamal Betty")
            return "Jamal Abedi";
        
        // "Abedi" name variations
        else if(facName == "a Betty" || facName == "abiti" || facName == "Betty")
            return "Abedi";
        
        // "Virginia Panish" name variations
        else if(facName == "Virginia panish" || facName == "Virginia punished" || facName == "Virginia Peniche")
            return "Virginia Panish";
        
        // "Panish" name variations
        else if(facName == "panish" || facName == "punish" || facName == "Spanish")
            return "Panish";
       
        // "Sue Vaughn" name variations
        else if(facName == "Sudan" || facName == "Sylvan" || facName == "Sue Bond")
            return "Sue Vaughn";
        
        // "Vaughn" name variations
        else if(facName == "von" || facName == "Von" || facName == "Vaughan")
            return "Vaughn";
        
        // "Jeff Johnston" name variations
        else if(facName == "Jeff Johnson")
            return "Jeff Johnston";
        
        // "Johnston" name variations
        else if(facName == "Johnson")
            return "Johnston";
        
        // "Denise Earley" name variations
        else if(facName == "Denise early" || facName == "Denise Ireland")
            return "Denise Earley";
        
        // "Earley" name variations
        else if(facName == "early" || facName == "ear Lee")
            return "Earley";
        
        // "Rhett Lowe" name variations
        else if(facName == "right low" || facName == "rat low" || facName == "Right low" || facName == "reloj" || facName == "Reloj")
            return "Rhett Lowe";
        
        // "Lowe" name variations
        else if(facName == "low")
            return "Lowe";

        // "Hyuk Kang" name variations
        else if(facName == "cute King" || facName == "cute Kang" || facName == "Kyu Kang" || facName == "Hugh Kang" || facName == "puke King" || facName == "Hugh King" || facName == "Hugh Cain" || facName == "UK" || facName == "Huck King" || facName == "Hayek King" || facName == "How you came" || facName == "heeyook kang" || facName == "hip pain" || facName == "hyatt pinion" || facName == "hugh connell")
            return "Hyuk Kang";
        
        // "Kang" name variations
        else if(facName == "King" || facName == "king" || facName == "kane" || facName == "Ken")
            return "Kang";
        
        // "Hosun Kang" name variations
        else if(facName == "ho Sun King" | facName == "ho-sun Kang" || facName == "ho-sun King" || facName == "Hole Sun King" || facName == "ho Sung Kang")
            return "Hosun Kang";
        
        // "Jade Jenkins" name variations
        else if(facName == "Jayda Jenkins" || facName == "Jay Jenkins" || facName == "J Jenkins" || facName == "Jada Jenkins")
            return "Jade Jenkins";
        
        // "McDougall" name variations
        else if(facName == "mcdugle")
            return "McDougall";
        
        // "Spenser Clark" name variations
        else if(facName == "Spencer Clark")
            return "Spenser Clark";
        
        else if(facName == "new search" || facName == "research")
            return "new search";

        return facName;
    }
    
    // When users request for upcoming events, this function is executed and a modal for upcoming events will be displayed.
     function displayEventModal (){
         eventsActive = true;   
         timeLeft = grantTime;
         commandManager("ResultsView");
         
         $('.modal-event').show();
         $(".calendar-title").show();
         $("#calendar-block").hide();
         
            $('.calendar-title').addClass('animated fadeInLeft');
            setTimeout(function(){
                $("#calendar-block").show();
                $('#calendar-block').addClass('animated fadeIn');
            }, 1000);
         
         caption = outputEvents;
         message.text = caption;
         window.speechSynthesis.speak(message);            
    }
    
    // When users request for a faculty member with a non-unique last name, this function is executed and a modal for faculty options will be displayed. This modal dynamically lists down more than one faculty member with the same last name, each of which has an associated number that the users must choose to receive the desired result. 
    function displayOptionsModal(data,duplicatesArray) {
        clarifyFacultyActive = true;
        timeLeft = grantTime;
        commandManager("OptionsView");
        $(".newSearch-modalPrompt").hide();
        $(".newSearch-modalBubble").hide();
        $(".modal-clarifyPrefix").hide();
        $('#dynamic-options').empty();                
        $(".modal-bg").show();
        
        $('.modal-options').addClass('animated fadeInDown');
        
        var htmlString = "<ul>";
        
        var myStr = "";
        var count;
                
        if(isNaN(duplicatesArray[0]))
            for(var i = 0; i < duplicatesArray.length ; i++)
                 myStr = myStr + "<p>" + (i+1) + " - " + data.faculty[duplicatesArray[i]].fullName + "</p>";
        else{
            if(duplicatesArray[0] == "2005"){
                for(var i = 0; i < duplicatesArray.length ; i++){
                     myStr = myStr + "<p>" + (i+1) + " - Room " + data.rooms[duplicatesArray[i]].roomNumber + " - " + data.rooms[duplicatesArray[i]].facultyName +"</p>";
                }
            }
            else{
                for(var i = 1; i < duplicatesArray.length ; i++){
                     myStr = myStr + "<p>" + i + " - Room " + data.rooms[duplicatesArray[i]].roomNumber + " - " + data.rooms[duplicatesArray[i]].facultyName +"</p>";
                }
            } 
        }
        
        systemAsked = false;
        
        $('#dynamic-options').append(myStr);        
    }
    
    // When users request for a faculty member with a non-unique last name, this function is executed and a modal for faculty options will be displayed. This function prompts users to say the number associated with the specific item (room or faculty member) in the modal list. 
    function multipleItemResponse(item){
        caption = "Please say the number of the " + item + " you're referring to.";
        //Notify user that there are multiple faculty members with the last name
        message.text = caption;
        window.speechSynthesis.speak(message);
    }
    
    // When no interaction has been made with the system for a specific amount of   time, this function is executed. It reloads the window and notifies users that the system will reset, through a voice response.
    function endSystem() {
        message.text = outputSystemReset;
        window.speechSynthesis.speak(message);
        window.location.reload();   
    }
    
    // This function displays the system clock on the top right of the interface to show users what the current time is. 
    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        document.getElementById('time').innerHTML =
        h + ":" + m;
        var t = setTimeout(startTime, 500);
    }
    
    // This function ensures that there is a zero in front of numbers that are less than 10. 
    function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }
        
    // This function is executed within the displayMenuView function. It resets the html elements of the results that were displayed in the results page to empty elements, to avoid stacking information when users make one request after another. 
    function removeResults(){
        $(".room-name").html("");
        $(".room-type").html("");
        $(".room-img").css('background-image', 'none');
        $(".room-map").attr("src", "");
        $(".faculty-name").html("");
        
        $('.fac-info').css('display','none');
        $('.officeHours').hide();        
        $('.faculty-hours').html("");
    }
    
    // This function is executed when users request for a new search. It returns them to the menu page, where they can make new requests. 
    function displayMenuView(){
        removeResults();
        
        // Hide Prompts
        $(".newSearch-prompt").hide();
        $(".newSearch-bubble").hide();
        
        $(".newSearch-modalPrompt").hide();
        $(".newSearch-modalBubble").hide();
        
        $(".instruction-prompt").hide();
        $(".instruction-bubble").hide();        
        
        // Hide blocks except Menu
        $(".result-block").hide();
        $(".events-block").hide();
        $(".systemModal").hide();
        
        // Show Menu block
        $(".menu-block").show();
        $("#systemMic").show();
        $("#subtitle").show();
        
        timeLeft = grantTime;
        commandManager("MainMenu");
        
        if(resultShown){
            caption = outputMoreRequest;
            message.text = caption;
        }
        else if(clarifyFacultyActive){
            caption = outputMoreRequest;
            message.text = caption;
        }
        else if(eventsActive){
            caption = outputMoreRequest;
            message.text = caption;
        }
        else{
            caption = outputPleaseWait;
            message.text = outputWelcome;
        }

        resultShown = false;
        clarifyFacultyActive = false;
        eventsActive = false;
        
        roomLocatorActive = false;
        facultyLocatorActive = false;
        
        //For YesOrNo
        yes = false;
        no = false;
        
        // Remove Animations
        $(".room-name").removeClass('slideInDown');
        $(".room-type").removeClass('slideInDown');
        $(".room-img").removeClass('fadeIn');
        $(".room-map").removeClass('fadeIn');

        $(".faculty-name").removeClass('slideInDown');
        $(".faculty-email").removeClass('slideInDown');
        $(".faculty-number").removeClass('slideInDown');
        $(".faculty-img").removeClass('fadeIn');   
        $(".label").removeClass('slideInDown');   
        
        possibleFaculty = [];
        possibleRoom = [];
        
        window.speechSynthesis.speak(message);
    }
    
    // This function is executed when users successfully make a request to the system. It takes in a data object and an input that represents either a room number or a faculty name. This function handles many instances of user inputs that can vary, depending on the kind of request they provide. For example, if a user requests for information about a certain room, this function handles room names that are: 1) numbers only, and 2) alphanumeric. What is being displayed will also depend on the type of input is passed on to this function. For example, if the room input is a faculty office, then the function would display the associated faculty member’s picture; but if the room type is a classroom, then the function would display the picture of the actual room. The office hours is also handled by this function. Through a for loop, this function is able to dynamically display a faculty member’s office hours, depending on the information stored in the data.
    function displayResultsView(data, input){
        $('.instruction-container').hide();
        commandManager("ResultsView");

        $(".menu-block").hide();
        $(".systemModal").hide();
        $(".result-block").show();
        
        var num;
        
        if(isNaN(input)) {
            if(/\d/.test(input)){
                num = input;
                message.text = data.rooms[num].voiceResponseRoom;
                window.speechSynthesis.speak(message);    
            }
            else{
                num = data.faculty[input].roomName;
                message.text = data.rooms[num].voiceResponseFaculty;
                window.speechSynthesis.speak(message);
                
                $(".faculty-name").html(data.rooms[num].facultyName);
                $(".faculty-email").html(data.rooms[num].facultyEmail);
                $(".faculty-number").html(data.rooms[num].facultyNumber);
                $(".faculty-img").attr("src", "css/" + data.rooms[num].facultyImage);    
            }            
        }
        else {
            num = input;
            message.text = data.rooms[num].voiceResponseRoom;
            window.speechSynthesis.speak(message);
        }
        
        $(".room-name").html(data.rooms[num].roomName);
        $(".room-type").html(data.rooms[num].roomType);
        $(".room-img").css('background-image', 'url(css/' + data.rooms[num].roomImage + ')');
        $(".room-map").attr("src", "css/" + data.rooms[num].mapImage);
        
        var roomType = data.rooms[num].roomType;
        
        if(roomType == "Faculty Office"){
            $(".faculty-name").html(data.rooms[num].facultyName);
            $(".faculty-email").html(data.rooms[num].facultyEmail);
            $(".faculty-number").html(data.rooms[num].facultyNumber);
            $(".faculty-img").attr("src", "css/" + data.rooms[num].facultyImage);    

            $('.room-img').css('display', 'none');
            $('.fac-info').css('display','block');
        }
        else {
            $('.room-img').css('display', 'block');
            $('.fac-info').css('display', 'none');
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
        
        roomLocatorActive = false;
        facultyLocatorActive = false;
        
        // Animate results        
        $(".room-name").addClass('slideInDown');
        $(".room-type").addClass('slideInDown');
        $(".room-img").addClass('fadeIn');
        $(".room-map").addClass('fadeIn');

        $(".faculty-name").hide();
        $(".faculty-email").hide();
        $(".faculty-number").hide();
        $(".faculty-img").hide();
        $(".label").hide();  
   
        $(".faculty-name").show();
        $(".faculty-email").show();
        $(".faculty-number").show();
        $(".faculty-img").show();
        $(".label").show();

        $(".faculty-name").addClass('slideInDown');
        $(".faculty-email").addClass('slideInDown');
        $(".faculty-number").addClass('slideInDown');
        $(".faculty-img").addClass('fadeIn'); 
        $(".label").addClass('slideInDown');   
    }
    
    // This function is executed within the yesOrno function, given that the systemAsked variable is true.  
    function moretime() {
        // If the variable passed on to the yesOrno function is “yes” (meaning that the user requests for more system time), this function grants more time to the system and responds with the appropriate voice response.
        if(yes) {
            timeLeft = grantTime;

            caption = outputOk;
            message.text = outputOk;
            window.speechSynthesis.speak(message);
            
            systemAsked = false;
            yes = false;
        }
        // If the variable passed on to the yesOrno function is “no”, (meaning that the user does not need more time), this function would either end the system (if the user is currently in the menu page) or return the user to the menu page (if the user is currently in any results page). 
        else if(no){
            if(resultShown)
                displayMenuView();
            else if(clarifyFacultyActive)
                displayMenuView();
            else if(eventsActive)
                displayMenuView();
            else
                endSystem();
        }
    }
    
    // This function represents the system timer that includes a setTimeout function that is repeatedly called every second. The variable used to represent the amount of time users have is called timeLeft, which is initially set to 55 seconds and is decremented by 1 second every time the setTimeout function gets called. Once timeLeft has been decremented down to 30 seconds, the system would ask the users - for the first time - if they need more time. The function then sets timeLeft back to its initial state (55 seconds) if users respond with a “yes”, and either ends the system or goes back to the results page (depending on what their current page is) if users respond with a “no”. If users do not respond, timeLeft will continue to be decremented until it reaches the next time checkpoint, which is 10 seconds, in which case the system would prompt the users again if they need more time. The same procedure applies, but if users still do not respond, timeLeft will eventually be decremented to 0 and the system will end. 
    function systemTimer() {                        
        timer = setTimeout(function(){
            timeLeft--; 
            $('#timeLeft').html(timeLeft);
            
            if(timeLeft == timeToAskFirst || timeLeft == timeToAskSecond) {
                if(timeLeft == timeToAskFirst && !resultShown){
                    message.text = outputMoreTime;
                    window.speechSynthesis.speak(message);
                    
                    caption = outputMoreTime;
                    systemAsked = true; 
                } 
                
                if(timeLeft == timeToAskSecond && !resultShown) 
                    endSystem();
                
                if(resultShown) {
                    message.text = outputMoreTime;
                    window.speechSynthesis.speak(message);
                    
                    caption = outputMoreTime;
                    systemAsked = true; 
                }
                systemTimer();
            }   
            else if(timeLeft == timeToEnd)
                endSystem();
            else
                systemTimer();

        },systemTimerInterval);
    }

    // This function handles what commands are available to a user at various parts of the system. The function contains a switch statement and depending the value of the commandKey parameter, certain commands will be made available to the user.
    function commandManager(commandKey){
        switch(commandKey){
            // Room Location, Professor Location, and Upcoming Events commands will be made available
            case "MainMenu": 
                annyang.addCommands(mainMenuCommands);
                annyang.removeCommands('(number) :number');
                break;
            // New Search, and the ability to respond yes or no to a more time needed prompt will be made available.
            case "ResultsView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.removeCommands(optionCommands);
                break;
            //The command to choose the option based on the modal, and the ability to respond yes or no to a more time needed prompt will be made available. 
            case "OptionsView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.removeCommands(optionCommands);
                if(clarifyFacultyActive)
                    annyang.addCommands(optionCommands);
                break;
            // New Search, and the ability to respond yes or no to a more time needed prompt will be made available.
            case "CalendarView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                break;
        }   
    }
    
    // This function is executed when users press the START button in the home page of the system. It is the central function that jump starts the system’s operations and functionalities. Contents of data,json, the file that has been parsed with all of the room and faculty information is passed to this function as an object named “data”. This function initiates the system time through calling the systemTimer function. Within this function, multiple command functions are declared, including the facultyLocator, roomLocator, yesOrno, optionFunc, and yourWelcome functions. This function also encapsulates the different command objects, such as mainMenuCommands, exitCommands, regular commands, and optionCommands. The data that is passed on to this function is used to access the contents stored in the JSON file, containing organized information about rooms and faculty members. 
    function startSystem(data) {     
        systemTimer();

        caption = outputWelcome;
        message.text = outputWelcome;
        window.speechSynthesis.speak(message);
         
        
        // This function is executed when a user makes a request for a particular room in the 2nd floor. First, it checks if roomNum - the input being passed on to this function - is matched with a key in the "rooms" object stored in data.JSON. If it doesn't match, it calls the outputRepeat function, informing the user that the room does not exist and prompting them to make a valid request. However, if roomNum matches with a key in the data, the roomLocatorActive will be set to true, which means that the system is ready to process roomNum and display the information to the user. Because there are rooms that have similar variations in their names (for example, Room 2005 and Room 2005a), this function checks to see if there are any variations of roomNum and stores those variations in an array called possibleRoom. If there are no variations, roomNum also gets stored in the array as a single element. The function then checks if the array has a length greater than 1. If so, it calls the displayOptionsModal function, passing on the data and the array itself, where it would later display all the variations in a modal. If not, it calls the displayResultsView function, which basically displays all the textual and visual information associated with roomNum. On top of these operations, the function also calls the multipleItemResponse function outputing the system's voice response telling users that there are multiple variations of the room they requested for. The function also updates the caption variables, making sure that the subtitles shown in the user interface matches what is being said by the system. Lastly, because this function is called as a result of the user's interaction, additional time is granted.         
        roomLocator = function(roomNum) {  
            if(!(roomNum in data.rooms))   
                outputRepeat(roomNum);                           
            else {
                roomLocatorActive = true;
                var tempStr = "";
                var letter = "a";
                possibleRoom = [roomNum];
                
                for(var i = 0; ;i++){
                    tempStr = roomNum + letter;
                    
                    if(tempStr in data.rooms)
                        possibleRoom.push(tempStr);
                    else
                        break;
                    
                    letter = String.fromCharCode(letter.charCodeAt() + 1);
                }
                    
                if(possibleRoom.length > 1){
                    displayOptionsModal(data, possibleRoom);
                    multipleItemResponse("room");
                }
                else{
                    console.log(roomNum);
                    displayResultsView(data, roomNum);
                    resultShown = true; 

                    caption = data.rooms[roomNum].voiceResponseRoom;
                    resultsCaption = caption;
                }                  
            }
            timeLeft = grantTime; 
        };
        
        // This function is executed when a user requests for the location of a faculty member's office. First, the name being searched for is sent to the spellChecker function to make sure that if facName is a name variation, we use the proper faculty name for the search. Once facName returns it is compared to a list of badwords, and if the facName includes a bad word the facultyLocator function returns and stops the search and tells the user that is inappropriate. There are two valid ways a user can search for faculty the first is providing only last name (i.e. Professor Duncan) and the second is providing a full name (i.e. Professor Greg Duncan). If the user only provides last name in their search, a loop will search data.JSON to compare the facName variable with a key in the JSON file. If a key is not found, the function will return, and the user will be told that the faculty member they are searching for does not exist. If a match is found in data.JSON file two things can occur. First, if there are two matches with the same last name(i.e. Greg Duncan and Robert Duncan), a user will then be shown a modal with the faculty options with that last name listed so that they can tell the system which faculty member they were referring to, and once they select an option, they will see the results of their search. Second, if there is only one match then they will see the results of their search. If the user provides both first and last name, a loop will search data.JSON to compare the facName variable with a key in the JSON file. If a key is not found the function will return, and the user will be told that the faculty member they are searching for does not exist.
        facultyLocator = function(facName) {  
            //Spell check faculty name input
            facName = spellChecker(facName);
            
            var splitFacName = facName.split(" ");
            var firstName = splitFacName[0];
            var lastName = splitFacName[1];
            
            var firstNameNoCaps = firstName;
            var firstNameNoCaps = firstNameNoCaps.toLowerCase();
            if(badWords.includes(firstName)){
                outputRepeat(firstName);
                return;
            }
            
            var matchFound = false;
            possibleFaculty = [];
            facultyLocatorActive = true;
            
            //If they only provided one name (i.e. Professor Denenberg)
            if(lastName == null){
                for(key in data.faculty){
                    var keyCheck = key.split(" ");

                    if(facName == keyCheck[1]){
                        matchFound = true;
                        possibleFaculty.push(key);
                    }
                }

                if(!matchFound)
                    outputRepeat(facName);
                else{   
                    if(possibleFaculty.length > 1){
                        //display to DOM
                        displayOptionsModal(data, possibleFaculty);

                        //speech for modal
                        multipleItemResponse("faculty member");
                    }
                    else{
                        displayResultsView(data, possibleFaculty[0]);
                        resultShown = true;

                        var num = data.faculty[possibleFaculty[0]].roomName;
                        caption = data.rooms[num].voiceResponseFaculty;
                        resultsCaption = caption;
                    }
                }
            }
            // If they provide first and last name.
            else{
                if(!(facName in data.faculty))
                    outputRepeat(facName);                            
                else{

                    displayResultsView(data, facName);
                    resultShown = true;

                    var num = data.faculty[facName].roomName;

                    caption = data.rooms[num].voiceResponseFaculty;
                    resultsCaption = caption;
                }
            }
            
            timeLeft = grantTime;
        };

        // This function is called when a user to responds when they system asks them if they need more time to use the system.
        var yesOrno = function(randomWord){
            if(systemAsked) {
                if(randomWord == "yes")
                    yes = true;
                else if(randomWord == "no")
                    no = true;
                moretime();
            }
        };
        
        // This function converts a number in alphabetical form into a number in numeric form and returns that number.
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
            else if (!isNaN(word))
                return word;
        }
        
        // This function is executed when a user chooses from the options that are displayed by the “Faculty Options” modal. It takes in a number that can either be in alphabetical form or in numeric form, but this function can only work with the numeric form. In order to accommodate to this, this function converts all possible inputs (numString) into numeric forms using the convertToNumber function. In doing so, this function is able to use that number to locate the index of the chosen item that users picked from the modal. 
        var optionFunc = function(numString){
            var index = convertToNumber(numString) - 1;

            if(!isNaN(index)){
                if(index >= possibleRoom.length && index >= possibleRoom.length - 1 && roomLocatorActive){
                    caption = outputValidRequest;
                    message.text = caption;
                    window.speechSynthesis.speak(message);
                    return;
                }
                   
                annyang.addCommands(commands);
                var indexItem = "";

                if(roomLocatorActive){
                    if(possibleRoom[0] == "2005")
                        indexItem = possibleRoom[index]; 
                    else
                        indexItem = possibleRoom[index+1];  
                    
                    caption = data.rooms[indexItem].voiceResponseRoom;
                }
                else if(facultyLocatorActive){
                    indexItem = possibleFaculty[index];
                    num = data.faculty[possibleFaculty[index]].roomName;
                    caption = data.rooms[num].voiceResponseFaculty;
                }
                resultsCaption = caption;

                annyang.removeCommands(optionCommands);
                displayResultsView(data, indexItem);
                resultShown = true;
            }
            else{
                if(spellChecker(numString) == "new search")
                    displayMenuView();
                else{
                    caption = outputValidRequest;
                    message.text = caption;
                    window.speechSynthesis.speak(message);
                    return;
                }
            }            
        };
        
        // This function is called when the user says "thank you" after receiving results. It tells the user "You're Welcome", and updates the system subtime accordingly.
        var youreWelcome = function(){
            caption = "You're Welcome!";
            message.text = "You're Welcome!";
            window.speechSynthesis.speak(message);
        }
        
        // These are the commands that are available once the user presses the "Start" button to activate the system. They are divided into 3 types of commands, Room Location commands, Professor Location commands, and Upcoming Events commands.
        mainMenuCommands = {
            // * = capture everything after 
            // : = capture only one word    
            
            // Room Locator Commands: These commands handle all of the different variaitons in which users can search for room locations.
            'I am looking for room *roomNum' : roomLocator,
            "I'm looking for room *roomNum" : roomLocator,
            "I'm looking for a room *roomNum" : roomLocator,
            'Where is room *roomNum' : roomLocator,
            'Where\'s room *roomNum' : roomLocator,
            'room *roomNum' : roomLocator,
            
            // Faculty Locator Commands: These commands handle all of the different variations in which users can search for Professor Office Locations.
            "I'm looking for dr. *name":facultyLocator,
            "I'm looking for dr *name":facultyLocator,
            "I'm looking for a dr *name":facultyLocator,
            "I'm looking for a doctor *name":facultyLocator,
            "I'm looking for doctor *name":facultyLocator,
            "I'm looking for a professor *name":facultyLocator, 
            "I'm looking for professor *name":facultyLocator, 
            'I am looking for professor *name':facultyLocator,
            
            "Where is dr. *name":facultyLocator,
            "Where is dr *name":facultyLocator,
            "Where is a professor *name":facultyLocator, 
            "Where is A professor *name":facultyLocator, 
            "Where is professor *name":facultyLocator, 
            
            "Where\'s dr. *name":facultyLocator,
            "Where\'s dr *name":facultyLocator,
            "Where\'s a professor *name":facultyLocator, 
            "Where\'s A professor *name":facultyLocator, 
            "Where\'s professor *name":facultyLocator, 
            
            'I am looking for *name':facultyLocator,
            'I\'m looking for *name':facultyLocator,
            'I am looking for a *name':facultyLocator,
            'I am looking for A *name':facultyLocator,
            'I\'m looking for a *name':facultyLocator,
            'I\'m looking for A *name':facultyLocator,
            
            'Where is *name':facultyLocator,
            'Where\'s *name':facultyLocator,
            'Where is a *name':facultyLocator,
            'Where is A *name':facultyLocator,
            'Where\'s a *name':facultyLocator,
            'Where\'s A *name':facultyLocator,
            
            //Upcoming Events: These commands handle all the ways that users could ask to see upcoming events.
            'What events are coming up' : displayEventModal,
            'Show me upcoming events' : displayEventModal,
            'I want to know upcoming events' : displayEventModal,
            
            // randomWord can only be yes or no now to avoid it being called every time. 
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : yesOrno}
        };
        
        // These are the commands that are available to users when they reach a Results Page after requesting a valid Room Location, Professor Location, or Upcoming Events.
        commands = {
            // * = capture everything after 
            // : = capture only one word
            
            'new search' : displayMenuView,
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : yesOrno},
            'thank you' : youreWelcome
        };
        
        // This command is available to users when they ask for a Room Location, or Professor Location and they are given the option to choose between options. An example of this would be if they ask for Professor Duncan, a modal will appear that will ask the user which professor Duncan they are referring to (Greg Duncan or Robert Duncan).
        optionCommands = {
            // * = capture everything after 
            // : = capture only one word
            '(number) :number' : optionFunc
        };
        
        // Activates the Main Menu commands that are available to users when they press the "Start" button.
        commandManager("MainMenu");
        
        annyang.setLanguage("en-US");           // Sets annyang.js's language to English
        annyang.start({continuous: false});     // Starts annyang.js without continuous mode.
        
        // **Uncomment to turn debug mode on for annyang. js. In debug mode, the words that annyang hears, and the commands that are being added and removed throughout the systems eecution, is printed to the console.
    }
    
    //*********************************************************************************************************   SYSTEM START

    // This is the function occurs when the user presse the start button that is seen when the system is in standby mode.
    $('#startButton').click(function(){
        // Hides all of the dom elements that were visible in the system's standy view
        $(".intro-block").hide();
        $(".menu-block").show();
        $("#systemMic").show();
        $("#subtitle").show();
        
        // Adds the slide in animation to the three command type bubbles.
        $(".left-bubble .bubble").addClass("slideInLeft");
        $(".right-bubble .bubble").addClass("slideInRight");
        $(".center-bubble .bubble").addClass("slideInDown");

        // Adds the fade in animation.
        $(".prompt-block h2").addClass("fadeInUp");
        
        // If annyang exists and is loaded properly, ajax is used to read data.json which contains all of the faculty information.
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
        
        // Starts the visual looping of the different room commands in the room speech bubble of the user Main Menu's interface. 
        roomCommandLoop();  
        
        // Starts the visual looping of the different faculty commands in the faculty speech bubble of the user Main Menu's interface.
        facultyCommandLoop();     
        
        // Starts the visual looping of the prefix commands in the room speech bubble of the user Main Menu's interface.
        roomTypeLoop();         
        
        // Starts the visual looping of the prefix commands in the faculty speech bubble of the Main Menu's interface.
        facultyPrefixLoop();      
        
        // Starts the visual animation of the text inside the event bubble on the Main Menu.
        eventCommandAnimation(); 
    });
    
    // If the user presses the mic icon, they are prompted to say their request so that they know that the main form of navigation is speech and not touch.
    $("#systemMic").click(function(){
        // Remove the slide in animation class from the three command type bubbles.
        $(".left-bubble .bubble").removeClass("slideInLeft");
        $(".right-bubble .bubble").removeClass("slideInRight");
        $(".center-bubble .bubble").removeClass("slideInDown");
        
        // Add the tada ("Shake") animation to the three command type bubbles.
        $(".bubble").addClass("tada");
        
        // Remove the tada ("Shake") animation from the three command type bubbles.
        setTimeout(function(){ 
            $(".bubble").removeClass("tada");
        }, 1000);
        
        // Update the system caption and the Speech Synthesis Utterance message to the proper message telling the user that they are supposed to say their command.
        caption = outputSpeak;
        message.text = outputSpeak;
        window.speechSynthesis.speak(message);

    });
 
}
