/*
 *   TERMS OF USE: MIT License
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// TODO: This file is not referenced anywhere within the Solo project

var baseUrl = $("meta[name=base]").attr("content");

var projectData = null;
var ready = false;
var projectLoaded = false;

var idProject = 0;

$(function () {
    projectData = window.data;
    showInfo(projectData);
    projectLoaded = true;
    if (ready) {
        window.frames["content_blocks"].setProfile(projectData['board']);
        window.frames["content_blocks"].init(projectData['board'], []);
    }

    $('#save-project').on('click', function () {
        saveProject();
    });

});

showInfo = function (data) {
    if (getURLParameter('debug')) console.log(data);
    $(".project-name").text(data['name']);
    if (!data['yours']) {
        $(".project-owner").text("(" + data['user'] + ")");
    }
};

saveProject = function () {
    var code = window.frames["content_blocks"].getXml();
    projectData['code'] = code;
    $.post(baseUrl + 'rest/project/code', projectData, function (data) {
        var previousOwner = projectData['yours'];
        projectData = data;
        projectData['code'] = code; // Save code in projectdata to be able to verify if code has changed upon leave
        utils.showMessage("Project saved", "The project has been saved");
        if (!previousOwner) {
            window.location.href = baseUrl + 'projecteditor?id=' + data['id'];
        }
    });
};

blocklyReady = function () {
    if (projectLoaded) {
        window.frames["content_blocks"].setProfile(projectData['board']);
        window.frames["content_blocks"].init(projectData['board'], []);
    } else {
        ready = true;
    }
};

loadProject = function () {
    if (projectData !== null) {
        window.frames["content_blocks"].load(projectData['code']);
    }
};

window.onbeforeunload = function () {
    if (checkLeave()) {
        return "The project has been changed since the last save.";
    }
};

checkLeave = function () {
    var currentXml = window.frames["content_blocks"].getXml();
    //console.log(projectData['code']);
    //console.log(currentXml);
    if (projectData === null) {
        if (currentXml === '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
            return false;
        } else {
            return true;
        }
    } else {
        if (projectData['code'] === currentXml) {
            return false;
        } else {
            return true;
        }
    }
};

setInterval(function () {
    $.get(baseUrl + 'ping');
}, 60000);