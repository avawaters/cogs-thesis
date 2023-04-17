library(base64enc)
library(dplyr)
library(jsonlite)
library(soundgen)
library(stringr)
library(tuneR)


### FUNCTIONS ###
## CONVERT BASE64 DATA INTO WAV FILES
base64_to_wav <- function() {
  # info about where to find and store base64 data
  pitches <- sub_df[!is.na(sub_df["pitch"]), "pitch"]
  seeds <- unlist(sub_df[!is.na(sub_df["task"]), "melody"])[2:5]
  # names of files where audio should be stored
  files <- c(unlist(lapply(pitches, function(p) paste0(fname, p, ".webm"))),
             unlist(lapply(seeds, function(s) paste0(fname, s, ".webm"))))

  # loop through all audio
  for (file in files) {
    # check if we are working with pitch matching or trial data
    if (str_detect(file, "seed")) {
      # seed we are extracting audio for
      seed <- substr(unlist(strsplit(file, "-"))[3], 1, 7)
      # row where the response is given
      row_idx <- which(sub_df$melody == seed)[1]
    }
    else {
      # pitch of audio we are extracting
      pitch <- substr(unlist(strsplit(file, "-"))[3], 1, 2)
      # row where the response is given
      row_idx <- which(sub_df$pitch == pitch)
    }
    
    # decode base64 data stored in the response col
    b64_str <- base64decode(unlist(sub_df$response[row_idx]))
    

    # save as .webm file
    loc <- paste0(dir, file)
    writeBin(b64_str, loc)
    
    # convert to wav file
    to_wav(file)
  }
  
  # remove all .webm files
  unlink(paste0("../data/", gen, "/*.webm"))
}

## CONVERT .WEBM -> .WAV ##
to_wav <- function(file) {
  file <- unlist(strsplit(file, ".webm"))[1]
  if (str_detect(file, "seed")) {
    data_dir <- trial_dir
  }
  else {
    data_dir <- pm_dir
  }
  # use system command ffmpeg to convert to wav format
  system(paste0("ffmpeg -y -i ../data/", gen, "/", file, ".webm ", data_dir, file, ".wav"))
}

## CALCULATE FUNDAMENTAL FREQUENCY FROM WAV FILE ##
calc_ff <- function(wavfile) {
  # specify which dir to access (pitch matching or trial data)
  if (str_detect(wavfile, "seed")) {
    file_loc <- paste0(trial_dir, wavfile)
    
    # populate vector depending on if the file is predictable vs. unpredictable
    # notes are expressed in Hz (high range)
    if(str_detect(wavfile, "p.wav")) {
      # gen_5: B3, G3, B3, C4
      last_notes <- c(246.94, 196.00, 246.94, 261.63)#EDIT EACH GEN
    }
    else {
      # gen_5: D4, B3, B3, C4
      last_notes <- c(293.66, 246.94, 246.94, 261.63) #EDIT EACH GEN
    }
    
    # set reference note by getting Hz of last note in melody
    ref_note <- case_when(str_detect(wavfile, "seed_1") ~ last_notes[1],
                          str_detect(wavfile, "seed_2") ~ last_notes[2],
                          str_detect(wavfile, "seed_3") ~ last_notes[3],
                          str_detect(wavfile, "seed_4") ~ last_notes[4])
    # change reference note if range is lower (higher is default)
    if (range == 1) {
      ref_note <- ref_note / 2
    }
  }
  else {
    file_loc <- paste0(pm_dir, wavfile)
    # set reference note by getting Hz of expected note
    ref_note <- notesToHz(unlist(strsplit(unlist(strsplit(wavfile, "-"))[3], ".wav")))
  }
  
  wav_obj <- readWave(file_loc) %>% channel("left")
  
  # skip over participants who didn't provide a response
  note <- tryCatch({
    wspec_obj <- periodogram(wav_obj, width=4096)

    ff <- FF(wspec_obj)

    notes <- noteFromFF(ff, diapason=ref_note)

    # return the note in terms of the number of semitones away from reference note
    # ex. if the reference note is a C4 and the sung note is a D4 -> note = 2
    return(as.numeric(names(which.max(table(notes)))))
  },
  error = function(e) {
    return(NA)
  })
  # wspec_obj <- periodogram(wav_obj, width=4096)
  # 
  # ff <- FF(wspec_obj)
  # 
  # notes <- noteFromFF(ff, diapason=ref_note)

  # return the note in terms of the number of semitones away from reference note
  # ex. if the reference note is a C4 and the sung note is a D4 -> note = 2
  # note <- as.numeric(names(which.max(table(notes))))

# -------------------------------------------------------------------------


}

## GET MODE OF VECTOR ##
get_mode <- function(v) {
  uniqv <- unique(v)
  uniqv[which.max(tabulate(match(v, uniqv)))]
}


### ANALYSIS ###

# data frame with 1 row = 1 response
# for each participant, there will be 4 responses
data <- data.frame(id = character(),
                   music = numeric(),
                   range = numeric(),
                   pitch_error = numeric(),
                   seed = factor(),
                   version = character(),
                   unadj_response = numeric(),
                   adj_response = numeric(),
                   confidence = numeric(),
                   stringsAsFactors = FALSE)

# data frame with 1 row = 1 subject
# has basic info about the participants
participants <- data.frame(gen = numeric(),
                           id = character(),
                           music = numeric(),
                           range = numeric(),
                           pitch_error = numeric())

# generation-specific info
gen <- "gen_5" #EDIT EACH GEN
dir <- paste0("../data/", gen, "/")
pm_dir <- paste0(dir, "pitch_matching/")
trial_dir <- paste0(dir, "trial_data/")

