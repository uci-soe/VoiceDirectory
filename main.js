window.onload = function(){
            
    var timeLeft = 55; // System countdown after initiation
    var timeToAskFirst = 30; // System will ask if user wants more time after this amount of seconds
    var timeToAskSecond = 10; // Second time asking
    var timeToEnd = 1; // System will reset the system with this amount of seconds left
    var grantTime = 55; // System will grant user extra time (grantTime will be set equal to "timeLeft")

    var roomLocator_active = false;
    var facultyLocator_active = false;
    
    var clarifyPrefix_ACTIVE = false;
    var clarifyFaculty_ACTIVE = false;

    var instruction_ACTIVE = false;
    
    var events_ACTIVE = false;
    
    var timer;
    var systemTimer_interval = 1200;

    var systemAsked = false; // Check if system has asked user for more time
    var yes = false;
    var no = false;
    
    var resultShown = false;
    
    var universalName = "";

    // System's General Voice Responses
    var output_speak = "Please say your request!";
    var output_validRequest = "Please make a valid request.";
    var output_moreTime = "Do you need more time?";
    var output_systemReset = "System will reset.";
    var output_ok = "Ok";
    var output_pleasewait = "Please Wait...";
    var welcome = "Hello, what can I help you with today?";
    var output_moreRequest = "What else can I help you with today?";
    var output_invalidRoom = "";
    var output_invalidFaculty = "";
    var validCommand = "Please say a valid command.";
    var output_listening = "I'm Listening...";
    
    //Events Voice Responses
    var eventWeekWelcome = "Here's what's happening this week.";
    var eventTodayWelcome = "Here's what's happening today.";
    var eventMonthWelcome = "Here's what's happening this month.";
    
    var badWords = ["stupid","a stupid","dumbass","a dumbass", "your mama","idiot","a idiot","dumb","a dumb"];
    
    function outputRepeat (output_item){            
        var output_temp = "";

        if(isNaN(output_item)){
            if(/\d/.test(output_item)){
                output_temp = "Sorry, Room " + output_item + " does not exist. Please make a valid request.";   
            }
            else if(badWords.includes(output_item)){
//                output_item = output_item.charAt(0).toLowerCase();
                output_temp = "Sorry, that's inappropriate.";  
            }
            else{

                output_item = output_item.charAt(0).toUpperCase() + output_item.slice(1);
                 output_temp = "Sorry, " + output_item + " does not exist. Please make a valid request.";
            }
               
        }
        else{
            output_temp = "Sorry, Room " + output_item + " does not exist. Please make a valid request.";
        }
        
        caption = output_temp;
        message.text = output_temp;
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
    
    function bubblePrefix_faculty (){
        
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
    
    function bubbleCommand_faculty (){
        
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
    
    function bubblePrefix_room (){
        
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
    
    function bubbleCommand_room (){
        
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
    
    function bubbleCommand_event (){
        
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
    
    //Creating voice synthesis utterance object.
    if('speechSynthesis' in window)
    {
        var message = new SpeechSynthesisUtterance();
        alert("Lets go");
        message.text = " ";
        message.lang = 'en-US';
        message.rate = 1;
        message.onstart = function(event)
        { 
            annyang.abort();
            console.log("not listening");             
            
            $('#systemMic').attr("src", "css/images/mic-disabled2.png");
            $('#subtitle').html(caption);
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
                caption = output_listening;
                $('#subtitle').html(caption);
                promptNewSearch("modal");
            }
            else if(instruction_ACTIVE){
                caption = output_listening;
                $('#subtitle').html(caption);
                promptExit();
            }
            else if(events_ACTIVE){
                caption = eventMonthWelcome;
                $('#subtitle').html(caption);               
                promptNewSearch("modal");
                
            }
            else {
                caption = output_listening;
                $('#subtitle').html(caption);
                promptInstruction();
            }
            console.log("listening");  
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
    
    function spellChecker(fac_name){
        if(fac_name == "cambridge" || fac_name == "Cambridge" || fac_name == "Kim Birge" || fac_name == "Kim Bridge"  || fac_name == "Kim birge" || fac_name == "Kim Berg" || fac_name == "Kim Birch" || fac_name == "Kim Burch")
            return "Kim Burge";
        if(fac_name == "Berg" || fac_name == "Cambridge" || fac_name == "Burg" || fac_name == "Birch" )
            return "Burge";
        
        else if(fac_name == "Janelle Lau" || fac_name == "Professor Lau"  || fac_name == "Lau" || fac_name == "Janelle now" || fac_name == "Janelle Lao" || fac_name == "genola" || fac_name == "genola" || fac_name == "genello" || fac_name == "Janelle out" || fac_name == "Janel Lao")
            return "Jenel Lao";
        else if(fac_name == "Lau" || fac_name == "out")
            return "Lao";
        
        else if(fac_name == "die shoe" || fac_name == "disha" || fac_name == "disa" || fac_name == "D shoe" || fac_name == "Daiso" || fac_name == "DC" || fac_name == "DC" || fac_name == "zissou" || fac_name == "the zoo" || fac_name == "Dai Chu" || fac_name == "deitch" || fac_name == "dye shoe" || fac_name == "dice shoe")
            return "Di Xu";
        else if(fac_name == "shoe" || fac_name == "sure" || fac_name == "Sue" || fac_name == "zoo")
            return "Xu";
        
        
        
        else if(fac_name == "young" || fac_name == "You")
            return "Young";
        
        else if(fac_name == "constance iloh" || fac_name == "Constance Ehlo" || fac_name == "constants Hilo" || fac_name == "Constance I love" || fac_name == "Constance Ela" || fac_name == "Constance eilo" || fac_name == "Constance Isla" || fac_name == "Constance Hilo" || fac_name == "Constance eloah" || fac_name == "Constance Islas")
            return "Constance Iloh";
        else if(fac_name == "I know" || fac_name == "I lo" || fac_name == "Missy Lowe" || fac_name == "Constance eloah")
            return "Iloh";
        
        else if(fac_name == "Deborah vendell" || fac_name == "Deborah vandal" || fac_name == "Deborah vandal" || fac_name == "Deborah vandell" || fac_name == "Deborah Vando" || fac_name == "Deborah Van Dale" || fac_name == "Deborah Venta" || fac_name == "Deborah Vendome" || fac_name == "Deborah vendal" || fac_name == "Deborah van daele" || fac_name == "Deborah Venda" || fac_name == "Deborah Van-Del" || fac_name == "Deborah Vendo")
            return "Deborah Vandell";
        
        else if(fac_name == "vendell" || fac_name == "bandel" || fac_name == "Van Dell" || fac_name == "vandal" || fac_name == "Vandell" || fac_name == "vandell" || fac_name == "van daele" || fac_name == "Venda" || fac_name == "Vendo" || fac_name == "Van-Del")
            return "Vandell";
        
        else if(fac_name == "Melinda petre" || fac_name == "Melinda Petrie" || fac_name == "Melinda Petry" || fac_name == "Melinda Peter" || fac_name == "Petra" || fac_name == "Melinda better" || fac_name == "Melinda Petra")
            return "Melinda Petre";
        else if(fac_name == "Petri" || fac_name == "Petrie")
            return "Petre";
        //Check these
        else if(fac_name == "Jacqueline Echols" || fac_name == "Jacqueline eckley's" || fac_name == "Jaclyn eckley's" || fac_name == "Jacqueline eclise" || fac_name == "Jaclyn a class" || fac_name == "Jacqueline Ellis" || fac_name == "Jacqueline eClass" || fac_name == "Jacqueline Equus" )         
            return "Jacquelynne Eccles";
        
        
        else if(fac_name == "Echols"|| fac_name == "a class" || fac_name == "glass" || fac_name=="at glass" || fac_name == "akhilesh" || fac_name == "ecla" || fac_name == "eckley's" || fac_name == "X")
            return "Eccles";
         
        else if(fac_name == "Liane brouillette" || fac_name == "Leon brouillette" || fac_name == "Leanne bralette" || fac_name == "Lee Ann brouillette" || fac_name == "Lee Ann Brewery" || fac_name == "Lee Anne Burrell at" || fac_name == "Lee Anne Burrell"  || fac_name == "Leon roulette" || fac_name == "Leanne Grill at")
            return "Liane Brouillette";
            
        
        else if(fac_name == "brouillette" || fac_name == "Leon brouillette")
            return "Brouillette";
        
        else if(fac_name == "David Lynn")
            return "David Lim"
        else if(fac_name == "Lynn")
            return "Lim"    
        //Check These
        else if(fac_name == "Geneva Lopez Sandoval" || fac_name == "jenefir lopez sandoval" || fac_name == "Geneva Lopez" || fac_name == "Geneva Sandoval" || fac_name == "Geneva sandals")
            return "Geneva Lopez-Sandoval";
        
        else if(fac_name == "Sarah sing" || fac_name == "sing" || fac_name == "ceresin" || fac_name == "Sarah singe" || fac_name == "Sarah sink" || fac_name == "terracing")     
            return "Sarah Singh";
        
        else if(fac_name == "Susan Toma bears" || fac_name == "Susan Toma Berg" || fac_name == "Susan Toma bush" || fac_name == "Susan Toma Burj" || fac_name == "Susan Toma Burge" || fac_name == "Susan Toma Birch" || fac_name == "Susan Thelma Burge" || fac_name == "Susan Tama Burge" || fac_name == "Susan Birch" || fac_name == "Susan Tory Burch" || fac_name == "Susan Toma Bridge")
            return "Susan Toma Berge";
        else if (fac_name == "Toma Berg" || fac_name == "Toma bersch" || fac_name == "Toma Burge" || fac_name == "Toma bears" || fac_name == "Toma Bridge" || fac_name == "Tama Burge" || fac_name == "Toma Birch" || fac_name == "Thelma Burge" || fac_name == "Toma Burj")
            return "Toma Berge";
        
        else if(fac_name == "Gene Stone" || fac_name == "June Stone" || fac_name == "jeans Stone" || fac_name == "stone")
            return "Jeanne Stone";
        
        else if(fac_name == "Maria tax" || fac_name == "Murrieta Cox" || fac_name == "Maria tactics" || fac_name == "Maria tac-x" || fac_name == "tac-x" || fac_name == "Mystic X" || fac_name == "Murrieta")
            return "Maria Takacs";
        
        else if(fac_name == "Sandra Simkins" || fac_name == "Simkins")
            return "Sandra Simpkins";
        
        else if(fac_name == "Maria Rosales weather" || fac_name == "Maria Rosales Loretta" || fac_name == "Maria Rosales Ruda" || fac_name == "Maria Rosales reta" || fac_name == "Maria Rosales Beretta" || fac_name == "Maria Rosales" || fac_name == "Maria Goretti" || fac_name == "Maria Rosales Murrieta" )
            return "Maria Rosales Rueda";
        else if(fac_name == "Rosales Rueda")
            return "Rosales Rueda";
        
        
        else if(fac_name == "Jamal a Betty" || fac_name == "Jamal abedi" || fac_name == " Chemawa Betty" )
            return "Jamal Abedi";
        else if(fac_name == "a Betty" || fac_name == "abiti")
            return "Abedi";
        
        else if(fac_name == "Virginia panish" || fac_name == "Virginia punished" || fac_name == "Virginia Peniche")
            return "Virginia Panish";
        else if(fac_name == "panish" || fac_name == "punish" || fac_name == "Spanish")
            return "Panish";
       
        else if(fac_name == "Sudan" || fac_name == "Sylvan" || fac_name == 
"Sue Bond")
            return "Sue Vaughn";
        else if(fac_name == "von" || fac_name == "Von" || fac_name == "Vaughan")
            return "Vaughn";
        
        else if(fac_name == "Jeff Johnson")
            return "Jeff Johnston";
        
        
        else if(fac_name == "Denise early" || fac_name == "Denise Ireland")
            return "Denise Earley";
        else if(fac_name == "early" || fac_name == "ear Lee")
            return "Earley";
       
        else if(fac_name == "right low" || fac_name == "rat low" || fac_name == "Right low" || fac_name == "reloj" || fac_name == "Reloj")
            return "Rhett Lowe";

        else if(fac_name == "cute King" || fac_name == "cute Kang" || fac_name == "Kyu Kang" || fac_name == "Hugh Kang" || fac_name == "puke King" || fac_name == "Hugh King" || fac_name == "Hugh Cain" || fac_name == "UK" || fac_name == "Huck King" || fac_name == "Hayek King" || fac_name == "How you came" || fac_name == "heeyook kang" || fac_name == "hip pain" || fac_name == "hyatt pinion" || fac_name == "hugh connell")
            return "Hyuk Kang";
        else if(fac_name == "King" || fac_name == "king" || fac_name == "kane")
            return "Kang";
        
        else if(fac_name == "ho Sun King" | fac_name == "ho-sun Kang" || fac_name == "ho-sun King")
            return "Hosun Kang";
        
        else if(fac_name == "Jayda Jenkins" || fac_name == "Jay Jenkins" || fac_name == "J Jenkins" || fac_name == "Jada Jenkins")
            return "Jade Jenkins";
    

        else if(fac_name == "new search" || fac_name == "research")
            return "new search";

        return fac_name;
        
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
//            alert(output_moreRequest);
            caption = output_moreRequest;
            message.text = caption;
        }
        else if(clarifyFaculty_ACTIVE){
//            alert(output_moreRequest);
            caption = output_moreRequest;
            message.text = caption;
        }
        else if(clarifyPrefix_ACTIVE){
//            alert(output_validRequest);
            caption = output_validRequest;
            message.text = caption;
        }
        else if(instruction_ACTIVE){
//            alert(output_moreRequest);
            caption = output_moreRequest;
            message.text = caption;
        }
        else if(events_ACTIVE){
            caption = output_moreRequest;
            message.text = caption;
        }
        else{
            caption = output_pleasewait;
            message.text = welcome;
        }

        resultShown = false;
        clarifyFaculty_ACTIVE = false;
        clarifyPrefix_ACTIVE = false;
        instruction_ACTIVE = false;
        events_ACTIVE = false;
        
        roomLocator_active = false;
        facultyLocator_active = false;
        
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
        
        roomLocator_active = false;
        facultyLocator_active = false;
        
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

            caption = output_ok;
            message.text = output_ok;
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
                    message.text = output_moreTime;
                    window.speechSynthesis.speak(message);
                    
                    caption = output_moreTime;
                    systemAsked = true; 
                } 
                
                if(timeLeft == timeToAskSecond && !resultShown) 
                    endSystem();
                
                if(resultShown) {
                    message.text = output_moreTime;
                    window.speechSynthesis.speak(message);
                    
                    caption = output_moreTime;
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
                annyang.removeCommands('(number) :number');
                break;
            case "ResultsView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.removeCommands(optionCommands);
                break;
            case "OptionsView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.removeCommands(optionCommands);
                if(clarifyFaculty_ACTIVE)
                    annyang.addCommands(optionCommands);
                break;
            case "CalendarView":
                annyang.init(commands,true);
                annyang.addCommands(commands);
                annyang.addCommands(eventsOptionsCommands);
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
        
        
        
        roomLocator = function(room_num) {  
                        
            if(!(room_num in data.rooms)){
                
                outputRepeat(room_num);
                
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
                    displayOptionsModal(data, possibleRoom);
                    modalResponse("room");
                }
                else{
                    console.log(room_num);
                    displayResultsView(data, room_num);
                    resultShown = true; 

                    caption = data.rooms[room_num].voiceResponse_room;
                    resultsCaption = caption;
                }                
                
            }
            timeLeft = grantTime;
            
        };

        // LIST OF MISTER'S
        
        // Full name
        mrListFullName = ["Jamal Abedi","Rhett Lowe","Hyuk Kang","Spenser Clark","Georg Farkas","Greg Duncan","Robert Duncan","Drew Bailey","Jeff Johnston","David Lim","Neil Young"];
            
        // Last name
        mrListLastName = ["Abedi","Lowe","Kang","Clarks","Farkas","Duncan","Duncan","Bailey","Johnston","Lim","Young"];
        
        
        // LIST OF MISS'S
        
        // Full name
        msListFullName = ["Kim Burge","Jenel Lao","Liane Brouillette","Maria Rosales Rueda","Penelope Collins","Deborah Vandell","Jade Jenkins","Di Xu","Rachel Baker","Emily Penner","Constance Iloh","Hosun Kang","Melinda Petre","Jacquelynne Eccles","Geneva Lopez-Sandoval","Valerie Henry","Sarah Singh","Sue Vaughn","Susan Guilfoyle","Susan Toma Berge","Jenel Lao","Jeanne Stone","Maria Takacs","Sandra Simpkins","Virginia Panish","Sarah McDougall","Denise Earley"];
            
        // Last name
        msListLastName = ["Burge","Lao","Brouillette","Rosales Rueda","Collins","Vandell","Jenkins","Xu","Baker","Penner","Iloh","Kang","Petre","Eccles","LopezSandoval","Henry","Singh","Vaughn","Guilfoyle","TomaBerge","Lao","Stone","Takacs","Simpkins","Panish","McDougall","Earley"];
        
        
        
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
        
        mrChecker = function(fac_name)
        {
            fac_name = spellChecker(fac_name);

            
            // Checks to see if fac_name is in drList. If not in drList indexOf will    return -1.
            if(mrListFullName.indexOf(fac_name) != -1)
                facultyLocator(fac_name);
            else if(mrListLastName.indexOf(fac_name) != -1)
                facultyLocator(fac_name);
            else if(msListFullName.indexOf(fac_name) != -1){
                correctName = "Ms. " + fac_name;
                universalName = fac_name;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else if(msListLastName.indexOf(fac_name) != -1){
                correctName = "Ms. " + fac_name;
                universalName = fac_name;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else
            {
                outputRepeat(fac_name);
                
            }
            
        }
      
        msChecker = function(fac_name)
        {
            fac_name = spellChecker(fac_name);
            
            // Checks to see if fac_name is in drList. If not in drList indexOf will    return -1.
            if(msListFullName.indexOf(fac_name) != -1)
                facultyLocator(fac_name);
            else if(msListLastName.indexOf(fac_name) != -1)
                facultyLocator(fac_name);
            else if(mrListFullName.indexOf(fac_name) != -1){
                correctName = "Mr. " + fac_name;
                universalName = fac_name;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else if(mrListLastName.indexOf(fac_name) != -1){
                correctName = "Mr. " + fac_name;
                universalName = fac_name;
                clarifyPrefix_MODAL(correctName);
                clarifyPrefix_RESPONSE(correctName);
            }
            else
            {
                outputRepeat(fac_name);
                 
            }
            
        }
        
//        professorChecker = function(fac_name)
//        {
//            fac_name = spellChecker(fac_name);
//            
//            professorListFullName = ["Kim Burge","Jenel Lao","Liane Brouillette","Jamal Abedi","Maria Rosales Rueda","Penelope Collins","George Farkas","Deborah Vandell","Jade Jenkins","Di Xu","Greg Duncan","Rachel Baker","Emily Penner","Constance Iloh","Hosun Kang","Robert Duncan","Melinda Petre","Jacquelynne Eccles","Drew Bailey","Geneva Lopez-Sandoval","Valerie Henry","Susan Guilfoyle","Susan Toma Berge","Jenel Lao","Jeanne Stone","Jeff Johnston","Sandra Simpkins","Virginia Panish"];
//            
//            professorListLastName = ["Burge","Lao","Brouillette","Abedi","Rosales Rueda","Collins","Farkas","Vandell","Jenkins","Xu","Duncan","Baker","Penner","Iloh","Kang","Duncan","Petre","Eccles","Bailey","Lopez-Sandoval","Henry","Guilfoyle","Toma Berge","Lao","Stone","Johnston","Simpkins","Panish"];
//            
//            // Checks to see if fac_name is in drList. If not in drList indexOf will    return -1.
//            if(professorListFullName.indexOf(fac_name) != -1)
//                facultyLocator(fac_name);
//            else if(professorListLastName.indexOf(fac_name) != -1)
//                facultyLocator(fac_name);
//            else if(mrListFullName.indexOf(fac_name) != -1)
//                facultyLocator(fac_name);
//            else
//                outputRepeat(fac_name);
//            
//        }
//        
        
        drChecker = function(fac_name)
        {
            fac_name = spellChecker(fac_name);
            console.log(fac_name);
            drListFullName = ["Sandra Simpkins","Virginia Panish","Geneva Lopez-Sandoval","Drew Bailey","Jacquelynne Eccles","Robert Duncan","Constance Iloh","Emily Penner","Rachel Baker","Greg Duncan","Di Xu","Jade Jenkins","Deborah Vandell","George Farkas","Penelope Collins","Susan Toma Berge","Maria Rosales Rueda","Jamal Abedi","Liane Brouillette","Jenel Lao","Melinda Petre","Hosun Kang", "Kim Burge"];
            
            
            drListLastName = ["Simpkins","Panish","Lope-Sandoval","Bailey","Eccles","Duncan","Iloh","Penner","Baker","Duncan","Xu","Jenkins","Vandell","Farkas","Collins","Toma Berge","Rosales Rueda","Abedi","Brouillette","Lao","Petre","Kang","Burge"];
            
            
            // Checks to see if fac_name is in drList. If not in drList indexOf will    return -1.
            if(drListFullName.indexOf(fac_name) != -1)
                facultyLocator(fac_name);
            else if(drListLastName.indexOf(fac_name) != -1)
                facultyLocator(fac_name);
            else
            {
                outputRepeat(fac_name);
                
            }
        }
        
        
        
        facultyLocator = function(fac_name) {  
            //alert(fac_name);
            fac_name = spellChecker(fac_name);
            //Spell check faculty name input
            
            //alert(fac_name);
            var splitFacName = fac_name.split(" ");
            
            var firstName = splitFacName[0];
            var lastName = splitFacName[1];
            
            var firstName_noCaps = firstName;
            var firstName_noCaps = firstName_noCaps.toLowerCase();
            if(badWords.includes(firstName)){
                outputRepeat(firstName);
                return;
            }
            
            
            var matchFound = false;
            
            possibleFaculty = [];
            
            facultyLocator_active = true;
            clarifyPrefix_ACTIVE = false;
            
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
                            outputRepeat(fac_name);                            
                        }
                    else
                        {
                            displayResultsView(data, fac_name);
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
            //alert(roomLocator_active + " " + facultyLocator_active);
            var index = convertToNumber(numString) - 1;
            //alert("index: " + index);
//            alert(!isNaN(index));
            
            if(!isNaN(index)){
//                alert("index: " + index + ", faculty length: " + possibleFaculty.length + ", room length: " + possibleRoom.length-1);
                //alert(possibleRoom.length);
                if(index >= possibleRoom.length && index >= possibleRoom.length - 1 && roomLocator_active){
                    caption = output_validRequest;
                    message.text = caption;
                    window.speechSynthesis.speak(message);
                    //alert("about to return");
                    return;
                }
                   
                
                annyang.addCommands(commands);

                var indexItem = "";
    //           alert(roomLocator_active + " " + facultyLocator_active);
                if(roomLocator_active){
                    if(possibleRoom[0] == "2005")
                        indexItem = possibleRoom[index]; 
                    else
                        indexItem = possibleRoom[index+1];  
    //                alert(data.rooms[indexItem].voiceResponse_room);
                    caption = data.rooms[indexItem].voiceResponse_room;
                }
                else if(facultyLocator_active){
                    //alert("fac locator active");
                    indexItem = possibleFaculty[index];
                    num = data.faculty[possibleFaculty[index]].roomName;
                    caption = data.rooms[num].voiceResponse_faculty;
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
                    caption = output_validRequest;
                    message.text = caption;
                    window.speechSynthesis.speak(message);
                    return;
                }
                
            }            
        };
        
        var yourWelcome = function(){
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
         
        mainMenuCommands = {
            //instructions
//            'Instructions' : displayInstructionModal,
//            'instructions' : displayInstructionModal,
            
            // Room Locator Commands
            'I am looking for room *room_num' : roomLocator,
            "I'm looking for room *room_num" : roomLocator,
            "I'm looking for a room *room_num" : roomLocator,
            'Where is room *room_num' : roomLocator,
            'Where\'s room *room_num' : roomLocator,
            'room *room_num' : roomLocator,
            
            // Faculty Locator Commands
//            "I'm looking for mr. *name":mrChecker,
//            "I'm looking for Mr *name":mrChecker,
//            
//            "I'm looking for ms. *name":msChecker,
//            "I'm looking for Miss *name":msChecker,
//            "I'm looking for a Miss *name":msChecker,
//            "I'm looking for mrs. *name":msChecker,
            
            "I'm looking for dr. *name":drChecker,
            "I'm looking for dr *name":drChecker,
            "I'm looking for a dr *name":drChecker,
            "I'm looking for a doctor *name":drChecker,
            "I'm looking for doctor *name":drChecker,
            "I'm looking for a professor *name":facultyLocator, 
            "I'm looking for professor *name":facultyLocator, 
            'I am looking for professor *name':facultyLocator,
            
            "Where is dr. *name":drChecker,
            "Where is dr *name":drChecker,
            "Where is a professor *name":facultyLocator, 
            "Where is A professor *name":facultyLocator, 
            "Where is professor *name":facultyLocator, 
            
            "Where\'s dr. *name":drChecker,
            "Where\'s dr *name":drChecker,
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
            
            
            
//            "I'm looking for *name": facultyLocator,
//            'professor *name': facultyLocator,
            // 'I am looking for professor *fac_name' : facultyLocator,
           // 'I am looking for professor *fac_first_name :fac_last_name' : facultyLocator,
            //'professor *fac_first_name (*fac_last_name)' : facultyLocator,
            
            //Event View
            'What events are coming up' : displayEventModal,
            'Show me upcoming events' : displayEventModal,
            'I want to know upcoming events' : displayEventModal,
            // randomWord can only be yes or no now to avoid it being called very    time. 
            
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : yesOrno}
        };
        
        exitCommands = {
            'exit': displayMenuView  
        };
    
        
        commands = {
            // * = capture everything after 
            // : = capture only one word
            
            //RESET COMMAND
            'new search' : displayMenuView,
            ':randomWord' : {'regexp' : /^(yes|no)$/, 'callback' : yesOrno},
            'thank you' : yourWelcome
        };
        
        optionCommands = {
            '(number) :number' : optionFunc
        };
        
        eventsOptionsCommands = {
            //'(This) :viewType': 
            '*timeFrame' : {'regexp' : /^(what's happening this month|what's happening today|what's happening this week)$/, 'callback' : calendarView}
        };
   
//        annyang.addCommands(commands);
        commandManager("MainMenu");
        
        annyang.setLanguage("en-US");
        annyang.start({continuous: false}); 
        
        annyang.debug([newState=true]);
        
        // adds NoMatch everytime no match is found.
       // annyang.addCallback('resultNoMatch',noMatch);
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
        
        bubbleCommand_room();
        bubbleCommand_faculty();
        
        bubblePrefix_room();
        bubblePrefix_faculty();
        
        bubbleCommand_event();
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
