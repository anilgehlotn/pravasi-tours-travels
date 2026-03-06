#!/usr/bin/env python3
"""
Backend API Testing Suite for Tours & Travel Booking System
Tests all API endpoints and functionality.
"""
import requests
import sys
import json
from datetime import datetime, timedelta
import time

class TravelBookingAPITester:
    def __init__(self, base_url="https://travel-calculator-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        print(f"🚗 Travel Booking API Testing")
        print(f"Base URL: {base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    → {details}")

    def test_root_endpoint(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Root API endpoint", True, f"Status: {response.status_code}, Response: {data}")
                return True
            else:
                self.log_test("Root API endpoint", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Root API endpoint", False, f"Error: {str(e)}")
            return False

    def test_get_vehicles(self):
        """Test GET /api/vehicles - should return all 15 vehicles"""
        try:
            response = requests.get(f"{self.base_url}/api/vehicles", timeout=10)
            if response.status_code == 200:
                vehicles = response.json()
                if len(vehicles) >= 15:
                    # Check structure of first vehicle
                    if vehicles:
                        v = vehicles[0]
                        required_fields = ['id', 'name', 'category', 'seats', 'ac', 'image', 'pricing']
                        missing_fields = [field for field in required_fields if field not in v]
                        if missing_fields:
                            self.log_test("GET /api/vehicles structure", False, f"Missing fields: {missing_fields}")
                            return False
                        
                        # Check pricing structure
                        pricing = v.get('pricing', {})
                        required_pricing = ['local_8hrs_80km', 'outstation_km', 'driver_bata']
                        missing_pricing = [field for field in required_pricing if field not in pricing]
                        if missing_pricing:
                            self.log_test("GET /api/vehicles pricing", False, f"Missing pricing fields: {missing_pricing}")
                            return False
                            
                    self.log_test("GET /api/vehicles", True, f"Returned {len(vehicles)} vehicles with correct structure")
                    return True
                else:
                    self.log_test("GET /api/vehicles", False, f"Expected 15 vehicles, got {len(vehicles)}")
                    return False
            else:
                self.log_test("GET /api/vehicles", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET /api/vehicles", False, f"Error: {str(e)}")
            return False

    def test_get_single_vehicle(self):
        """Test GET /api/vehicles/{vehicle_id} - test sedan vehicle"""
        try:
            response = requests.get(f"{self.base_url}/api/vehicles/sedan", timeout=10)
            if response.status_code == 200:
                vehicle = response.json()
                if vehicle.get('id') == 'sedan' and 'pricing' in vehicle:
                    self.log_test("GET /api/vehicles/sedan", True, f"Retrieved sedan vehicle with pricing")
                    return True
                else:
                    self.log_test("GET /api/vehicles/sedan", False, f"Invalid vehicle data structure")
                    return False
            else:
                self.log_test("GET /api/vehicles/sedan", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET /api/vehicles/sedan", False, f"Error: {str(e)}")
            return False

    def test_outstation_quotation(self):
        """Test POST /api/getQuotation with outstation trip"""
        try:
            travel_date = (datetime.now() + timedelta(days=2)).isoformat()
            return_date = (datetime.now() + timedelta(days=4)).isoformat()
            
            payload = {
                "vehicle_id": "sedan",
                "from_location": "Bangalore",
                "to_location": "Mysore",
                "travel_date": travel_date,
                "return_date": return_date,
                "travelers": 2,
                "trip_type": "outstation"
            }
            
            response = requests.post(f"{self.base_url}/api/getQuotation", json=payload, timeout=15)
            
            if response.status_code == 200:
                quote = response.json()
                required_fields = ['id', 'vehicle_id', 'total_price', 'distance_km', 'total_distance_km']
                missing_fields = [field for field in required_fields if field not in quote]
                
                if missing_fields:
                    self.log_test("POST /api/getQuotation (outstation)", False, f"Missing fields: {missing_fields}")
                    return False, None
                
                # Validate price calculation
                if quote.get('total_price', 0) > 0 and quote.get('distance_km', 0) > 0:
                    self.log_test("POST /api/getQuotation (outstation)", True, 
                                f"Quote ID: {quote['id']}, Price: ₹{quote['total_price']}, Distance: {quote['distance_km']}km")
                    return True, quote['id']
                else:
                    self.log_test("POST /api/getQuotation (outstation)", False, "Invalid price or distance calculation")
                    return False, None
            else:
                self.log_test("POST /api/getQuotation (outstation)", False, f"Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            self.log_test("POST /api/getQuotation (outstation)", False, f"Error: {str(e)}")
            return False, None

    def test_local_quotation(self):
        """Test POST /api/getQuotation with local trip"""
        try:
            travel_date = (datetime.now() + timedelta(days=1)).isoformat()
            
            payload = {
                "vehicle_id": "innova",
                "from_location": "Bangalore Airport",
                "to_location": "City Center",
                "travel_date": travel_date,
                "travelers": 4,
                "trip_type": "local"
            }
            
            response = requests.post(f"{self.base_url}/api/getQuotation", json=payload, timeout=15)
            
            if response.status_code == 200:
                quote = response.json()
                if quote.get('total_price', 0) > 0 and quote.get('trip_type') == 'local':
                    self.log_test("POST /api/getQuotation (local)", True, 
                                f"Quote ID: {quote['id']}, Price: ₹{quote['total_price']}")
                    return True, quote['id']
                else:
                    self.log_test("POST /api/getQuotation (local)", False, "Invalid local trip response")
                    return False, None
            else:
                self.log_test("POST /api/getQuotation (local)", False, f"Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            self.log_test("POST /api/getQuotation (local)", False, f"Error: {str(e)}")
            return False, None

    def test_get_quotation_by_id(self, quote_id):
        """Test GET /api/quotations/{quote_id}"""
        if not quote_id:
            self.log_test("GET /api/quotations/{id}", False, "No quote ID available from previous test")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/api/quotations/{quote_id}", timeout=10)
            if response.status_code == 200:
                quote = response.json()
                if quote.get('id') == quote_id:
                    self.log_test("GET /api/quotations/{id}", True, f"Retrieved quote {quote_id}")
                    return True
                else:
                    self.log_test("GET /api/quotations/{id}", False, "Quote ID mismatch in response")
                    return False
            else:
                self.log_test("GET /api/quotations/{id}", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET /api/quotations/{id}", False, f"Error: {str(e)}")
            return False

    def test_confirm_booking(self, quote_id):
        """Test POST /api/bookings"""
        if not quote_id:
            self.log_test("POST /api/bookings", False, "No quote ID available for booking")
            return False
            
        try:
            response = requests.post(f"{self.base_url}/api/bookings?quote_id={quote_id}", timeout=10)
            if response.status_code == 200:
                booking = response.json()
                if booking.get('message') and booking.get('data'):
                    self.log_test("POST /api/bookings", True, f"Booking confirmed for quote {quote_id}")
                    return True
                else:
                    self.log_test("POST /api/bookings", False, "Invalid booking response structure")
                    return False
            else:
                self.log_test("POST /api/bookings", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("POST /api/bookings", False, f"Error: {str(e)}")
            return False

    def test_callback_request(self):
        """Test POST /api/callback"""
        try:
            payload = {
                "name": "John Doe",
                "phone": "9876543210", 
                "email": "john@example.com",
                "message": "Interested in sedan booking for next week",
                "vehicle_id": "sedan"
            }
            
            response = requests.post(f"{self.base_url}/api/callback", json=payload, timeout=10)
            if response.status_code == 200:
                callback = response.json()
                if callback.get('message') and callback.get('data'):
                    self.log_test("POST /api/callback", True, "Callback request submitted successfully")
                    return True
                else:
                    self.log_test("POST /api/callback", False, "Invalid callback response structure")
                    return False
            else:
                self.log_test("POST /api/callback", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("POST /api/callback", False, f"Error: {str(e)}")
            return False

    def test_invalid_vehicle_quotation(self):
        """Test quotation with invalid vehicle ID"""
        try:
            travel_date = (datetime.now() + timedelta(days=1)).isoformat()
            
            payload = {
                "vehicle_id": "invalid_vehicle",
                "from_location": "Bangalore",
                "to_location": "Mysore",
                "travel_date": travel_date,
                "travelers": 2,
                "trip_type": "outstation"
            }
            
            response = requests.post(f"{self.base_url}/api/getQuotation", json=payload, timeout=10)
            if response.status_code == 404:
                self.log_test("Invalid vehicle quotation error handling", True, "Correctly returned 404 for invalid vehicle")
                return True
            else:
                self.log_test("Invalid vehicle quotation error handling", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid vehicle quotation error handling", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🔍 Starting Backend API Tests...")
        
        # Core API tests
        self.test_root_endpoint()
        time.sleep(0.5)
        
        self.test_get_vehicles()
        time.sleep(0.5)
        
        self.test_get_single_vehicle()
        time.sleep(0.5)
        
        # Quotation tests
        outstation_success, outstation_quote_id = self.test_outstation_quotation()
        time.sleep(1)  # Allow time for database operations
        
        local_success, local_quote_id = self.test_local_quotation()
        time.sleep(1)
        
        # Test quotation retrieval
        if outstation_quote_id:
            self.test_get_quotation_by_id(outstation_quote_id)
            time.sleep(0.5)
            
            # Test booking confirmation
            self.test_confirm_booking(outstation_quote_id)
            time.sleep(0.5)
        
        # Callback test
        self.test_callback_request()
        time.sleep(0.5)
        
        # Error handling test
        self.test_invalid_vehicle_quotation()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Backend Test Summary:")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        print("=" * 60)
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = TravelBookingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())