// Load jsPsych
var jsPsych = initJsPsych({});

// Timeline that holds javascript variables
var timeline = [];

// Variables that hold the correct stimuli depending on singing range
var pitch_matching_stimuli;
var practice_stimulus;
var trial_stimuli;

// Arrays holding information for low stimuli
var low_pitch_matching = ["pitch_matching-A2.mp3", "pitch_matching-D3.mp3", "pitch_matching-G3.mp3"];
var low_pitch_matching_hz = [110, 146.83, 196];
var low_stimuli = ["seed_1-gen_0-low.mp3", "seed_2-gen_0-low.mp3", "seed_3-gen_0-low.mp3", "seed_4-gen_0-low.mp3"];


// Arrays holding information for high stimuli
var high_pitch_matching = ["pitch_matching-A3.mp3", "pitch_matching-D4.mp3", "pitch_matching-G4.mp3"];
var high_pitch_matching_hz = [220, 293.66, 392];
var high_stimuli = ["seed_1-gen_0-high.mp3", "seed_2-gen_0-high.mp3", "seed_3-gen_0-high.mp3", "seed_4-gen_0-high.mp3"];


// Capture info from Prolific
//const subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
const subject_id = jsPsych.randomization.randomID(10);

//jsPsych.data.addProperties({ subject_id: subject_id });

/**************************************** EXPERIMENT EVENTS ****************************************/
var preload = {
    type: jsPsychPreload,
    auto_preload: true
};

var welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p style='font-size:68px;'>Welcome!</p>",
    choices: "NO_KEYS",
    trial_duration: 1500
};

timeline.push(welcome);

var housekeeping = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Now for some housekeeping...",
    choices: "NO_KEYS",
    trial_duration: 2000,
};

// Event to adjust volume
var volume_calibration = {
    type: jsPsychAudioButtonResponse,
    stimulus: "volume_cal.mp3",
    prompt: "<p>As you hear the music, please adjust your volume to a comfortable level.</p>Click the button to continue.",
    choices: ["Continue"],
};

// Event to debrief the participant at the end of the experimentt
var debrief = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Thanks for participating in my experiment!</p>If you would like to learn more about it, click the 'Tell Me More!' button.<p>Otherwise, click the 'Back to Prolific' button to complete the study.</p>",
    choices: ["Tell Me More!", "Back to Prolific"],
    // Get button selected
    on_finish: function (data) {
        if (data.response == 1) {
            window.location.href = "https://www.vassar.edu/";
        }
    }
};

// Event to give detailed debriefing to participant
var full_debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p>full debrief goes here.</p><a href='https://www.vassar.edu/'>CLICK HERE</a> to return to Prolific and complete the study",
    choices: "NO_KEYS"
};

/************************************* EVENTS FOR MELODY GENERATION  *************************************/
var instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>In this experiment, you will listen to 4 melodies, each played three times.</p><p>On the third time, a microphone will pop up on the screen immediately after. When you see it,  sing the pitch of what you think the next note is (using the syllable 'ta') and for how long you think the note will last.</p><p>To help with the rhythm anf timing, you may want to sing the end of the melody.<p>At the end of each trial, you will be asked to rate how confident you are that the note you sang is what comes next in the melody.</p>To continue, hit the 'Next' button'.",
    choices: ["Next"]
};

timeline.push(instructions, housekeeping);

// Event to obtain consent to use microphone
var consent_q = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "This experiment involves recording audio. Do you consent to the use of this device's microphone?",
    choices: ["Yes", "No"]
};

var no_consent = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p>Unfortunately, you cannot participate in this experiment without use of the microphone.</p><p>Thank you for your interest in my study!</p><a href='https://www.vassar.edu/'>CLICK HERE</a> to return to Prolific",
    choices: "NO_KEYS"
};

var conditional_consent_q = {
    timeline: [no_consent],
    conditional_function: function () {
        return (jsPsych.data.get().last(1).values()[0].response) == 1;
    }
};

timeline.push(consent_q, conditional_consent_q);

var init_mic = {
    type: jsPsychInitializeMicrophone
};

timeline.push(init_mic, volume_calibration);

