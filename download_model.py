from huggingface_hub import snapshot_download

MODEL_ID = input("Enter Hugging Face model ID: ")

snapshot_download(
    repo_id=MODEL_ID,
    local_dir=f"./models/{MODEL_ID.split('/')[-1]}",
    local_dir_use_symlinks=False
)

print("Model downloaded successfully!")