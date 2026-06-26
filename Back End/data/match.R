library(FNN)
library(dplyr)
library(jsonlite)

# Load expert data
expert_data <- read.csv("expert_data.csv")
expert_data <- expert_data[,-1]  # Remove expert names


# Load expert metadata
expert_meta <- read.csv("expert_metadata.csv")
expert_meta <- expert_meta[,-1]  # Remove expert names


# Load student answers from command line (as JSON string)
args <- commandArgs(trailingOnly = TRUE)
student_answers <- fromJSON(args[1])


# Ensure student_answers is a data frame row
if (length(student_answers) != ncol(expert_data)) {
  stop(paste0("Student answer length (", length(student_answers), 
              ") does not match expected (", ncol(expert_data), ")."))
}

student_df <- as.data.frame(t(student_answers))  # transpose into 1-row data frame
colnames(student_df) <- colnames(expert_data)


# Combine and scale
combined_data <- rbind(expert_data, student_df)
combined_scaled <- scale(combined_data)

# Split back out
n_experts <- nrow(expert_data)
expert_scaled <- combined_scaled[1:n_experts, ]
student_scaled <- combined_scaled[n_experts + 1, , drop = FALSE]

# PCA
pca_result <- prcomp(expert_scaled, scale. = FALSE)
expert_pcs <- predict(pca_result, newdata = expert_scaled)
student_pcs <- predict(pca_result, newdata = student_scaled)


# KNN
k <- 30
neighbors <- get.knnx(expert_pcs[, 1:10, drop = FALSE], student_pcs[, 1:10, drop = FALSE], k = k)$nn.index

# Rank professions
neighbor_paths <- expert_meta$Path[neighbors[1,]]
rank_table <- sort(table(neighbor_paths), decreasing = TRUE)
result_df <- data.frame(Profession = names(rank_table),
                        Count = as.numeric(rank_table))

# Output result to stdout
cat(toJSON(result_df, pretty = TRUE))
