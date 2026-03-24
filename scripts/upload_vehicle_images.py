# scripts/upload_vehicle_images.py

import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend folder
load_dotenv("backend/.env")

# Connect to Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

IMAGES_BASE_FOLDER = Path("vehicle_images")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


# Upload ONE image
def upload_single_image(image_path: Path, vehicle_id: str, index: int) -> str:
    public_id = f"img_{index:03d}"
    print(f"   ⬆️  Uploading {image_path.name}...")

    result = cloudinary.uploader.upload(
        str(image_path),
        folder=f"vehicles/{vehicle_id}",
        public_id=public_id,
        transformation=[
            {"width": 1200, "crop": "limit"},
            {"quality": "auto"},
            {"fetch_format": "auto"},
        ],
        overwrite=True,
        resource_type="image"
    )
    return result["secure_url"]


# TEST MODE — uploads just 1 image to verify connection
def test_single_upload():
    print("\n🧪 TEST MODE — Uploading 1 image only\n")

    test_image = None
    test_vehicle = None

    for vehicle_folder in IMAGES_BASE_FOLDER.iterdir():
        if vehicle_folder.is_dir():
            for f in vehicle_folder.iterdir():
                if f.suffix.lower() in ALLOWED_EXTENSIONS:
                    test_image = f
                    test_vehicle = vehicle_folder.name
                    break
        if test_image:
            break

    if not test_image:
        print("❌ No images found.")
        return

    try:
        url = upload_single_image(test_image, f"test_{test_vehicle}", 1)
        print(f"\n✅ TEST PASSED!")
        print(f"   Vehicle : {test_vehicle}")
        print(f"   File    : {test_image.name}")
        print(f"   URL     : {url}")
        print(f"\n👉 Open this URL in your browser to verify the image")
        print(f"👉 If it looks good run: python3 scripts/upload_vehicle_images.py --upload-all")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        print("   Check your .env credentials and try again.")


# FULL UPLOAD — all vehicles
def upload_all_vehicles():
    all_results = {}

    if not IMAGES_BASE_FOLDER.exists():
        print(f"❌ Folder '{IMAGES_BASE_FOLDER}' not found.")
        return

    vehicle_folders = sorted([
        f for f in IMAGES_BASE_FOLDER.iterdir()
        if f.is_dir() and not f.name.startswith("test_")
    ])

    if not vehicle_folders:
        print("❌ No vehicle folders found.")
        return

    print(f"\n🚗 Found {len(vehicle_folders)} vehicles\n")
    print("=" * 55)

    for vehicle_folder in vehicle_folders:
        vehicle_id = vehicle_folder.name
        print(f"\n📁 {vehicle_id}")

        image_files = sorted([
            f for f in vehicle_folder.iterdir()
            if f.suffix.lower() in ALLOWED_EXTENSIONS
        ])

        if not image_files:
            print(f"   ⚠️  No images found, skipping.")
            continue

        print(f"   📸 {len(image_files)} image(s)")
        vehicle_urls = []

        for index, image_file in enumerate(image_files, start=1):
            try:
                url = upload_single_image(image_file, vehicle_id, index)
                vehicle_urls.append(url)
                print(f"   ✅ {url}")
            except Exception as e:
                print(f"   ❌ Failed {image_file.name}: {e}")

        all_results[vehicle_id] = vehicle_urls

    # Print final URLs
    print("\n\n" + "=" * 55)
    print("🎉 ALL DONE — Copy these into your server.py")
    print("=" * 55)

    for vehicle_id, urls in all_results.items():
        print(f'\n# ── {vehicle_id} ──')
        print(f'"image": "{urls[0]}",')


if __name__ == "__main__":
    import sys
    if "--upload-all" in sys.argv:
        upload_all_vehicles()
    else:
        test_single_upload()