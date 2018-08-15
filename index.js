

$(document).ready(function () {
    /** generate boxes **/
    function Box(text, audio, position, name) {
        this.text = text;
        this.audio = audio;
        this.position = position;
        this.name = name;
    }

    var box1 = new Box("hello", "./audio/audio1.mp3", {top: '100px', left: '0'}, 'box1');
    var box2 = new Box("hi", "./audio/audio2.mp3", {top: '100px', left: '500px'}, 'box2');
    var box3 = new Box("bye", "./audio/audio3.mp3", {top: '100px', left: '900px'}, 'box3');

    var boxes = [box1, box2, box3];

    function generateBox(box) {
        var text = '<input type="text" value=' + box.text + '>';
        var audio = '<audio src="' + box.audio + '" preload="auto" id=' + box.name +'></audio>';
        var style = 'style="top:' + box.position.top + '; left:'+ box.position.left +'"';
        var buttons = '<i class="fa fa-volume-up d-none" data-audio="' + box.name + '"></i>' +
            '<i class="fa fa-volume-off d-block" data-audio="' + box.name + '"></i>';
        var boxElement = '<div class="box" ' + style + '>' +
            text +
            buttons +
            audio +
            '</div>';
        return boxElement;
    }

    boxes.forEach(function (box) {
        $('.container').append(generateBox(box));
    })

    /** handle audio and slider **/
    var slider = $("input[type='range']");
    slider.val(0);
    var total_duration = 0;
    var audio = $("audio");

    function Audio(src, duration) {
        this.src = src;
        this.duration = duration;
    }
    var dataAudio = [];

    function playAudioWithTime(time, item) {
        item.currentTime = time;
        item.play();
    }
    function activeBox(id) {
        $("i").parent().css('background', 'white');
        $("i[data-audio=" + id + "]").parent().css('background', 'red');
    }
    function hideButton(name) {
        $(name).removeClass('d-block');
        $(name).addClass('d-none');
    }
    function showButton(name) {
        $(name).removeClass('d-none');
        $(name).addClass('d-block');
    }
    function stopAudio(item) {
        item.pause();
        item.currentTime = 0;
    }
    function playAudioById(id) {
        $("#" + id)[0].play();
    }
    function changeSliderWithAudioTime(item, index) {
        var time = 0;
        dataAudio.forEach(function (value, key) {
            if(key < index){
                time += value.duration;
            }
        })
        slider.val(item.currentTime + time);
    }


    $(document).on('pause', 'audio', function () {
        hideButton(".fa-volume-up");
        showButton(".fa-volume-off");
    })
    audio.each(function (index, item) {
        item.onloadedmetadata = function() {
            total_duration += item.duration;
            let audio = new Audio(item.src, item.duration);
            dataAudio.push(audio);
            slider.attr('max', total_duration);
        }
        item.ontimeupdate = function() {
            changeSliderWithAudioTime(item, index);
        }
        item.addEventListener('ended', function () {
            if(index < audio.length - 1) {
                audio[index + 1].play();
                activeBox(audio[index + 1].id);
            }
        })
        item.addEventListener('play', function () {
            hideButton(".fa-volume-up");
            showButton(".fa-volume-off");
            hideButton($(this).parent().children('.fa-volume-off')[0]);
            showButton($(this).parent().children('.fa-volume-up')[0]);
            var audio_target = $(this).parent().children('i').attr("data-audio");
            activeBox(audio_target);
        })
    });
    slider.on('change', function () {
        var current_time = $(this).val();
        audio.each(function (index, item) {
            var duration = 0;
            dataAudio.forEach(function (value, key) {
                if(key < index){
                    duration += value.duration;
                }
            });
            stopAudio(item);
            if(duration < current_time && item.duration + duration > current_time){
                activeBox(item.id);
                playAudioWithTime(current_time - duration, item);
            }
        })
    })
    $(document).on('click', ".fa-volume-off", function() {
        var _this = $(this).parent().children('audio')[0];
        audio.each(function (index, item) {
            if (item !== _this) {
                stopAudio(item);
            }
        })
        var audio_target = $(this).attr("data-audio");
        playAudioById(audio_target);
    })
    $(document).on('click', ".fa-volume-up", function() {
        var audio_target = $(this).attr("data-audio");
        var audio = $("#" + audio_target)[0];
        audio.pause();
    })

})