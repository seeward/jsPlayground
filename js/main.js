$(document).ready(function() {


/**
 * @file App Builder
 * @copyright kalmeer media 2014
 * @author seeward@gmail.com
 */

       /**
 * global obj to hold init params
 * @name Options
 * @prop {boolean} debug - sets up user for debug viewing
 * @prop {boolean} GitHub - toggles GH integration
 * @prop {boolean} kalmeerMode - toogles light and dark themes

 */
    var options = {
        debug: true,
        GitHub: true,
        kalmeerMode: true

    };


    var loader = "<img src='loader.gif' />";

    // var fro Github API object
    var gh = {};
           /**
 * global obj to hold user detials
 * @name currentUser
 * @prop {string} user - logged in username
 * @prop {string} password - pswd
 
 */
    var currentUser = {};

           /**
 * main editor javascript
 * @name jseditor
 
 */
    var jseditor = ace.edit("jsEditor");
    jseditor.setOption("showPrintMargin", false);
    jseditor.setOption("fontSize", "24px");
    jseditor.setTheme("ace/theme/monokai");
    jseditor.$blockScrolling = Infinity;
    jseditor.getSession().setMode("ace/mode/javascript");

           /**
 * main editor html
 * @name htmleditor
 
 */
    var htmleditor = ace.edit("htmlEditor");
    htmleditor.setOption("showPrintMargin", false);
    htmleditor.setOption("fontSize", "24px");
    htmleditor.setTheme("ace/theme/chrome");
    htmleditor.$blockScrolling = Infinity;
    htmleditor.getSession().setMode("ace/mode/html");
           /**
 * main editor css
 * @name csseditor
 
 */
    var csseditor = ace.edit("cssEditor");
    csseditor.setOption("showPrintMargin", false);
    csseditor.$blockScrolling = Infinity;
    csseditor.setOption("fontSize", "24px");
    csseditor.setTheme("ace/theme/eclipse");
    csseditor.getSession().setMode("ace/mode/css");


           /**
 * pointer to current note and temp files for note processing
 * @name currentNote
 
 */
    var currentNote = "";
    var tempFile = "";
    var newHold = "";

    // Functions


    /**
     * create file to export to GIST
     * @method createGist
     * @param {string} fileName - filename tag
     * @param {string} dataToWrite - actual src to export
     */
    var createGist = function(fileName, dataToWrite) {
        var file = {};
        var key = fileName;
        file[key] = {
            content: dataToWrite
        };
        $("#msgBox").fadeIn().html(loader + " Writing file to GitHub...");
        console.log("Writing file to GitHub...");
        files = {
            "exportFromAppBuilder.txt": {
                content: dataToWrite
            }
        };
        gh.getGist().create(file)
            .done(function(gist) {
                //console.log(JSON.stringify(gist));
                $("#msgBox").html("<span class='glyphicon glyphicon-ok'></span> GIST saved successfully");
                $("#msgBox").show();
                setTimeout(function() {
                    $("#msgBox").fadeOut();
                }, 2000);
            });
    };


    /**
     * build up object to export
     * @method exportToGitHub
     */
    var exportToGitHub = function() {
        var holder = [];
        keys = Object.keys(localStorage);
        //console.log(keys);
        $.each(keys, function(i, obj) {
            //console.log(JSON.stringify(obj));
            if (obj != "cache") {
                //console.log(obj);
                eachProject = JSON.parse(window.localStorage.getItem(obj));
                if (eachProject.html) {
                    holder.push(eachProject);
                }
            }
        });
        tempFile = JSON.stringify(holder);
        createGist("fullProjectsBackup.json", tempFile);

    };


    /**
     * func to store cache of unsaved projects
     * @method cacheLog
     */
    var cacheLog = function() {
        cache = {};
        jsCache = jseditor.getValue();
        htmlCache = htmleditor.getValue();
        cssCache = csseditor.getValue();
        extJS = $("#libjs").val();
        extCSS = $("#libcss").val();
        cache.html = htmlCache;
        cache.js = jsCache;
        cache.css = cssCache;
        cache.extJS = extJS;
        cache.extCSS = extCSS;

        window.localStorage.setItem("cache", JSON.stringify(cache));

    };

    /**
     * Retore unsaved project to editors on restart init()
     * @method restoreFromCache
     */
    function restoreFromCache() {
        if (window.localStorage.getItem("cache")) {
            restoreCache = JSON.parse(window.localStorage.getItem("cache"));
            htmleditor.setValue(restoreCache.html);
            jseditor.setValue(restoreCache.js);
            csseditor.setValue(restoreCache.css);

            $("#libjs").val(restoreCache.extJS);
            $("#libcss").val(restoreCache.extCSS);
        }
    };


    /**
     * Unique ID generator for Projects
     * @method makeId text
     * @return string text
     */
    var makeId = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        console.log(text);
        return text;
    }


    /**
     * save cache to project
     * @method saveProject
     */
    var saveProject = function() {
        render();
        if (!window.localStorage.getItem(currentNote)) {
            us = JSON.parse(window.localStorage.getItem("u"));
            saver = JSON.parse(window.localStorage.getItem("cache"));
            saver.title = prompt("Name project:");
            saver.author = us.user;
            saver.createdDate = new Date();
            saver.id = makeId();
            console.log(saver.id);
            saver.type = "Web App";

            currentNote = saver.title;
            $(".current").html(currentNote);
            if (saver.title != null) {
                window.localStorage.setItem(saver.title, JSON.stringify(saver));
                $("#msgBox").html("<span class='glyphicon glyphicon-ok'>Project saved!</span>").fadeIn();
            }
        } else {
            saver = JSON.parse(window.localStorage.getItem("cache"));
            //saver.id = makeId();
            //console.log(saver.id);
            window.localStorage.setItem(currentNote, JSON.stringify(saver));
            $("#msgBox").html("<span class='glyphicon glyphicon-ok'>Project saved!</span>").fadeIn();

        }

        getSaved();
    };


    /**
     * restore all saved projects from LocalStorage
     * @method getSaved
     */
    var getSaved = function() {
        var x = 0;
        $("#consoleLog").html("");
        keys = Object.keys(localStorage);
        //console.log(keys);
        var rows = keys.length;
        $.each(keys, function(i, obj) {
            if (x <= 100) {
                x = x + 10;
            }

            if (obj != "u") {
                if (obj != "cache") {
                    // console.log(obj);
                    $("#consoleLog").append("<tr><td><a style='margin-top:7px;width:150px' class='noteRow btn btn-block btn-default righter' id='" + obj + "'>" + obj + "</a></td></tr>");
                };
            }
        });
    };


    /**
     * render iFrame to full screen modal
     * @method renderFull
     */
    var renderFull = function() {
        $("#full").show();

        var source2 = prepareSource();
        //console.log(source);
        // Get reference to output iFrame
        var iframe2 = document.querySelector('#fullest'),
            // Setup iFrame structure
            iframe_doc2 = iframe2.contentDocument;
        // Write to iFrame
        console.log("<---------- Rendering Output Successful ----------->");
        iframe_doc2.open();
        iframe_doc2.write(source2);
        iframe_doc2.close();

    };


    /**
     * Main render into iFrame
     * @method render
     */
    var render = function() {
        // Get src


        var source = prepareSource();
        //console.log(source);
        // Get reference to output iFrame
        var iframe = document.querySelector('#output iframe'),
            // Setup iFrame structure
            iframe_doc = iframe.contentDocument;
        // Write to iFrame
        console.log("<---------- Rendering Output Successful ----------->");
        iframe_doc.open();
        iframe_doc.write(source);
        iframe_doc.close();

        cacheLog();

    };


    /**
     * prepare source doc by inserting values from editors
     * @method prepareSource src
     * @return src
     */
    var prepareSource = function() {
        // Gather textarea values
        var html = htmleditor.getValue(),
            css = csseditor.getValue(),
            js = jseditor.getValue(),
            //lib = $("#libcss").val();
            // libjs = $("#libjs").val();
            src = '';

        // Insert values into src template

        // HTML
        src = base_tpl.replace('</body>', html + '</body>');

        // CSS
        css = '<style>' + css + '</style>';
        src = src.replace('</head>', css + '</head>');
        // Libs css
        //libs = '<link href="' + lib + '" rel="stylesheet"></link>';
        //src = src.replace('</head>', libs + '</head>');

        // libs js
        //libsJS = '<script src="' + libjs + '" type="text/javascript"></script>';
        //src = src.replace('</head>', libsJS + '</head>');
        // Javascript
        js = '<script>' + js + '</script>';
        src = src.replace('</body>', js + '</body>');

        // return prepared src with textarea values inserted
        return src;
    };

    /**
     * helper function to import JSON backups
     * @method importer
     */
    var importer = function() {
        $.getJSON("backup.json", function(data) {
            $.each(data, function(i, o) {

                window.localStorage.setItem(o.name, JSON.stringify(o));
            });

        });
    };

    /**
     * helper function to add properties to currentProject obj
     * @method addType
     */
    var addType = function() {

        keys = Object.keys(localStorage);
        //console.log(keys);
        $.each(keys, function(i, obj) {

            fullObj = JSON.parse(window.localStorage.getItem(obj));
            fullObj.type = "Web App";
            fullObj.name = obj.toString();

            cu = window.localStorage.getItem("u");
            cu = JSON.parse(cu);
            fullObj.author = cu.user;
            fullObj.createdDate = new Date();
            window.localStorage.setItem(obj.toString(), JSON.stringify(fullObj));
        });

    };





    /**
 * fix for ACE editor no updating
 * @name toggleFocus
 * @function
 * @global
 * @param shown.bs.tab - event when tab is selected
 */

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var target = $(e.target).attr("href");
        switch (target) {

            case "#js":
                jseditor.focus();
                jseditor.gotoLine(1);
                console.log("jseditor");
                return
            case "#css":
                csseditor.focus();
                csseditor.gotoLine(1);
                console.log("csseditor");
            case "#html":
                htmleditor.focus();
                htmleditor.gotoLine(1);
                console.log("htmleditor");
        }
    });

    /**
 * remove user details
 * @name logOut
 * @function
 * @global
 * @param event - event logout button is pressed
 */


    $("#logout").click(function(e) {
        e.preventDefault();
        window.localStorage.removeItem("u");
        $("#msgBox").show().html("User Logged Out!");
        setTimeout(function() {
            $("#msgBox").hide();
        }, 3000);
    });

    /**
 * begin new mobile app project
 * @name mobileIntsert
 * @function
 * @global
 * @param event - event logout button is pressed
 */

    $("#mobiInsert").click(function(e) {
        e.preventDefault();
        htmleditor.setValue(mobileHTML);
        jseditor.setValue(jsTest);


    });

    /**
 * init the searcher function for projects table
 * @name searcher
 * @function
 * @global
 * @param event - event on init()
 */

    $("#consoleLog").searcher({
        inputSelector: "#searchTerm"
        // itemSelector (tbody > tr) and textSelector (td) already have proper default values
    });

    /**
 * export to GH event
 * @name export
 * @function
 * @global
 * @param event - event export button is pressed
 */

    $("#exportToGitHub").click(function(e) {
        e.preventDefault();
        exportToGitHub();
    });


    $("#export").click(function(e) {
        e.preventDefault();

        if (jseditor.getValue() != "" && csseditor.getValue() != "" && htmleditor.getValue() != "") {

            toFile = prepareSource();
            window.location = "data:application/octet-stream," + escape(toFile);
            createGist(currentNote, toFile);
            //console.log(currentNote);

        } else {
            $("#msgBox").html("<span class='glyphicon glyphicon-ban-circle fonter'>You cannot export an empty project.</span>").fadeIn();

            setTimeout(function() {
                $("#msgBox").fadeOut();
            }, 3000);
        }
    });

        /**
 * screen size button for desktop
 * @name desktop
 * @function
 * @global
 * @param event - event desktop button is pressed
 */


    $("#desktop").click(function() {
        $("#output").css("width", "100%");
        render();
    });

            /**
 * screen size button for tablet
 * @name tablet
 * @function
 * @global
 * @param event - event tablet button is pressed
 */

    $("#tablet").click(function() {
        $("#output").css("width", "1024px");
        render();
    });
        /**
 * screen size button for mobile
 * @name mobile
 * @function
 * @global
 * @param event - event mobile button is pressed
 */
    $("#mobile").click(function() {
        $("#output").css("width", "400px");
        render();
    });


        /**
 * begin new polymer element project
 * @name inserter
 * @function
 * @global
 * @param event - insert Polymer element starter files
 */
    $("#inserter").click(function(e) {
        e.preventDefault();
        jseditor.setValue("");
        csseditor.setValue("");
        htmleditor.setValue(polyTemp);

    });


           /**
 * clear all three editors
 * @name clear
 * @function
 * @global
 * @param event - event clear button is pressed
 */
    $("#clear").click(function() {
        jseditor.setValue("");
        csseditor.setValue("");
        htmleditor.setValue("");

        currentNote = "Empty Project";
        $(".current").html(currentNote);
        render();
    });




    // render iFrame
    $("#go").click(function() {
        render();
    });
    // save project
    $("#saver").click(function() {
        saveProject();
    });

            /**
 * event to load selected project into editors
 * @name loadProject
 * @function
 * @global
 * @param event - event project button is pressed
 */

    $("#consoleLog").on("click", "a", function(e) {
        note = $(this).text();
        $("#currentInfo").html("");
        newNote = JSON.parse(window.localStorage.getItem(note));

        js = newNote.js;
        css = newNote.css;
        html = newNote.html;

        currentNote = note;
        $(".current").html(currentNote);
        //$("#currentInfo").append("<tr><td>Type: </td><td>" + newNote.type + "</td></tr>");
        //$("#currentInfo").append("<tr><td>Author: </td><td>" + newNote.author + "</td></tr>");
        // $("#currentInfo").append("<tr><td>Date</td><td>" + newNote.createdDate.substring(0, 10) + "</td></tr>");
        jseditor.setValue(js);
        csseditor.setValue(css);
        htmleditor.setValue(html);

        render();

    });

            /**
 * delete project
 * @name deleter
 * @function
 * @global
 * @param event - event delete button is pressed
 */

    $("#deleter").click(function() {
        jseditor.setValue("");
        csseditor.setValue("");
        htmleditor.setValue("");


        if (currentNote != "cache") {
            window.localStorage.removeItem(currentNote);
        }
        currentNote = "Empty Project";
        $(".current").html(currentNote);
        getSaved();
    });




    $('.modal-footer button').click(function() {
        var button = $(this);

        if (button.attr("data-dismiss") != "modal") {
            var inputs = $('form input');
            var title = $('.modal-title');
            var progress = $('.progress');
            var progressBar = $('.progress-bar');
            var user = $("#uLogin").val();
            var pass = $("#uPassword").val();
            var userObj = {};

            userObj.user = user;
            userObj.pass = pass;


            window.localStorage.setItem("u", JSON.stringify(userObj));
            currentUser = user;
            inputs.attr("disabled", "disabled");

            button.hide();

            progress.show();

            progressBar.animate({
                width: "100%"
            }, 100);

            progress.delay(1000)
                .fadeOut(600);

            button.text("Close")
                .removeClass("btn-primary")
                .addClass("btn-success")
                .blur()
                .delay(1600)
                .fadeIn(function() {
                    title.text("Log in is successful");
                    button.attr("data-dismiss", "modal");
                });
        }
    });

    $('#myModal').on('hidden.bs.modal', function(e) {
        e.preventDefault();
        var inputs = $('form input');
        var title = $('.modal-title');
        var progressBar = $('.progress-bar');
        var button = $('.modal-footer button');

        inputs.removeAttr("disabled");

        title.text("Log in");

        progressBar.css({
            "width": "0%"
        });

        button.removeClass("btn-success")
            .addClass("btn-primary")
            .text("Ok")
            .removeAttr("data-dismiss");

    });

        /**
 * screen size button for fullScreen
 * @name fullScreen
 * @function
 * @global
 * @param event - event fullScreen button is pressed
 */

    $("#fullScreen").click(function() {

        renderFull();

    });

            /**
 * toggle light and dark themes
 * @name kalmeer
 * @function
 * @global
 * @param event - event kalmeerMode button is pressed
 */


    $("#kalmeer").click(function(e) {
        e.preventDefault();

        if (kalmeerMode == true) {
            $("#jsBody").css("background-color", "black");
            $("#jsBody").css("color", "white");
            $("#htmlBody").css("background-color", "black");
            $("#htmlBody").css("color", "white");
            $("#cssBody").css("background-color", "black");
            $("#cssBody").css("color", "white");
            $("body").css("background-color", "black");
            $("#output").css("background-color", "white");
            kalmeerMode = false;
        } else {
            $("#htmlBody").css("background-color", "white");
            $("#htmlBody").css("color", "black");
            $("#cssBody").css("background-color", "white");
            $("#cssBody").css("color", "black");
            $("#jsBody").css("background-color", "white");
            $("#jsBody").css("color", "black");
            $("body").css("background-color", "white");
            kalmeerMode = true;
        }

    });


    /**
     * global init() function
     * @method init
     * @param {object} options
     */
    function init(options) {

        kalmeerMode = options.kalmeerMode;

        if (options.debug == true) {
            console.log("DEBUG MODE");
        }
        //addType();
        //window.localStorage.clear();
        //window.localStorage.removeItem("Parse/COrDTZjsSjOUkiIDHUXiEVdgWfqlURUbm3wKPGJW/installationId");
        $("#msgBox").hide();
        //importer();
        if (window.localStorage.getItem("u")) {
            currentUserCache = JSON.parse(window.localStorage.getItem("u"));
            currentUser = currentUserCache.user;

            gh = new Octokit({
                username: currentUserCache.user,
                password: currentUserCache.pass
            });
        }
        initLog = "\n<------------- init successful ------------->";
        restoreFromCache();
        getSaved();






    };

    init(options);



});