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
        photoContainer.innerHTML = '<img id="studentPhoto" />';
        photoContainer.setAttribute ('id', 'photoContainer');


        // Add Elements
        var menuDiv = document.createElement('div');
        menuDiv.innerHTML = '<a id="foxinatorButton" href="#">Randomizer</a>&nbsp;<a id="clearButton" href="#">Clear aliases</a>&nbsp;<a id="helpButton" href="#">Help</a>';
        menuDiv.setAttribute ('id', 'menuDiv');
        innerContainer.appendChild (menuDiv);

        var foxinatorDiv = document.createElement('div');
        foxinatorDiv.innerHTML = '<a id="randomizerButton" href="#">May the odds ever be in your favor!</a><span id="victim">Good Luck!</span>';
        foxinatorDiv.setAttribute ('id', 'foxinatorDiv');
        innerContainer.appendChild (foxinatorDiv);

        var aliasDiv = document.createElement('div');
        aliasDiv.innerHTML = '<span id="selectedStudentName"></span>Alias<input id="aliasText" type="text" /><a id="aliasButton" href="#">Add</a><input type="hidden" id="aliasId" />';
        aliasDiv.setAttribute ('id', 'aliasDiv');
        innerContainer.appendChild(aliasDiv);

        var helpDiv = document.createElement('div');
        helpDiv.innerHTML = '<ul><li><b>Randomizer</b> - Randomly selects someone from the Present list.</li><li><b>Add Alias</b> - Double-click a name in any list</li><li><b>Delete Alias</b> - Double-click a highlighted name in any list</li><li><b>Clear Asliases</b> - Removes all aliases. You can edit these directly through Tampermonkey on the Storage page.</li></ul>';
        helpDiv.setAttribute ('id', 'helpDiv');
        innerContainer.appendChild(helpDiv);

        container.appendChild(innerContainer);
        document.body.appendChild(container);
        document.body.appendChild(photoContainer);

        // Add event listeners
        document.getElementById("randomizerButton").addEventListener (
            "click", RandomizerButtonClickAction, false
        );
        document.getElementById("clearButton").addEventListener (
            "click", ClearButtonClickAction, false
        );
        document.getElementById("aliasButton").addEventListener (
            "click", AddHighlightStudent, false
        );
        document.getElementById("foxinatorButton").addEventListener (
            "click", FoxinatorButtonClickAction, false
        );
        document.getElementById("helpButton").addEventListener (
            "click", HelpButtonClickAction, false
        );
        absentList.dblclick(ListBoxDoubleClickAction);
        presentList.dblclick(ListBoxDoubleClickAction);
        exemptList.dblclick(ListBoxDoubleClickAction);

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
                font-size: 10px;
            }
            #container button{
                font-size: 10px;
            }
            #container ul{
            }
            #photoContainer{
                display: none;
                position: absolute;
                top: 0;
                right: 0;
                padding:3px;
                margin:3px;
                border: 2px outset black;
                background: #FC0;
            }
            #menuDiv a{
                font-size: 10px;
                color:black;
                margin-right: 3px;
                font-weight: bold;
            }
            #selectedStudentName{
                margin-right: 5px;
            }
            #aliasText{
                margin-left: 5px;
            }
            #aliasButton{
                margin-left: 5px;
                margin-right: 5px;
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
            #helpDiv{
                display: none;
                border: 2px outset black;
                margin: 3px;
                padding: 3px;
                opacity: 0.9;
                z-index: 1100;
            }
            #aliasDiv {
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

    function RandomizerButtonClickAction (e) {
        var select = document.getElementById('cphBody_lstPresent');
        var items = select.getElementsByTagName('option');
        if(items.length > 0){
            var index = Math.floor(Math.random() * items.length);
            select.selectedIndex = index;

            var option = select.options[select.selectedIndex];
            var selected = option.text;
            var victim = document.getElementById('victim');
            victim.textContent = selected;

            $('#victimPhoto').attr('src', "/picture.aspx?s="+option.value);
        }
    }

    function HelpButtonClickAction(e){
        $("#helpDiv").toggle();
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
        var option = e.target;
        var studentId = option.value;
        var existing = GM_getValue(studentId);
        console.log(existing);
        if(existing){
            if(confirm("Are you sure you want to remove this alias? The page will reload.")){
                GM_deleteValue(studentId);
                location.reload();
            }
        }else{
            PromptForAlias(option);
        }
    }

    // Helper Functions
    function ShowImage(id){
        $('#studentPhoto').attr('src', "/picture.aspx?s="+id);
        $('#photoContainer').show();
    }

    function HideImage(){
        $('#studentPhoto').attr('src', '');
        $('#photoContainer').hide();
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
                    var alias = GM_getValue(value);
                    option.addClass('highlight');
                    option.html(option.html() + " (" + alias + ")");
                }
            });
        });
    }

    function PromptForAlias(option){
        var studentId = option.value;
        var studentName = option.text;

        $("#selectedStudentName").text(studentName);
        $("#aliasId").text(studentId);
        $("#aliasDiv").show();
        $("#aliasText").focus();
    }

    function AddHighlightStudent(option){
        var studentId = $('#aliasId').text();
        var alias = $("#aliasText").val();

        if(!alias || alias === ''){
            alert("no alias supplied");
        }
        $("#aliasText").val('');
        $("#selectedStudentName").text('');
        $("#aliasId").text('');
        $("#aliasDiv").hide();

        var key = studentId;
        var value = GM_getValue(key);
        if(!value){
            GM_setValue(key, alias);
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