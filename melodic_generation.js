// load jsPsych
var jsPsych = initJsPsych({});

// timeline that holds javascript variables
var timeline = [];

// variables that hold the correct stimuli depending on singing range
var pitch_matching_stimuli;
var practice_stimulus;
var trial_stimuli;

// alternate condition assignment
var version;

async function createExperiment(){
    const condition = await jsPsychPipe.getCondition("QfKXr6jPLyzT");
    if(condition == 0) { version = 0; }
    if (condition == 1) { version = 1; }
    console.log(version);
    jsPsych.run(timeline);
  }
  createExperiment();

// arrays holding files for low stimuli
var low_pitch_matching = ["stimuli/pitch_matching/pitch_matching-A2.mp3", "stimuli/pitch_matching/pitch_matching-D3.mp3", "stimuli/pitch_matching/pitch_matching-G3.mp3"];
//EDIT EACH GEN
var low_stimuli = [["stimuli/low/seed_1p-gen_5-low.mp3", "stimuli/low/seed_2p-gen_5-low.mp3",
                    "stimuli/low/seed_3u-gen_5-low.mp3", "stimuli/low/seed_4u-gen_5-low.mp3"],
                    ["stimuli/low/seed_1u-gen_5-low.mp3", "stimuli/low/seed_2u-gen_5-low.mp3",
                    "stimuli/low/seed_3p-gen_5-low.mp3", "stimuli/low/seed_4p-gen_5-low.mp3"]];



// arrays holding files for high stimuli
var high_pitch_matching = ["stimuli/pitch_matching/pitch_matching-A3.mp3", "stimuli/pitch_matching/pitch_matching-D4.mp3", "stimuli/pitch_matching/pitch_matching-G4.mp3"];
//EDIT EACH GEN
var high_stimuli = [["stimuli/high/seed_1p-gen_5-high.mp3", "stimuli/high/seed_2p-gen_5-high.mp3",
                    "stimuli/high/seed_3u-gen_5-high.mp3", "stimuli/high/seed_4u-gen_5-high.mp3"],
                    ["stimuli/high/seed_1u-gen_5-high.mp3", "stimuli/high/seed_2u-gen_5-high.mp3",
                    "stimuli/high/seed_3p-gen_5-high.mp3", "stimuli/high/seed_4p-gen_5-high.mp3"]];



// capture info from Prolific
const subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
//EDIT EACH GEN
const fname = `gen_5-${subject_id}.json`;

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

var instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>In this experiment, you will listen to 4 melodies, each played three times.</p><p>After the third time, a <b>microphone</b> will pop up on the screen. When you see it, <b>sing (using the syllable 'ta') how you think the melody ends.</b></p><p>Please make sure you are in a quiet environment!</p><p>After you sing, you will be asked to rate how confident you are that the note you sang is the last note in the melody.</p>To continue, hit the 'Next' button.",
    choices: ["Next"]
};

var housekeeping = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Now for some housekeeping...",
    choices: "NO_KEYS",
    trial_duration: 2000,
};

timeline.push(instructions, housekeeping);

// obtain consent to use microphone
var consent_q = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "This experiment involves recording audio. Do you consent to the use of this device's microphone?",
    choices: ["Yes", "No"]
};

var no_consent = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p>Unfortunately, you cannot participate in this experiment without use of the microphone.</p><p>Thank you for your interest in my study!</p><a href='https://app.prolific.co/submissions/complete?cc=C17LNSMB'>CLICK HERE</a> to return to Prolific",
    choices: "NO_KEYS"
};

var conditional_consent_q = {
    timeline: [no_consent],
    conditional_function: function () {
        return (jsPsych.data.get().last(1).values()[0].response == 1);
    }
};

timeline.push(consent_q, conditional_consent_q);

var init_mic = {
    type: jsPsychInitializeMicrophone
};

// adjust volume
var volume_calibration = {
    type: jsPsychAudioButtonResponse,
    stimulus: "stimuli/volume_cal.mp3",
    prompt: "<p>As you hear the music, please adjust your volume to a comfortable level.</p>Click the button to continue.",
    choices: ["Continue"],
};

timeline.push(init_mic, volume_calibration);

