window.onload = function(){
                
    var timeLeft = 55; // System countdown after initiation
    var timeToAskFirst = 30; // System will ask if user wants more time after this amount of seconds
    var timeToAskSecond = 10; // Second time asking
    var timeToEnd = 1; // System will reset the system with this amount of seconds left
    var grantTime = 55; // System will grant user extra time (grantTime will be set equal to "timeLeft")

    var roomLocatorActive = false;
    var facultyLocatorActive = false;
    
    var clarifyPrefix_ACTIVE = false;
    var clarifyFaculty_ACTIVE = false;

    var instruction_ACTIVE = false;
    
    var events_ACTIVE = false;
    
    var timer;
    var systemTimerInterval = 1200;

    var systemAsked = false; // Check if system has asked user for more time
    var yes = false;
    var no = false;
    
    var resultShown = false;
    
    var universalName = "";

    // System's General Voice Responses
    var outputSpeak = "Please say your request!";
    var outputValidRequest = "Please make a valid request.";
    var outputMoreTime = "Do you need more time?";
    var outputSystemReset = "System will reset.";
    var outputOk = "Ok";
    var outputPleaseWait = "Please Wait...";
    var welcome = "Hello, what can I help you with today?";
    var outputMoreRequest = "What else can I help you with today?";
    var outputInvalidRoom = "";
    var outputInvalidFaculty = "";
    var validCommand = "Please say a valid command.";
    var outputListening = "I'm Listening...";
    
    //Events Voice Responses
    var eventWeekWelcome = "Here's what's happening this week.";
    var eventTodayWelcome = "Here's what's happening today.";
    var eventMonthWelcome = "Here's what's happening this month.";
    
    var badWords = ["stupid","a stupid","dumbass","a dumbass", "your mama","idiot","a idiot","dumb","a dumb"];
    
    function outputRepeat (outputItem){            
        var outputTemp = "";

        if(isNaN(outputItem)){
            if(/\d/.test(outputItem)){
                outputTemp = "Sorry, Room " + outputItem + " does not exist. Please make a valid request.";   
            }
            else if(badWords.includes(outputItem)){
//                outputItem = outputItem.charAt(0).toLowerCase();
                outputTemp = "Sorry, that's inappropriate.";  
            }
            else{

                outputItem = outputItem.charAt(0).toUpperCase() + outputItem.slice(1);
                 outputTemp = "Sorry, " + outputItem + " does not exist. Please make a valid request.";
            }
               
        }
        else{
            outputTemp = "Sorry, Room " + outputItem + " does not exist. Please make a valid request.";
        }
        
        caption = outputTemp;
        message.text = outputTemp;
        window.speechSynthesis.speak(message);          
    }
    
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

    var validPrefix;
    
    function bubblePrefixFaculty (){
        
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
    
    function bubbleCommandFaculty (){
        
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
    
    function bubblePrefixRoom (){
        
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
    
    function bubbleCommandRoom (){
        
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
    
    function bubbleCommandEvent (){
        
        $(".event-dynamicText").addClass("slideInLeft");
        
        setTimeout(function(){
            $(".event-dynamicText").removeClass("slideInLeft");
        }, 1000);
        
    }
    
    
    // Function to check if an object is empty
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    
    //Creating voice synthesis utterance object is the current browser has SpeechSynthesis
    if('speechSynthesis' in window)
    {
        var message = new SpeechSynthesisUtterance();
        
        message.text = " ";                 // Sets the initial message
        message.lang = 'en-US';             // Sets the language of the Speech Synthesis Utterance to English
        message.rate = 1;                   // Sets the speaking rate of the Speech Synthesis Utterance to 1 
        
        // Function that is called on the start of every Speech Synthesis Utterance message 
        message.onstart = function(event)
        { 
            annyang.abort();                                                // Stops annyang from listening to voice while the Speech Synthesis object is talking
                            
            $('#systemMic').attr("src", "css/images/mic-disabled2.png");    // Change mic image to disabled (red mic image).
            $('#subtitle').html(caption);                                   // Updates the subtitle to the proper caption.
        };
        message.onend = function(event)
        { 
            $('#systemMic').attr("src", "css/images/microphone.png");
            
            
            //GUIDING BUBBLES (located on the bottom left)
            
            if(resultShown)  {
                $('#subtitle').html(resultsCaption);
                promptNewSearch("main");
                
            } 
            else if(clarifyFaculty_ACTIVE){
                caption = outputListening;
                $('#subtitle').html(caption);
                promptNewSearch("modal");
            }
            else if(instruction_ACTIVE){
                caption = outputListening;
                $('#subtitle').html(caption);
                promptExit();
            }
            else if(events_ACTIVE){
                caption = eventMonthWelcome;
                $('#subtitle').html(caption);               
                promptNewSearch("modal");
                
            }
            else {
                caption = outputListening;
                $('#subtitle').html(caption);
                promptInstruction();
            }
            
            annyang.resume();
            
//            if(annyang.isListening() == false)
//            {
//                console.log("listening");  
//                annyang.resume();
//            }
                
            
    
        };
    }
    
//    Failed to execute 'start' on 'SpeechRecognition': recognition has already started.
    
    startTime();
    //*********************************************************************************************************   FUNCTION DECLARATIONS

//    $(".intro-block").hide();
    
    $(".blue-block").hide();
    $(".menu-block").hide();
    $("#systemMic").hide();
    $("#subtitle").hide();
    
    $(".result-block").hide();
    $(".events-block").hide(); //hide events block
    
    $(".systemModal").hide();
   
    // New Search Bubble  
    $(".newSearch-bubble").hide(); 
    $(".newSearch-prompt").hide(); 
    
    // New Search MODAL Bubble  
    $(".newSearch-modalBubble").hide(); 
    $(".newSearch-modalPrompt").hide(); 
    
    // Instruction Bubble
    $(".instruction-bubble").hide(); 
    $(".instruction-prompt").hide();
    
    
    function promptNewSearch(type){
        
        if(type == "main"){
            $(".newSearch-prompt").show();
            $('.newSearch-prompt').addClass('animated fadeInLeft');
            setTimeout(function(){
                $(".newSearch-bubble").show();
                $('.newSearch-bubble').addClass('animated fadeInDown');
            }, 1000);
            
            
        }
        else if(type == "modal"){
            $(".newSearch-modalPrompt").show();
            $('.newSearch-modalPrompt').addClass('animated fadeInLeft');
            setTimeout(function(){
                $(".newSearch-modalBubble").show();
                $('.newSearch-modalBubble').addClass('animated fadeInDown');
            }, 1000);
        }
        else if(type == "calendar"){
            $(".newSearch-modalPrompt").show();
            $('.newSearch-modalPrompt').addClass('animated fadeInLeft');
            setTimeout(function(){
                $(".newSearch-modalBubble").show();
                $('.newSearch-modalBubble').addClass('animated fadeInDown');
            }, 1000);
             
        }
        
    }
    
    function promptInstruction(){
        
        $('.instruction-container').css('display','block');
        $(".instruction-prompt").show();
        $('.instruction-prompt').addClass('animated fadeInLeft');
        setTimeout(function(){
            $(".instruction-bubble").show();
            $('.instruction-bubble').addClass('animated fadeInDown');
        }, 1000);

    }
    
    
    function promptExit(){

        $(".instruction-modalPrompt").show();
        $('.instruction-modalPrompt').addClass('animated fadeInLeft');
        setTimeout(function(){
            $(".instruction-modalBubble").show();
            $('.instruction-modalBubble').addClass('animated fadeInDown');
        }, 1000);
    }
    
    //This function is a utility function that is called when a user utilizes a Faculty Location command. When a user makes a Faculty Location command the facultyLocator function will pass the word that was heard by annyang to this function, and this function will check to see if the word is equal to any of the name variations for professor names. If the word is equal to any of the name variations, the word will be returned to the facultyLocator function as the correct faculty name to be used to retrieve the correct faculty information.
    function spellChecker(facName){
        // "Duncan" name vairations"
        if(facName == "Dunkin" || facName == "Dunking")
            return "Duncan";
        
        
        // "Kim Burge" name variations
        if(facName == "cambridge" || facName == "Cambridge" || facName == "Kim Birge" || facName == "Kim Bridge"  || facName == "Kim birge" || facName == "Kim Berg" || facName == "Kim Birch" || facName == "Kim Burch")
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
        //Check these
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
        //Check These
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
    
     function displayEventModal (){
         events_ACTIVE = true;   
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
         
         caption = eventMonthWelcome;
         message.text = caption;
         window.speechSynthesis.speak(message);
         

        
                 
    }
    
    function displayOptionsModal(data,duplicatesArray) {
        
        clarifyFaculty_ACTIVE = true;
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
                
        if(isNaN(duplicatesArray[0])){
            for(var i = 0; i < duplicatesArray.length ; i++){
                 myStr = myStr + "<p>" + (i+1) + " - " + data.faculty[duplicatesArray[i]].fullName + "</p>";
            }
        }
        else{

        
            if(duplicatesArray[0] == "2005"){
                
                for(var i = 0; i < duplicatesArray.length ; i++){
                     myStr = myStr + "<p>" + (i+1) + " - Room " + data.rooms[duplicatesArray[i]].roomNumber + " - " + data.rooms[duplicatesArray[i]].facultyName +"</p>";
//                    alert(duplicatesArray[i]);
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
    
    function modalResponse(item){
        
        caption = "Please say the number of the " + item + " you're referring to.";
        //Notify user that there are multiple faculty members with the last name
        message.text = caption;
        window.speechSynthesis.speak(message);
        
//        systemPause(output_options, output_options.split(' ').length);
//        delay(output_options, output_options.split(' ').length);
    }
    
    function endSystem() {
        
        message.text = outputSystemReset;
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
    
//    function universalTime() {
//        var time = new Date();
//
//        time = time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true });
//
//        document.getElementById("time").innerHTML = time;
//
//    }
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
    function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
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
            $('#subtitle').html(outputListening);
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
    
    function displayMenuView()
    {
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
//            alert(outputMoreRequest);
            caption = outputMoreRequest;
            message.text = caption;
        }
        else if(clarifyFaculty_ACTIVE){
//            alert(outputMoreRequest);
            caption = outputMoreRequest;
            message.text = caption;
        }
        else if(clarifyPrefix_ACTIVE){
//            alert(outputValidRequest);
            caption = outputValidRequest;
            message.text = caption;
        }
        else if(instruction_ACTIVE){
//            alert(outputMoreRequest);
            caption = outputMoreRequest;
            message.text = caption;
        }
        else if(events_ACTIVE){
            caption = outputMoreRequest;
            message.text = caption;
        }
        else{
            caption = outputPleaseWait;
            message.text = welcome;
        }

        resultShown = false;
        clarifyFaculty_ACTIVE = false;
        clarifyPrefix_ACTIVE = false;
        instruction_ACTIVE = false;
        events_ACTIVE = false;
        
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
    
//    function animateResult(num){
//        
//    }
    
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
//            $('.room-type').css('display','none');
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
        
        // ANIMATE RESULTS
        
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
    
    function moretime() {
        if(yes) {
            timeLeft = grantTime;

            caption = outputOk;
            message.text = outputOk;
            window.speechSynthesis.speak(message);
            
            
            systemAsked = false;
            yes = false;
        }
        else if(no){
            if(resultShown)
                displayMenuView();
            else if(clarifyFaculty_ACTIVE)
                displayMenuView();
            else if(events_ACTIVE)
                displayMenuView();
            else
                endSystem();
        }
            
//            endSystem();
    }

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
    function commandManager(commandKey)
    {
        switch(commandKey)
        {
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
                if(clarifyFaculty_ACTIVE)
                    annyang.addCommands(optionCommands);
                break;
            // New Search, and the ability to respond yes or no to a more time needed prompt will be made available.
            case "CalendarView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
//                annyang.addCommands(eventsOptionsCommands);
                break;
            case "Instruction":
                annyang.addCommands(exitCommands);
                break;
        }   
    }
    
    function startSystem(data) {     
        
        systemTimer();
        
        
        
        caption = welcome;
        message.text = welcome;
        window.speechSynthesis.speak(message);
        
        
        
        roomLocator = function(roomNum) {  
                        
            if(!(roomNum in data.rooms)){
                
                outputRepeat(roomNum);
                
            }                        
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
                    modalResponse("room");
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

        // LIST OF MISTER'S
        
        // Full name
        mrListFullName = ["Jamal Abedi","Rhett Lowe","Hyuk Kang","Spenser Clark","Georg Farkas","Greg Duncan","Robert Duncan","Drew Bailey","Jeff Johnston","David Lim","Neil Young"];
            
        // Last name
        mrListLastName = ["Abedi","Lowe","Kang","Clark","Farkas","Duncan","Duncan","Bailey","Johnston","Lim","Young"];
        
        
        // LIST OF MISS'S
        
        // Full name
        msListFullName = ["Kim Burge","Jenel Lao","Liane Brouillette","Maria Rosales-Rueda","Penelope Collins","Deborah Vandell","Jade Jenkins","Di Xu","Rachel Baker","Emily Penner","Constance Iloh","Hosun Kang","Melinda Petre","Jacquelynne Eccles","Geneva Lopez-Sandoval","Valerie Henry","Sarah Singh","Sue Vaughn","Susan Guilfoyle","Susan Toma-Berge","Jenel Lao","Jeanne Stone","Maria Takacs","Sandra Simpkins","Virginia Panish","Sarah McDougall","Denise Earley"];
            
        // Last name
        msListLastName = ["Burge","Lao","Brouillette","Rosales-Rueda","Collins","Vandell","Jenkins","Xu","Baker","Penner","Iloh","Kang","Petre","Eccles","Lopez-Sandoval","Henry","Singh","Vaughn","Guilfoyle","Toma-Berge","Lao","Stone","Takacs","Simpkins","Panish","McDougall","Earley"];
        
        
        
        clarifyPrefix_MODAL = function(name){
            $('#name').empty();
            commandManager("OptionsView");
            timeLeft = grantTime;
            $('.modal-clarifyPrefix').show();
            $('.modal-options').addClass('animated fadeInDown');
            
            clarifyPrefix_ACTIVE = true;
            
            $('#name').append(name);
        }
        
        
        clarifyPrefix_RESPONSE = function(name){
            var response = "Did you mean: " + name + "?";
            caption = response;
            message.text = caption;
            window.speechSynthesis.speak(message);
        }
        
        mrChecker = function(facName)
        {
            facName = spellChecker(facName);

            
            // Checks to see if facName is in drList. If not in drList indexOf will    return -1.
            if(mrListFullName.indexOf(facName) != -1)
                facultyLocator(facName);
            else if(mrListLastName.indexOf(facName) != -1)
                facultyLocator(facName);
            else if(msListFullName.indexOf(facName) != -1){
                correctName = "Ms. " + facName;
                universalName = facName;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else if(msListLastName.indexOf(facName) != -1){
                correctName = "Ms. " + facName;
                universalName = facName;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else
            {
                outputRepeat(facName);
                
            }
            
        }
      
        msChecker = function(facName)
        {
            facName = spellChecker(facName);
            
            // Checks to see if facName is in drList. If not in drList indexOf will    return -1.
            if(msListFullName.indexOf(facName) != -1)
                facultyLocator(facName);
            else if(msListLastName.indexOf(facName) != -1)
                facultyLocator(facName);
            else if(mrListFullName.indexOf(facName) != -1){
                correctName = "Mr. " + facName;
                universalName = facName;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else if(mrListLastName.indexOf(facName) != -1){
                correctName = "Mr. " + facName;
                universalName = facName;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else
            {
                outputRepeat(facName);
                 
            }
            
        }
        
        professorChecker = function(facName)
        {
            facName = spellChecker(facName);
            
            professorListFullName = ["Kim Burge","Jenel Lao","Liane Brouillette","Jamal Abedi","Maria Rosales-Rueda","Penelope Collins","George Farkas","Deborah Vandell","Jade Jenkins","Di Xu","Greg Duncan","Rachel Baker","Emily Penner","Constance Iloh","Hosun Kang","Robert Duncan","Melinda Petre","Jacquelynne Eccles","Drew Bailey","Geneva Lopez-Sandoval","Valerie Henry","Susan Guilfoyle","Susan Toma-Berge","Jenel Lao","Jeanne Stone","Jeff Johnston","Sandra Simpkins","Virginia Panish"];
            
            professorListLastName = ["Burge","Lao","Brouillette","Abedi","Rosales-Rueda","Collins","Farkas","Vandell","Jenkins","Xu","Duncan","Baker","Penner","Iloh","Kang","Duncan","Petre","Eccles","Bailey","Lopez-Sandoval","Henry","Guilfoyle","Toma-Berge","Lao","Stone","Johnston","Simpkins","Panish"];
            
            // Checks to see if facName is in drList. If not in drList indexOf will    return -1.
            if(professorListFullName.indexOf(facName) != -1)
                facultyLocator(facName);  
            else if(professorListLastName.indexOf(facName) != -1)
                facultyLocator(facName);
//            else if(mrListFullName.indexOf(facName) != -1)
//                facultyLocator(facName);
            else
                outputRepeat(facName);
            
        }
        
        
        drChecker = function(facName)
        {
            facName = spellChecker(facName);
            console.log(facName);
            drListFullName = ["Sandra Simpkins","Virginia Panish","Geneva Lopez-Sandoval","Drew Bailey","Jacquelynne Eccles","Robert Duncan","Constance Iloh","Emily Penner","Rachel Baker","Greg Duncan","Di Xu","Jade Jenkins","Deborah Vandell","George Farkas","Penelope Collins","Susan Toma-Berge","Maria Rosales-Rueda","Jamal Abedi","Liane Brouillette","Jenel Lao","Melinda Petre","Hosun Kang", "Kim Burge"];
            
            
            drListLastName = ["Simpkins","Panish","Lopez-Sandoval","Bailey","Eccles","Duncan","Iloh","Penner","Baker","Duncan","Xu","Jenkins","Vandell","Farkas","Collins","Toma-Berge","Rosales-Rueda","Abedi","Brouillette","Lao","Petre","Kang","Burge"];
            
            
            // Checks to see if facName is in drList. If not in drList indexOf will    return -1.
            if(drListFullName.indexOf(facName) != -1)
                facultyLocator(facName);
            else if(drListLastName.indexOf(facName) != -1)
                facultyLocator(facName);
            else
            {
                outputRepeat(facName);
                
            }
        }
        
        
        // This function is called when a user request the location of a faculty member's office. First the name being searched for is sent to the spellChecker function to make sure that if facName is a name variation, we use the proper faculty name for the search. Once facName returns it is compared to a list of badwords, and if the facName includes a bad word the facultyLocator function returns and stops the search and tells the user that is inappropriate. There are two valid ways a user can search for faculty the first is providing only last name (i.e. Professor Duncan) and the second is providing a full name (i.e. Professor Greg Duncan). If the user only provides last name in their search, a loop will search data.JSON to compare the facName variable with a key in the JSON file. If a key is not found the function will return, and the user will be told that the faculty member they are searching for does not exist. If a match is found in data.JSON file two things can occur. First, if there are two matches with the same last name(i.e. Greg Duncan and Robert Duncan), a user will then be shown a modal with the faculty options with that last name listed so that they can tell the system which faculty member they were referring to, and once they select an option, they will see the results of their search. Second, if there is only one match then they will see the results of their search. If the user provides both first and last name, a loop will search data.JSON to compare the facName variable with a key in the JSON file. If a key is not found the function will return, and the user will be told that the faculty member they are searching for does not exist.
        facultyLocator = function(facName) {  
            //alert(facName);
            
            facName = spellChecker(facName);
            //Spell check faculty name input
            
            //alert(facName);
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
            clarifyPrefix_ACTIVE = false;
            
            //If they only provided one name (i.e. Professor Denenberg)
            if(lastName == null)
                {
                    for(key in data.faculty)
                    {
                        var keyCheck = key.split(" ");
                       // console.log("Key: " + key + " | faculty Input: " + facName + " | Key Comparrison: " + keyCheck[1]);

                        if(facName == keyCheck[1])
                        {
                            matchFound = true;
                            possibleFaculty.push(key);
//                                alert("Possible Faculty: " + possibleFaculty.length);
                        }
                    }
//                    alert(possibleFaculty.length);
                    if(!matchFound)
                    {
                        outputRepeat(facName);
                        
                    }
                    else
                        {   
                           if(possibleFaculty.length > 1) // ooo
                                {
                                    //display to DOM
                                    displayOptionsModal(data, possibleFaculty);
                                    
                                    //speech for modal
                                    modalResponse("faculty member");
                                }
                            else
                                {
                                    displayResultsView(data, possibleFaculty[0]);
                                    resultShown = true;
                                    
                                    
//                                    alert(data.faculty[possibleFaculty[0]].roomName);
                                    
                                    var num = data.faculty[possibleFaculty[0]].roomName;
                                    
                                    caption = data.rooms[num].voiceResponseFaculty;
                                    resultsCaption = caption;
//                                    systemPause((data.rooms[num].voiceResponseFaculty), (data.rooms[num].voiceResponseFaculty).split(' ').length);
                                }
                        }
                }
            // If they provide first and last name.
            else
                {
                    
                        
                    if(!(facName in data.faculty))
                        {
                            outputRepeat(facName);                            
                        }
                    else
                        {
                            
                            displayResultsView(data, facName);
                            resultShown = true;
                            
                            var num = data.faculty[facName].roomName;
                            
                            caption = data.rooms[num].voiceResponseFaculty;
                            resultsCaption = caption;
                        }
                }
            
            timeLeft = grantTime;
        };
        
        // Calendar View Function //
        // This function is called when a user makes an Upcoming Events request. It displays a calendar that is populated with upcoming events in a modal over the Main Menu of the system. From this view, a user can request a new search command.
        calendarView = function() {
           /* var source = "https://calendar.google.com/calendar/embed?mode=MONTH&amp;showNav=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=ucieducationevents%40gmail.com&amp;color=%238D6F47&amp;ctz=America%2FLos_Angeles"
            
            
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
            
            
            events_ACTIVE = true;
            // Makes the commands for the ResultsView available. ("New Search", "Thank You", "Yes", "No")
            commandManager("ResultsView");

            timeLeft = grantTime;

            $(".modal-events").show();
            
            $('.instruction-container').hide();
            
            commandManager("CalendarView");
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
        
        // This function is called when a user to responds when they system asks them if they need more time to use the system.
        var yesOrno = function(randomWord){

//            alert(systemAsked);
            if(systemAsked) {
                if(randomWord == "yes")
                    yes = true;
                else if(randomWord == "no")
                    no = true;
                moretime();
            }
//            
            
            //PREFIX MODAL - ACTIVE
            if(clarifyPrefix_ACTIVE){

                $('#name').empty();
                
                if(randomWord == "yes")
                    facultyLocator(universalName);
                else
                    displayMenuView();
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
            else if (!isNaN(word)) //if it's a number
                return word;
        }
        
        var optionFunc = function(numString){
           // alert("numString: " + numString);
//          
            //alert(roomLocatorActive + " " + facultyLocatorActive);
            var index = convertToNumber(numString) - 1;
            //alert("index: " + index);
//            alert(!isNaN(index));
            
            if(!isNaN(index)){
//                alert("index: " + index + ", faculty length: " + possibleFaculty.length + ", room length: " + possibleRoom.length-1);
                //alert(possibleRoom.length);
                if(index >= possibleRoom.length && index >= possibleRoom.length - 1 && roomLocatorActive){
                    caption = outputValidRequest;
                    message.text = caption;
                    window.speechSynthesis.speak(message);
                    //alert("about to return");
                    return;
                }
                   
                
                annyang.addCommands(commands);

                var indexItem = "";
    //           alert(roomLocatorActive + " " + facultyLocatorActive);
                if(roomLocatorActive){
                    if(possibleRoom[0] == "2005")
                        indexItem = possibleRoom[index]; 
                    else
                        indexItem = possibleRoom[index+1];  
    //                alert(data.rooms[indexItem].voiceResponseRoom);
                    caption = data.rooms[indexItem].voiceResponseRoom;
                }
                else if(facultyLocatorActive){
                    //alert("fac locator active");
                    indexItem = possibleFaculty[index];
                    num = data.faculty[possibleFaculty[index]].roomName;
                    caption = data.rooms[num].voiceResponseFaculty;
                }
                resultsCaption = caption;

    //            alert(indexItem);

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
        
        
        var displayInstructionModal = function(){
            instruction_ACTIVE = true;
            timeLeft = grantTime;
            
            $('.instruction-modalPrompt').hide();
            $('.instruction-modalBubble').hide();
            
            commandManager("Instruction");
            
            $(".modal-instruction").show();
            
            message.text = "Here are your instructions!";
            window.speechSynthesis.speak(message);
        }
        
        // These are the commands that are available once the user presses the "Start" button to activate the system. They are divideed into 3 types of commands, Room Location commands, Professor Location commands, and Upcoming Events commnds.
        mainMenuCommands = {
            // * = capture everything after 
            // : = capture only one word    
            
            //instructions
//            'Instructions' : displayInstructionModal,
//            'instructions' : displayInstructionModal,
            
            // Room Locator Commands: These commands handle all of the different variaitons in which users can search for room locations.
            'I am looking for room *roomNum' : roomLocator,
            "I'm looking for room *roomNum" : roomLocator,
            "I'm looking for a room *roomNum" : roomLocator,
            'Where is room *roomNum' : roomLocator,
            'Where\'s room *roomNum' : roomLocator,
            'room *roomNum' : roomLocator,
            
            // Faculty Locator Commands: These commands handle all of the different variations in which users can search for Professor Office Locations.
            
//            "I'm looking for mr. *name":mrChecker,
//            "I'm looking for Mr *name":mrChecker,
//            
//            "I'm looking for ms. *name":msChecker,
//            "I'm looking for Miss *name":msChecker,
//            "I'm looking for a Miss *name":msChecker,
//            "I'm looking for mrs. *name":msChecker,
        
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
        
        
        // Is this still used?
        exitCommands = {
            'exit': displayMenuView  
        };
    
        // These are the commands that are available to users when they reach a Results Page after requesting a valid Room Location, Professor Location, or Upcoming Events.
        commands = {
            // * = capture everything after 
            // : = capture only one word
            
            'new search' : displayMenuView,
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : yesOrno},
            'thank you' : youreWelcome
        };
        
        // This command is available to users when they asl for a Room Location, or Professor Location and they are given the option to chosse between options. An example of this would be if they ask for Professor Duncan, a modal will appear that will ask the user which professor Duncan they are referring to (Greg Duncam or Robert Duncan).
        optionCommands = {
            // * = capture everything after 
            // : = capture only one word
            '(number) :number' : optionFunc
        };
        
//        eventsOptionsCommands = {
//            // * = capture everything after 
//            // : = capture only one word
//            '*timeFrame' : {'regexp' : /^(what's happening this month|what's happening today|what's happening this week)$/, 'callback' : calendarView}
//        };
   
        // Activates the Main Menu commands that are available to users when they press the "Start" button.
        commandManager("MainMenu");
        
        
        annyang.setLanguage("en-US");           // Sets annyang.js's language to English
        annyang.start({continuous: false});     // Starts annyang.js without continuous mode.
        
        // **Uncomment to turn debug mode on for annyang. js. In debug mode, the words that annyang hears, and the commands that are being added and removed throughout the systems eecution, is printed to the console.
//        annyang.debug([newState=true]); 
 
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
        
        // If annyang exists and is loaded properly then ajax is used to read data.json which contains all of the faculty information.
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
        
        bubbleCommandRoom();
        bubbleCommandFaculty();
        
        bubblePrefixRoom();
        bubblePrefixFaculty();
        
        bubbleCommandEvent();
    });
    
    $('#endButton').click(function(){
        endSystem();
    });
    
    // If the user presses the mic icon, they are prompted to say their request so that they know that the main form of naviagtion is speech and not touch.
    $("#systemMic").click(function(){
        
        $(".left-bubble .bubble").removeClass("slideInLeft");
        $(".right-bubble .bubble").removeClass("slideInRight");
        $(".center-bubble .bubble").removeClass("slideInDown");
        
        $(".bubble").addClass("tada");
        
        setTimeout(function(){ 
            $(".bubble").removeClass("tada");
        }, 1000);
        
        
        caption = outputSpeak;
        message.text = outputSpeak;
        window.speechSynthesis.speak(message);

    });
 
}