// Event to find singing range and populate stimuli
var range_q = {
    type: jsPsychAudioButtonResponse,
    stimulus: "range.mp3",
    choices: ["Higher", "Lower"],
    prompt: "Which is the more comfortable singing range for you?",
    on_finish: function (data) {
        // Low stimuli
        if (data.response == 1) {
            pitch_matching_stimuli = {
                file: low_pitch_matching,
                name: low_pitch_matching.map(function (s) { return s.split('-')[1].split('.')[0] }),
                hz: low_pitch_matching_hz
            };
            practice_stimulus = {
                file: ["practice-low.mp3"],
                name: ["practice"]
            };
            trial_stimuli = {
                file: low_stimuli,
                name: low_stimuli.map(function (s) { return s.split('/')[1].split('-')[0] }),
                range: "low"
            }
        }
        // High stimuli
        else {   
            pitch_matching_stimuli = {
                file: high_pitch_matching,
                name: high_pitch_matching.map(function (s) { return s.split('-')[1].split('.')[0] }),
                hz: high_pitch_matching_hz
            };
            practice_stimulus = {
                file: ["practice-high.mp3"],
                name: ["practice"]
            };
            trial_stimuli = {
                file: high_stimuli,
                name: high_stimuli.map(function (s) { return s.split('/')[1].split('-')[0] }),
                range: "high"
            }
        }
    }
};

timeline.push(range_q);

var pitch_matching_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>In the following section, you will hear 3 tones. When the microphone pops up, please try to match the pitch and sing back the note that was played (using the syllable 'ta').</p>Click the 'Continue' button to start.",
    choices: ["Continue"]
};

var pitch_matching_tone = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable("file"),
    prompt: "<img src='note.png' widtht=500, height=500></img>",
    choices: "NO_KEYS",
    trial_ends_after_audio: true
};

var pitch_matching_response = {
    type: jsPsychHtmlAudioResponse,
    stimulus: "<img src='mic.png' width=400, height=500></img>",
    recording_duration: 1500,
    show_done_button: false,
    post_trial_gap: 2000,
    data: {
        pitch: jsPsych.timelineVariable("pitch"),
        hz: jsPsych.timelineVariable("hz")
    },
    on_finish: function (data) {
        // filename example: 1234-A2.webm
        const filename = `${subject_id}-${data.pitch}.webm`;
        jsPsychPipe.saveBase64Data("QfKXr6jPLyzT", filename, data.response);
        // delete the base64 data to save space. store the filename instead.
        data.response = filename;
    }
};

var pitch_matching_procedure = {
    timeline: [pitch_matching_tone, pitch_matching_response],
    timeline_variables: [
        {
            "file": function () { return pitch_matching_stimuli.file[0] },
            "pitch": function () { return pitch_matching_stimuli.name[0] },
            "hz": function() { return pitch_matching_stimuli.hz[0]}
        },
        {
            "file": function () { return pitch_matching_stimuli.file[1] },
            "pitch": function () { return pitch_matching_stimuli.name[1] },
            "hz": function() { return pitch_matching_stimuli.hz[1]}
        },
        {
            "file": function () { return pitch_matching_stimuli.file[2] },
            "pitch": function () { return pitch_matching_stimuli.name[2] },
            "hz": function() { return pitch_matching_stimuli.hz[2]}
        }
    ],
    randomize_order: true
};

timeline.push(pitch_matching_instructions, pitch_matching_procedure);

var lessons_q_preamble = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Great! One last thing before the practice trial...",
    choices: "NO_KEYS",
    trial_duration: 3000
};

var lessons_q = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: "Have you taken music lessons?",
            options: ["No", "Yes"],
            required: true,
            horizontal: true
        },
    ]
};

var lessons_cont_qs = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: "For how many years?",
            name: "LessonYears",
            options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"],
            required: true
        },
        {
            prompt: "Do you currently take lessons?",
            name: "LessonCurrent",
            options: ["Yes", "No"],
            required: true
        }
    ],
};

var conditional_qs = {
    timeline: [lessons_cont_qs],
    conditional_function: function () {
        return (jsPsych.data.get().last(1).values()[0].response.Q0) == 'Yes';
    }
};

timeline.push(lessons_q_preamble, lessons_q, conditional_qs);

// PROCEDURE EVENTS
var first_listen = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "1st Listen...",
    choices: "NO_KEYS",
    trial_duration: 3000
};

