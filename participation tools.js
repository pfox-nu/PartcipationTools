// ==UserScript==
// @name         Participation Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tools for the participation site
// @author       Paul Fox
// @match        https://participation.neumont.edu/Participation.aspx
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

(function() {
    'use strict';
    var absentList = $('#cphBody_lstAbsent');
    var presentList = $('#cphBody_lstPresent');
    var exemptList =$('#cphBody_lstExempt');
    var lists = [absentList, presentList, exemptList];

    if(absentList){ // If we're on the participation page
        // Get some elements we'll be working wit
        var titleBlock = $('#cphBody_updateClass').html();
        var courseName = GetCourseName(titleBlock);

        // Highlight saved students
        Highlight();

        var container = document.createElement('div');
        container.setAttribute ('id', 'container');

        var innerContainer = document.createElement('div');
        innerContainer.setAttribute ('id', 'innerContainer');

        var photoContainer = document.createElement('div');
        photoContainer.setAttribute ('id', 'photoContainer');


        // Add Elements
        var menuDiv = document.createElement('div');
        menuDiv.innerHTML = '<button id="foxinatorButton" type="button">Randomizer</button>&nbsp;<button id="clearButton" type="button">Clear Nicknames</button>';
        menuDiv.setAttribute ('id', 'menuDiv');
        innerContainer.appendChild (menuDiv);

        var foxinatorDiv = document.createElement('div');
        foxinatorDiv.innerHTML = '<button id="myButton" type="button"> May the odds ever be in your favor!</button><span id="victim">Good Luck!</span>';
        foxinatorDiv.setAttribute ('id', 'foxinatorDiv');
        innerContainer.appendChild (foxinatorDiv);

        var nicknameDiv = document.createElement('div');
        nicknameDiv.innerHTML = '<span id="selectedStudentName">&nbsp;</span>Nickname:&nbsp;<input id="nicknameText" type="text" /><button id="nicknameButton" type="button">Add</button><input type="hidden" id="nicknameId" />';
        nicknameDiv.setAttribute ('id', 'nicknameDiv');
        innerContainer.appendChild(nicknameDiv);

        container.appendChild(innerContainer);
        document.body.appendChild(container);
        document.body.appendChild(photoContainer);

        // Add event listeners
        document.getElementById("myButton").addEventListener (
            "click", ButtonClickAction, false
        );
        document.getElementById("clearButton").addEventListener (
            "click", ClearButtonClickAction, false
        );
        document.getElementById("nicknameButton").addEventListener (
            "click", AddHighlightStudent, false
        );
        document.getElementById("foxinatorButton").addEventListener (
            "click", FoxinatorButtonClickAction, false
        );
        absentList.ondblclick = ListBoxDoubleClickAction;
        presentList.ondblclick = ListBoxDoubleClickAction;
        exemptList.ondblclick = ListBoxDoubleClickAction;

        $("option").hover(function (e){
            var target = $(e.target);
            if(target.is('option')){
                //console.log($target.val());//Will alert the value of the option
                ShowImage(target.val());
            }
        }, function(e){
            HideImage();
        });

        // Set custom styles
        GM_addStyle(multilineStr ( function () {
            /*!
            #photoContainer{
                position: absolute;
                top: 0;
                right: 0;
                padding:3px;
                margin:3px;
                border: 2px outset black;
                background: #FC0;
            }
            #container button{
                font-size: 10px;
            }
            #container {
                position: absolute;
                top: 0;
                left: 0;
                background: #FC0;
                border: 2px outset black;
                margin: 3px;
                padding: 3px;
                opacity: 0.9;
                z-index: 1100;
            }
            #foxinatorDiv{
                display: none;
                height:25px;
                border: 2px outset black;
                margin: 3px;
                padding: 3px;
                opacity: 0.9;
                z-index: 1100;
            }
            #nicknameDiv {
                display: none;
                top: 35px;
                left: 0;
                background: #FC0;
                border: 2px outset black;
                margin: 3px;
                padding: 3px;
                opacity: 0.9;
                z-index: 1100;
            }
            #myButton { cursor: pointer; }
            #myContainer p {
                color:                  red;
                background:             white;
            }
            #victim{ padding-left: 5px; color:red; font-weight:bold;}
            .highlight{ background-color: yellow };
            */
        } ) );
    }

    // Event Handlers
    function FoxinatorButtonClickAction(e){
        $('#foxinatorDiv').toggle();
    }

    function ButtonClickAction (e) {
        var select = document.getElementById('cphBody_lstPresent');
        var items = select.getElementsByTagName('option');
        if(items.length > 0){
            var index = Math.floor(Math.random() * items.length);
            select.selectedIndex = index;

            var selected = select.options[select.selectedIndex].text;
            var victim = document.getElementById('victim');
            victim.textContent = selected;
        }
    }

    function ClearButtonClickAction (e) {
        var values = GM_listValues();
        if(confirm('Are You Sure?')){
            $.each(values, function(index, value) {
                GM_deleteValue(value);
            });
            location.reload();
        }
    }

    function ListBoxDoubleClickAction(e){
        var option = e.srcElement;
        var studentId = option.value;
        var existing = GM_getValue(studentId);
        if(existing){
            if(confirm("Are you sure you want to remove this nickname? The page will reload.")){
                GM_deleteValue(studentId);
                location.reload();
            }
        }else{
            PromptForNickname(option);
        }
    }

    // Helper Functions
    function ShowImage(id){
        photoContainer.innerHTML = '<img src="/picture.aspx?s='+id+'" />';
        $('photoContainer').show();
    }

    function HideImage(){
        photoContainer.innerHTML = '';
        $('photoContainer').hide();
    }

    function GetCourseName(text){
        var parts = text.split(' - ');

        var course = parts[0];
        return course;
    }

    function Highlight(){
        var values = GM_listValues();
        $.each(values, function(index, value){
            $.each(lists, function(index, list){
                var option = list.find("option[value='"+value+"']");
                if(option){
                    option.addClass('highlight');
                }
            });
        });
    }

    function PromptForNickname(option){
        var studentId = option.value;
        var studentName = option.text;

        $("#selectedStudentName").text(studentName);
        $("#nicknameId").text(studentId);
        $("#nicknameDiv").show();
        var nickname = $("#nicknameText").focus();
    }

    function AddHighlightStudent(option){
        var studentId = $('#nicknameId').text();
        var nickname = $("#nicknameText").val();

        if(!nickname || nickname === ''){
            alert("no nickname supplied");
        }
        $("#nicknameText").val('');
        $("#selectedStudentName").text('');
        $("#nicknameId").text('');
        $("#nicknameDiv").hide();

        var key = studentId;
        var value = GM_getValue(key);
        if(!value){
            GM_setValue(key, nickname);
        }else{
            GM_deleteValue(key, '');
        }
        Highlight();
    }

    function multilineStr (dummyFunc) {
        var str = dummyFunc.toString ();
        str     = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
            .replace (/\s*\*\/\s*\}\s*$/, '')   // Strip */ }
            .replace (/\/\/.+$/gm, '')
        ;
        return str;
    }
})();