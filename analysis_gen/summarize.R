library(dplyr)
library(tidyverse)

# import all participant data
files <- list.files(path="../data/participants/")

df <- read_csv(paste0("../data/participants/", files[1]), show_col_types=FALSE)

for (f in files[2:6]) {
  df <- rbind(df, read_csv(paste0("../data/participants/", f), show_col_types=FALSE))
}

# recode gen var to factor
df$gen <- as.factor(df$gen)

# table for participants section
participants <- df %>% group_by(gen) %>% summarize(n=n(),
                                              range_prop=(1 - (sum(range)/n())) * 100,
                                              music_prop=(sum(music)/n()) * 100)

# table for results section
results <- df %>% group_by(gen) %>% summarize(na=sum(is.na(pitch_error)),
                                              error_med=median(pitch_error, na.rm=TRUE),
                                              error_std=sd(pitch_error, na.rm=TRUE),
                                              error_mean=mean(pitch_error, na.rm=TRUE))

# count number of ppl with no pitch error
df %>% group_by(gen) %>% filter(pitch_error==0) %>% summarize(n=n())
# summarize across all generations
music <- mean(participants$music_prop)
range <- mean(participants$range_prop)

# lengths of the final melodies presented to the second phase
durations <- c(6.25, 5.90, 6.00, 6.25)

mean(durations)
sd(durations)


# find mode 
find_mode <- function(x) {
  u <- unique(x)
  tab <- tabulate(match(x, u))
  u[tab == max(tab)]
}

#calculate mode of pitch error by gen
df %>% group_by(gen) %>%
       summarize(mode_error = find_mode(pitch_error))

conf_df <- rbind(conf_df, read_csv("../data/gen_5/gen_5-responses_by_subject.csv", show_col_types=FALSE))
conf_df <- merge(conf_df, df, by=c("id", "music", "range", "pitch_error"))
conf_df %>% group_by(gen) %>% summarize(avg=mean(confidence), sd=sd(confidence))
conf_df %>% group_by(seed, version, gen) %>% summarize(avg=mean(confidence), sd=sd(confidence))
mean(conf_df$confidence)
sd(conf_df$confidence)