var second_listen = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "2nd Listen...",
    choices: "NO_KEYS",
    trial_duration: 3000
};

var third_listen = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "3rd Listen (prepare to sing)...",
    choices: "NO_KEYS",
    trial_duration: 3000
};

var listen_intermission = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: 2000
};

var trial_melody = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable("file"),
    prompt: "<img src='notes.png'></img>",
    choices: "NO_KEYS",
    trial_ends_after_audio: true
};

var trial_response = {
    type: jsPsychHtmlAudioResponse,
    stimulus: "<img src='mic.png' width='400', height='500'></img>",
    recording_duration: 3000,
    show_done_button: false,
    data: {
        melody: jsPsych.timelineVariable("melody"),
        range: jsPsych.timelineVariable("range")
    },
    on_finish: function (data) {
        // filename example: 1234-seed_1-high.webm
        const filename = `${subject_id}-${data.melody}-${data.range}.webm`;
        jsPsychPipe.saveBase64Data("QfKXr6jPLyzT", filename, data.response);
        // delete the base64 data to save space. store the filename instead.
        data.response = filename;
    }
};

var confidence_response = {
    type: jsPsychSurveyLikert,
    questions: [
        {
            prompt: "On a scale of 1-7, how confident are you that the pitch you sang is the next note in the melody?",
            labels: ["1\n(note was practically\nchosen at random)", "2", "3", "4", "5", "6", "7\n(very confident)"]
        }
    ],
    data: {
        task: "confidence"
    }
};

var trial_intermission = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Click the button to continue to the next melody.",
    choices: ["Next"]
};

// Determine when to display intermission (trials 1-3)
var conditional_intermission = {
    timeline: [trial_intermission],
    conditional_function: function () {
        // Determine if the subject is on the last melody 
        return (jsPsych.data.get().filter({task: "confidence"}).count() < 4);
    }
};

var practice_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "To start a practice trial, hit the 'Begin' button.",
    choices: ["Begin"]
};

var practice_end = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>You've completed the practice trial!</p>When you are ready to move onto the experiment, click the 'Start' button.",
    choices: ["Start"]
};

// Event to run practice trial
var practice_trial = {
    timeline: [practice_instructions, first_listen, trial_melody, listen_intermission, second_listen, trial_melody, listen_intermission, third_listen, trial_melody, trial_response, confidence_response, practice_end],
    timeline_variables: [
        {
            "file": function () { return practice_stimulus.file },
            "pitch": function() { return practice_stimulus.name }
        }
    ]
};

timeline.push(practice_trial);

// Save data
// var save_server_data = {
//     type: jsPsychCallFunction,
//     func: function () {
//         var data = jsPsych.data.get().json();
//         var xhr = new XMLHttpRequest();
//         xhr.open("POST", "php/save_json.php");
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.send(JSON.stringify({ filedata: data }));
//     },
//     post_trial_gap: 1000
// };

// Determine when to save data (after all 4 trials)
// var conditional_save_server_data = {
//     timeline: [save_server_data],
//     conditional_function: function () {
//         return (jsPsych.data.get().filter({task: "confidence"}).count() == 5);
//     }
// };

// Event to run experimental trials
var listen_and_respond_procedure = {
    timeline: [first_listen, trial_melody, listen_intermission, second_listen, trial_melody, listen_intermission, third_listen, trial_melody, trial_response, confidence_response, conditional_intermission],
    timeline_variables: [
        {
            "file": function () { return trial_stimuli.file[0] },
            "melody": function () { return trial_stimuli.name[0] },
            "range": trial_stimuli.range
        },
        {
            "file": function () { return trial_stimuli.file[1] },
            "melody": function () { return trial_stimuli.name[1] },
            "range": trial_stimuli.range
        },
        {
            "file": function () { return trial_stimuli.file[2] },
            "melody": function () { return trial_stimuli.name[2] },
            "range": trial_stimuli.range
        },
        {
            "file": function () { return trial_stimuli.file[3] },
            "melody": function () { return trial_stimuli.name[3] },
            "range": trial_stimuli.range
        }
    ],
    randomize_order: true
};

timeline.push(listen_and_respond_procedure);

timeline.push(debrief, full_debrief);

jsPsych.run(timeline);
