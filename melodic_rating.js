// Load jsPsych
var jsPsych = initJsPsych({});

// Timeline that holds javascript variables
var timeline = [];

// Capture info from Prolific
//const subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
const subject_id = jsPsych.randomization.randomID(10);
const fname = `rate-${subject_id}.json`;

// STIMULI FILES
// for each list, the first element is the high range stimuli
//                and the second element is the low range stimuli
unpred_stimuli = [["stimuli/high/gen_9/seed_1u-gen9-high.mp3", "stimuli/high/gen_9/seed_2u-gen9-high.mp3",
    "stimuli/high/gen_9/seed_3u-gen9-high.mp3", "stimuli/high/gen_9/seed_4u-gen9-high.mp3"],
    ["stimuli/low/gen_9/seed_1u-gen9-low.mp3", "stimuli/low/gen_9/seed_2u-gen9-low.mp3",
        "stimuli/low/gen_9/seed_3u-gen9-low.mp3", "stimuli/low/gen_9/seed_4u-gen9-low.mp3"]]

pred_stimuli = [["stimuli/high/gen_9/seed_1p-gen9-high.mp3", "stimuli/high/gen_9/seed_2p-gen9-high.mp3",
    "stimuli/high/gen_9/seed_3p-gen9-high.mp3", "stimuli/high/gen_9/seed_4p-gen9-high.mp3"],
    ["stimuli/low/gen_9/seed_1p-gen9-low.mp3", "stimuli/low/gen_9/seed_2p-gen9-low.mp3",
        "stimuli/low/gen_9/seed_3p-gen9-low.mp3", "stimuli/low/gen_9/seed_4p-gen9-low.mp3"]]
    
practice_stimulus = ["stimuli/volume_cal.mp3"]

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
    stimulus: "<p>In this experiment, you will be asked to listen to and rate 8 melodies.</p>><p>Please rate each melody based on how much you like it. You will hear each melody 3 times.</p>To continue, hit the 'Next' button'.",
    choices: ["Next"]
};

var housekeeping = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Now for some housekeeping...",
    choices: "NO_KEYS",
    trial_duration: 2000,
};

timeline.push(instructions, housekeeping);

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
        return (jsPsych.data.get().last(1).values()[0].response.Q0 == 'Yes');
    }
};

timeline.push(lessons_q_preamble, lessons_q, conditional_qs);

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

