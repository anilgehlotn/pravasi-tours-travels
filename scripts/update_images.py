cat > scripts/update_images.py << 'EOF'
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pathlib import Path

load_dotenv("backend/.env")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

IMAGES_BASE_FOLDER = Path("vehicle_images")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

VEHICLES_TO_UPDATE = [
    "sleeper-coach",
    "volvo-coach",
    "bus-45",
    "toyota-fortuner",
    "tempo-ac",
    "tempo-non-ac",
]

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

def update_selected_vehicles():
    print(f"\n🔄 Updating {len(VEHICLES_TO_UPDATE)} vehicles\n")
    print("=" * 55)
    all_results = {}

    for vehicle_id in VEHICLES_TO_UPDATE:
        vehicle_folder = IMAGES_BASE_FOLDER / vehicle_id
        print(f"\n📁 {vehicle_id}")

        if not vehicle_folder.exists():
            print(f"   ❌ Folder not found, skipping.")
            continue

        image_files = sorted([
            f for f in vehicle_folder.iterdir()
            if f.suffix.lower() in ALLOWED_EXTENSIONS
        ])

        if not image_files:
            print(f"   ⚠️  No images found, skipping.")
            continue

        vehicle_urls = []
        for index, image_file in enumerate(image_files, start=1):
            try:
                url = upload_single_image(image_file, vehicle_id, index)
                vehicle_urls.append(url)
                print(f"   ✅ {url}")
            except Exception as e:
                print(f"   ❌ Failed {image_file.name}: {e}")

        all_results[vehicle_id] = vehicle_urls

    print("\n\n" + "=" * 55)
    print("🎉 DONE — Copy these into your server.py")
    print("=" * 55)

    for vehicle_id, urls in all_results.items():
        print(f'\n# ── {vehicle_id} ──')
        print(f'"image": "{urls[0]}",')

if __name__ == "__main__":
    update_selected_vehicles()
EOF