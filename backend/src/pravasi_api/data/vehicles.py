VEHICLES_DATA = [
    {
        "id": "sedan",
        "name": "Sedan",
        "category": "sedan",
        "seats": 4,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782894248/PHOTO-2026-07-01-13-52-09_nguxts.jpg",
        "description": "Comfortable sedan perfect for family trips and city transfers. Ideal for 2-4 passengers with luggage.",
        "features": ["Air Conditioned", "4 Seater", "Spacious Boot", "Music System", "GPS Navigation"],
        "pricing": {
            "local_8hrs_80km": 2200,
            "extra_km": 14,
            "extra_hr": 200,
            "outstation_km": 14,
            "min_km": 300,
            "driver_bata": 300
        }
    },
    {
        "id": "innova",
        "name": "Ertiga / Kia Carens",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782890280/ChatGPT_Image_Jul_1_2026_12_39_14_PM_iycbb1.png",
        "description": "Spacious Toyota Innova for comfortable group travel. Perfect for families and small groups.",
        "features": ["Air Conditioned", "7 Seater", "Ample Luggage Space", "Comfortable Seats", "Music System"],
        "pricing": {
            "local_8hrs_80km": 3000,
            "extra_km": 18,
            "extra_hr": 250,
            "outstation_km": 18,
            "min_km": 300,
            "driver_bata": 400
        }
    },
    {
        "id": "innova-crysta",
        "name": "Innova Crysta",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990193/vehicles/innova-crysta/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990193/vehicles/innova-crysta/img_001.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892248/WhatsApp_Image_2026-07-01_at_13.14.21_jn7gdb.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892652/PHOTO-2026-07-01-13-22-42_myw8fh.jpg"
        ],
        "description": "Premium Innova Crysta with captain seats for a luxurious travel experience.",
        "features": ["Air Conditioned", "7 Seater", "Captain Seats", "Premium Interior", "Rear AC Vents"],
        "pricing": {
            "local_8hrs_80km": 3500,
            "extra_km": 22,
            "extra_hr": 300,
            "outstation_km": 22,
            "min_km": 300,
            "driver_bata": 400
        }
    },
    {
        "id": "innova-hybrid",
        "name": "Hycross Hybrid",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782890930/ChatGPT_Image_Jul_1_2026_12_52_10_PM_bki0b1.png",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891845/PHOTO-2026-07-01-13-13-59_aumurb.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782890930/ChatGPT_Image_Jul_1_2026_12_52_10_PM_bki0b1.png",
            # "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891845/PHOTO-2026-07-01-13-13-59_aumurb.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892028/PHOTO-2026-07-01-13-14-21_sjpcxs.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892113/WhatsApp_Image_2026-07-01_at_13.16.33_z7lz0x.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892248/WhatsApp_Image_2026-07-01_at_13.14.21_jn7gdb.jpg"
        ],
        "description": "Eco-friendly Innova Hybrid combining fuel efficiency with comfort. Premium hybrid technology.",
        "features": ["Air Conditioned", "7 Seater", "Hybrid Engine", "Fuel Efficient", "Premium Interior"],
        "pricing": {
            "local_8hrs_80km": 4200,
            "extra_km": 28,
            "extra_hr": 350,
            "outstation_km": 25,
            "min_km": 300,
            "driver_bata": 500
        }
    },
    {
        "id": "toyota-fortuner",
        "name": "Toyota Fortuner",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891423/ChatGPT_Image_Jul_1_2026_01_03_29_PM_l6febm.png",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891423/ChatGPT_Image_Jul_1_2026_01_03_29_PM_l6febm.png",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891573/PHOTO-2026-07-01-13-09-04_rofk1y.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891595/PHOTO-2026-07-01-13-09-04_zqtfsl.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891621/PHOTO-2026-07-01-13-09-04_uwgkc2.jpg"
        ],
        "description": "Premium Toyota Fortuner for executive and luxury travel. Powerful SUV with commanding presence.",
        "features": ["Air Conditioned", "7 Seater", "4x4 Available", "Premium SUV", "Leather Seats"],
        "pricing": {
            "local_8hrs_80km": 5500,
            "extra_km": 50,
            "extra_hr": 500,
            "outstation_km": 45,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "tempo-non-ac",
        "name": "KIA CARNIVAL",
        "category": "van",
        "seats": 6,
        "ac": False,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893389/WhatsApp_Image_2026-07-01_at_13.31.48_3_szpnwh.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893389/WhatsApp_Image_2026-07-01_at_13.31.48_3_szpnwh.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893054/WhatsApp_Image_2026-07-01_at_13.31.46_vw2z6z.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893060/WhatsApp_Image_2026-07-01_at_13.31.46_2_usmxvx.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893095/WhatsApp_Image_2026-07-01_at_13.31.45_1_twm6x6.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893039/WhatsApp_Image_2026-07-01_at_13.31.47_dhsz5v.jpg"
        ],
        "description": "Budget-friendly Tempo Traveller without AC. Great for short group trips.",
        "features": [ "06 Seater", "Push-back Seats", "Music System", "Recliner Seats"],
        "pricing": {
            "local_8hrs_80km": 7000,
            "extra_km": 70,
            "extra_hr": 700,
            "outstation_km": 65,
            "min_km": 300,
            "driver_bata": 500
        }
    },
    {
        "id": "tempo-ac",
        "name": "Tempo Traveller AC",
        "category": "van",
        "seats": 12,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782894086/WhatsApp_Image_2026-07-01_at_1.51.04_PM_dgwszn.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894086/WhatsApp_Image_2026-07-01_at_1.51.04_PM_dgwszn.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894058/WhatsApp_Image_2026-07-01_at_1.50.06_PM_eowybx.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782893909/WhatsApp_Image_2026-07-01_at_1.47.10_PM_kt4seb.jpg"
        ],
        "description": "Air-conditioned Tempo Traveller for comfortable group travel. Ideal for pilgrimages and tours.",
        "features": ["Air Conditioned", "12 Seater", "Push-back Seats", "Luggage Carrier", "Curtains"],
        "pricing": {
            "local_8hrs_80km": 5000,
            "extra_km": 22,
            "extra_hr": 350,
            "outstation_km": 22,
            "min_km": 300,
            "driver_bata": 600
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 4500,
            "extra_km": 20,
            "extra_hr": 300,
            "outstation_km": 20,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "tt-luxury",
        "name": "TT 9 Seater Luxury",
        "category": "van",
        "seats": 9,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990202/vehicles/tt-luxury/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990202/vehicles/tt-luxury/img_001.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894980/WhatsApp_Image_2026-07-01_at_1.04.13_PM_1_rfipuu.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894975/WhatsApp_Image_2026-07-01_at_1.04.12_PM_vru4ao.jpg"
        ],
        "description": "Luxury 9-seater Tempo Traveller with premium interiors. Perfect for VIP group travel.",
        "features": ["Air Conditioned", "9 Seater", "Luxury Interior", "Sofa Seats", "LED TV", "Refrigerator"],
        "pricing": {
            "local_8hrs_80km": 6500,
            "extra_km": 30,
            "extra_hr": 500,
            "outstation_km": 30,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "urbania",
        "name": "Urbania",
        "category": "van",
        "seats": 16,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990203/vehicles/urbania/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990203/vehicles/urbania/img_001.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895123/WhatsApp_Image_2026-07-01_at_2.05.08_PM_e1bvtl.jpg"
        ],
        "description": "Force Urbania for medium group travel. Available in 9, 12, and 16 seater configurations.",
        "features": ["Air Conditioned", "Premium Interior", "Push-back Seats", "USB Charging"],
        "pricing": {
            "local_8hrs_80km": 8000,
            "extra_km": 40,
            "extra_hr": 500,
            "outstation_km": 36,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_12_seater": {
            "local_8hrs_80km": 8000,
            "extra_km": 45,
            "extra_hr": 500,
            "outstation_km": 45,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_9_seater": {
            "local_8hrs_80km": 7000,
            "extra_km": 35,
            "extra_hr": 450,
            "outstation_km": 34,
            "min_km": 300,
            "driver_bata": 700
        }
    },
    {
        "id": "bus-21",
        "name": "21 Seater Bus",
        "category": "bus",
        "seats": 21,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896624/WhatsApp_Image_2026-07-01_at_2.29.26_PM_1_qwkzaj.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.35_PM_aigfsc.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895733/WhatsApp_Image_2026-07-01_at_2.16.34_PM_f8ed1p.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.34_PM_1_at0qg7.jpg"
        ],
        "description": "Comfortable 21-seater mini bus for medium-sized groups. Great for corporate events.",
        "features": ["Air Conditioned", "21 Seater", "Push-back Seats", "Luggage Storage", "PA System"],
        "pricing": {
            "local_8hrs_80km": 7000,
            "extra_km": 34,
            "extra_hr": 550,
            "outstation_km": 34,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 6000,
            "extra_km": 30,
            "extra_hr": 500,
            "outstation_km": 30,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-25",
        "name": "25 Seater Bus",
        "category": "bus",
        "seats": 25,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896624/WhatsApp_Image_2026-07-01_at_2.29.26_PM_1_qwkzaj.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.35_PM_aigfsc.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895733/WhatsApp_Image_2026-07-01_at_2.16.34_PM_f8ed1p.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.34_PM_1_at0qg7.jpg"
        ],
        "description": "Spacious 25-seater bus ideal for group tours and corporate outings.",
        "features": ["Air Conditioned", "25 Seater", "Reclining Seats", "Overhead Storage", "Music System"],
        "pricing": {
            "local_8hrs_80km": 7500,
            "extra_km": 38,
            "extra_hr": 650,
            "outstation_km": 38,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 7000,
            "extra_km": 34,
            "extra_hr": 600,
            "outstation_km": 34,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-33",
        "name": "33 Seater Bus",
        "category": "bus",
        "seats": 33,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990187/vehicles/bus-33/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990187/vehicles/bus-33/img_001.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897465/WhatsApp_Image_2026-07-01_at_2.45.28_PM_uswnvc.jpg"
        ],
        "description": "Large 33-seater bus for big group travel. Comfortable seating for long journeys.",
        "features": ["Air Conditioned", "33 Seater", "Reclining Seats", "Entertainment System", "Restroom"],
        "pricing": {
            "local_8hrs_80km": 10000,
            "extra_km": 48,
            "extra_hr": 700,
            "outstation_km": 44,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 9500,
            "extra_km": 40,
            "extra_hr": 600,
            "outstation_km": 40,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-45",
        "name": "40/45 Seater Bus",
        "category": "bus",
        "seats": 45,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782897814/WhatsApp_Image_2026-07-01_at_2.50.59_PM_xhfebo.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897814/WhatsApp_Image_2026-07-01_at_2.50.59_PM_xhfebo.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897811/WhatsApp_Image_2026-07-01_at_2.51.00_PM_1_kao9tw.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897809/WhatsApp_Image_2026-07-01_at_2.51.00_PM_ixx9fr.jpg"
        ],
        "description": "Extra-large 45-seater bus for school trips, weddings and large group events.",
        "features": ["Air Conditioned", "45 Seater", "Reclining Seats", "GPS Tracking", "First Aid Kit"],
        "pricing": {
            "local_8hrs_80km": 13000,
            "extra_km": 55,
            "extra_hr": 800,
            "outstation_km": 55,
            "min_km": 300,
            "driver_bata": 1000
        }
    },
    {
        "id": "volvo-coach",
        "name": "Volvo Coach",
        "category": "coach",
        "seats": 45,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773998467/vehicles/volvo-coach/img_001.jpg",
        "description": "Premium Volvo Coach for luxury long-distance travel. Multi-axle with advanced suspension.",
        "features": ["Air Conditioned", "45 Seater", "Volvo Multi-Axle", "Individual Reading Lights", "Charging Points"],
        "pricing": {
            "local_8hrs_80km": 20000,
            "extra_km": 75,
            "extra_hr": 2000,
            "outstation_km": 75,
            "min_km": 400,
            "driver_bata": 1500
        }
    },
    {
        "id": "sleeper-coach",
        "name": "49 Seater",
        "category": "coach",
        "seats": 49,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782898756/ChatGPT_Image_Jul_1_2026_03_08_36_PM_czu9rk.png",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782898756/ChatGPT_Image_Jul_1_2026_03_08_36_PM_czu9rk.png"
        ],
        "description": "49 Seater Sleeper Coach for overnight long-distance travel. Individual berths for a restful journey.",
        "features": ["Air Conditioned", "49 Sleeper Berths", "Individual Curtains", "Blanket & Pillow", "USB Charging"],
        "pricing": {
            "local_8hrs_80km": 20000,
            "extra_km": 70,
            "extra_hr": 1100,
            "outstation_km": 65,
            "min_km": 300,
            "driver_bata": 1500
        }
    }
]