function get_pitch(s) {
    return s.split('-')[1].split('.')[0]
};

function get_melody(s) {
    return s.split('-')[0].split('/')[2]
}

// select singing range and populate stimuli
var range_q = {
    type: jsPsychAudioButtonResponse,
    stimulus: "stimuli/range.mp3",
    choices: ["Higher", "Lower"],
    prompt: "Which is the more comfortable singing range for you?",
    on_finish: function (data) {
        // low stimuli
        if (data.response == 1) {
            pitch_matching_stimuli = {
                file: low_pitch_matching,
                name: low_pitch_matching.map(get_pitch),
            };
            practice_stimulus = {
                file: ["stimuli/practice-low.mp3"],
                name: ["practice"]
            };
            trial_stimuli = {
                file: low_stimuli[version],
                name: low_stimuli[version].map(get_melody)
            }
        }
        // high stimuli
        else {   
            pitch_matching_stimuli = {
                file: high_pitch_matching,
                name: high_pitch_matching.map(get_pitch),
            };
            practice_stimulus = {
                file: ["stimuli/practice-high.mp3"],
                name: ["practice"]
            };
            trial_stimuli = {
                file: high_stimuli[version],
                name: high_stimuli[version].map(get_melody)
            }
        }
    }
};

timeline.push(range_q);

var pitch_matching_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>In the following section, you will hear 3 tones. When you see the microphone, please try to sing (using the syllable 'ta') back the same pitch you hear.</p>Click the 'Continue' button to start.",
    choices: ["Continue"]
};

var pitch_matching_tone = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable("file"),
    prompt: "<img src='images/note.png' widtht=500, height=500></img>",
    choices: "NO_KEYS",
    trial_ends_after_audio: true
};

var pitch_matching_response = {
    type: jsPsychHtmlAudioResponse,
    stimulus: "<img src='images/mic.png' width=400, height=500></img>",
    recording_duration: 1500,
    show_done_button: false,
    post_trial_gap: 2000,
    data: {
        pitch: jsPsych.timelineVariable("pitch")
    },
    on_finish: function (data) {
        // filename example: gen0-1234-A2.webm
        //EDIT EACH GEN
        const filename = `gen_5-${subject_id}-${data.pitch}.webm`;
        jsPsychPipe.saveBase64Data("QfKXr6jPLyzT", filename, data.response);
    }
};

var pitch_matching_procedure = {
    timeline: [pitch_matching_tone, pitch_matching_response],
    timeline_variables: [
        {
            "file": function () { return pitch_matching_stimuli.file[0] },
            "pitch": function () { return pitch_matching_stimuli.name[0] }
        },
        {
            "file": function () { return pitch_matching_stimuli.file[1] },
            "pitch": function () { return pitch_matching_stimuli.name[1] }
        },
        {
            "file": function () { return pitch_matching_stimuli.file[2] },
            "pitch": function () { return pitch_matching_stimuli.name[2] }
        }
    ],
    randomize_order: true
};

timeline.push(pitch_matching_instructions, pitch_matching_procedure);

// collect info about musical training experience
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
            prompt: "Have you taken formal music lessons or claasses?",
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
        return (jsPsych.data.get().last(1).values()[0].response.Q0 == 'Yes');
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
    prompt: "<img src='images/notes.png'></img>",
    choices: "NO_KEYS",
    trial_ends_after_audio: true
};

var trial_response = {
    type: jsPsychHtmlAudioResponse,
    stimulus: "<img src='images/mic.png' width='400', height='500'></img>",
    recording_duration: 3000,
    show_done_button: false,
    data: {
        melody: jsPsych.timelineVariable("melody")
    },
    on_finish: function (data) {
        // filename example: gen0-1234-seed_1.webm
        //EDIT EACH GEN
        const filename = `gen_5-${subject_id}-${data.melody}.webm`;
        jsPsychPipe.saveBase64Data("QfKXr6jPLyzT", filename, data.response);
    }
};

var confidence_response = {
    type: jsPsychSurveyLikert,
    questions: [
        {
            prompt: "How confident are you that the note you sang is how the melody ends?",
            labels: ["1\n(note was practically\nchosen at random)", "2", "3", "4", "5", "6", "7\n(very confident)"],
            required: true
        }
    ],
    data: {
        task: "confidence",
        melody: jsPsych.timelineVariable("melody")
    }
};