## FILE CLEANING ##
# remove practice files
unlink(paste0("../data/", gen, "/*practice.webm"))

# convert .webm files to .wav
webm_files <- list.files(path=dir, pattern=".webm")
lapply(webm_files, to_wav)

# remove .webm files from directory
unlink(paste0("../data/", gen, "/*.webm"))

# list of subjects
sub_list <- list.files(dir, pattern="json")

###### LOOP THROUGH ALL SUBJECTS ######
for (sub in sub_list) { 
  # save subject ID
  sub <- unlist(strsplit(unlist(strsplit(sub, "-"))[2], ".json"))
  # file name prefix
  fname <- paste0(gen, "-", sub, "-")
  
  # import JSON data and delete unnecessary cols
  sub_df <- fromJSON(paste0(dir, gen, "-", sub, ".json")) %>% 
            select(-c("rt", "trial_type", "time_elapsed", "internal_node_id", "trial_index",
                      "device_id", "estimated_stimulus_onset", "question_order"))
  # 0 = high, 1 = low
  range <- unlist(sub_df[7, "response"])
  
  # 0 = no, 1 = yes
  music <- as.numeric(ifelse(unlist(sub_df[16, "response"]) == "No", 0, 1))
  
  # save expected pitches in semitones away from the A note
  expected_pitches <- c(0, 5, 10)
  
  # check if audio files didn't save (should be 7 files total: 3 PM, 4 trials)
  if (length(list.files(pm_dir, pattern=fname)) +
      length(list.files(trial_dir, pattern=fname)) != 7) {
    base64_to_wav()
  }
  
  # save audio file names (after base64 data has been converted if needed)
  pm_wav_files <- list.files(pm_dir, pattern=fname)
  trial_wav_files <-  list.files(trial_dir, pattern=fname)
  
  ## PITCH DETECTION FOR PITCH MATCHING TASK ##

  pitch_matching_responses <- unlist(lapply(pm_wav_files, calc_ff))
  
  # calculate semitones away from expected pitch
  # positive value indicates they are sharp 
  # negative value indicates they are flat
  hz_diff <- pitch_matching_responses - expected_pitches
  
  pitch_error <- get_mode(hz_diff)
  
  ## PITCH DETECTION FOR TRIAL RESPONSES ##

  response_hz <- unlist(lapply(trial_wav_files, calc_ff))
  
  # get confidence responses, excluding the practice trial
  conf_responses <- sub_df %>% filter(task!=is.na(task) & melody!="practice") %>% 
                               mutate(response=as.numeric(unlist(response))) %>% 
                               select(c("response", "melody"))
  
  # loop through each response and add row to data
  for (i in 1:4) {
    # melody version (predictable vs. unpredictable)
    version <- substr(unlist(strsplit(trial_wav_files[i], "_"))[3], 2, 2)
    
    unadj_resp <- response_hz[i]
    # account for pitch error
    adj_resp <- response_hz[i] - pitch_error
    # confidence of response
    conf <- conf_responses[conf_responses$melody==paste0("seed_", i, version), "response"] + 1
    
    # add new row
    data <- data %>% add_row(id=sub, music=music, range=range, pitch_error=pitch_error, 
                             seed=as.factor(i), version=version, 
                             unadj_response=unadj_resp, adj_response=adj_resp, confidence=conf)
  }
  
  # add row to participant data
  
  participants <- participants %>% add_row(gen=as.numeric(unlist(strsplit(gen, "_"))[2]), id=sub, 
                                           music=music, range=range, pitch_error=pitch_error)
}

### EXTRACT MOST PREDICTABLE NOTE
# unadjusted responses
unadj_wted_resp <- data %>% count(seed, version, unadj_response, 
                                  wt=confidence, sort=TRUE) %>% 
                  rename(unadj_wted_n=n)
unadj_freq_resp <- data %>% count(seed, version, unadj_response, sort=TRUE) %>%
                   rename(unadj_n=n)

# adjusted responses
adj_wted_resp <- data %>% count(seed, version, adj_response, 
                                wt=confidence, sort=TRUE) %>%
                 rename(adj_wted_n=n)
adj_freq_resp <- data %>% count(seed, version, adj_response, sort=TRUE) %>%
                 rename(adj_n=n)

# join unweighted and weighted responses
unadj_responses <- inner_join(unadj_wted_resp, unadj_freq_resp, 
                              by=c("seed", "unadj_response", "version"))
adj_responses <- inner_join(adj_wted_resp, adj_freq_resp, 
                            by=c("seed", "adj_response", "version"))

# create full df with unadjusted and adjusted responses
responses <- full_join(unadj_responses, adj_responses, 
                        by=join_by("seed"=="seed", 
                                   "unadj_response"=="adj_response",
                                   "version"=="version")) %>%
             rename(response=unadj_response)

# write csvs of responses, data, and participants
responses %>% write.csv(file=paste0(dir, gen, "-responses.csv"), row.names=FALSE)
data %>% write.csv(file=paste0(dir, gen, "-responses_by_subject.csv"), row.names=FALSE)
participants %>% write.csv(file=paste0("../data/participants/", gen, "-participants.csv"), row.names=FALSE)

## TEST SUBJECTS
## highc4 - in tune (0), all responses are C4 (-4, 7, 1, -5)
## highsharp - 1 semitone sharp (1), all responses should be 3 semitones away (when adjusted)
## low8va - in tune, but singing in high register (12). responses should be 0 (when adjusted)
## lowflat - 1 semitone flat (-1), all responses should be 3 semitones away (when adjusted)
## ava - in tune (0), all responses are C4
