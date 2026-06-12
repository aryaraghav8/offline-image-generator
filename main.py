from src.generator import generate_image


def main():
    print("=" * 50)
    print("Offline AI Image Generator")
    print("=" * 50)

    prompt = input("Enter prompt: ")

    if not prompt.strip():
        print("Prompt cannot be empty!")
        return

    print("\nGenerating image...\n")

    image_path = generate_image(prompt)

    print(f"Image saved to: {image_path}")


if __name__ == "__main__":
    main()