var trial_intermission = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Click the button to continue to the next melody.",
    choices: ["Next"]
};

// determine when to display intermission (trials 1-3)
var conditional_intermission = {
    timeline: [trial_intermission],
    conditional_function: function () {
        // Determine if the subject is on the last melody 
        return (jsPsych.data.get().filter({task: "confidence"}).count() < 5);
    }
};

var practice_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "To start a practice trial, hit the 'Begin' button.",
    choices: ["Begin"]
};

var practice_end = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>You've completed the practice trial!</p><p>When you are ready to move onto the experiment, click the 'Start' button.</p>Remember to only sing the note you think finishes the melody (<b>not</b> the entire melody).",
    choices: ["Start"]
};

// run practice trial
var practice_trial = {
    timeline: [practice_instructions, first_listen, trial_melody, listen_intermission, second_listen, trial_melody, listen_intermission, third_listen, trial_melody, trial_response, confidence_response, practice_end],
    timeline_variables: [
        {
            "file": function () { return practice_stimulus.file },
            "melody": function() { return practice_stimulus.name }
        }
    ]
};

timeline.push(practice_trial);

// save data
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "QfKXr6jPLyzT",
    filename: fname,
    data_string: ()=>jsPsych.data.get().json()
  };

// determine when to save data (after all 4 trials)
var conditional_save_data = {
    timeline: [save_data],
    conditional_function: function () {
        return (jsPsych.data.get().filter({task: "confidence"}).count() == 5);
    }
};

// run experimental trials
var listen_and_respond_procedure = {
    timeline: [first_listen, trial_melody, listen_intermission, second_listen, trial_melody, listen_intermission, third_listen, trial_melody, trial_response, confidence_response, conditional_intermission, conditional_save_data],
    timeline_variables: [
        {
            "file": function () { return trial_stimuli.file[0] },
            "melody": function () { return trial_stimuli.name[0] }
        },
        {
            "file": function () { return trial_stimuli.file[1] },
            "melody": function () { return trial_stimuli.name[1] }
        },
        {
            "file": function () { return trial_stimuli.file[2] },
            "melody": function () { return trial_stimuli.name[2] }
        },
        {
            "file": function () { return trial_stimuli.file[3] },
            "melody": function () { return trial_stimuli.name[3] }
        }
    ],
    randomize_order: true
};

timeline.push(listen_and_respond_procedure);

// debrief the participant at the end of the experimentt
var debrief = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>Thanks for participating in my experiment!</p>If you would like to learn more about it, click the 'Tell Me More!' button.<p>Otherwise, click the 'Back to Prolific' button to complete the study.</p>",
    choices: ["Tell Me More!", "Back to Prolific"],
    // Get button selected
    on_finish: function (data) {
        if (data.response == 1) {
            window.location.href = "https://app.prolific.co/submissions/complete?cc=C3TGJ83U";
        }
    }
};

// give detailed debriefing to participant
var full_debrief = {
    type: jsPsychHtmlKeyboardResponse,
    // When the melodies diverge: 
    stimulus: "<p>This experiment is exploring the relationship between melodic predictability and listener pleasure. You are a part of the group that is writing these melodies. You heard two melodies that continued in an unpredictable way and two that continued in a predictable way. Your responses will be used to determine how the melody should continue past this point, filling them in with the most predictable notes. Once the melodies are complete, another group of participants will rate how much they enjoy all 8 melodies (predictable and unpredictable versions of the 4 different melodies). Their responses will be analyzed to investigate if there is any relationship between their ratings and whether the melody had a point of unpredictability or not. </p><a href='https://app.prolific.co/submissions/complete?cc=C3TGJ83U'>CLICK HERE</a> to return to Prolific and complete the study.",
    choices: "NO_KEYS"
};

var conditional_full_debrief = {
    timeline: [full_debrief],
    conditional_function: function () {
        return (jsPsych.data.get().last(1).values()[0].response == 0);
    }
}

timeline.push(debrief, conditional_full_debrief);
