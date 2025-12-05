#!/usr/bin/env python3
"""
MedReserve AI - Performance Testing Script
Tests API performance under various load conditions
"""

import asyncio
import aiohttp
import time
import json
import statistics
from typing import List, Dict, Any
import argparse

class PerformanceTester:
    def __init__(self, base_url: str = "http://localhost:8080/api"):
        self.base_url = base_url
        self.session = None
        self.auth_token = None
        
    async def setup_session(self):
        """Setup HTTP session and authenticate"""
        self.session = aiohttp.ClientSession()
        
        # Login to get auth token
        login_data = {
            "email": "patient@medreserve.com",
            "password": "password123"
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("token")
                    print(f"✓ Authentication successful")
                else:
                    print(f"✗ Authentication failed: {response.status}")
        except Exception as e:
            print(f"✗ Authentication error: {e}")
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    def get_headers(self, authenticated: bool = False) -> Dict[str, str]:
        """Get request headers"""
        headers = {"Content-Type": "application/json"}
        if authenticated and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers
    
    async def make_request(self, method: str, endpoint: str, 
                          data: Dict = None, authenticated: bool = False) -> Dict[str, Any]:
        """Make a single HTTP request and measure performance"""
        url = f"{self.base_url}{endpoint}"
        headers = self.get_headers(authenticated)
        
        start_time = time.time()
        
        try:
            async with self.session.request(
                method, url, json=data, headers=headers
            ) as response:
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # Convert to ms
                
                return {
                    "status": response.status,
                    "response_time": response_time,
                    "success": 200 <= response.status < 300,
                    "error": None
                }
        except Exception as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            return {
                "status": 0,
                "response_time": response_time,
                "success": False,
                "error": str(e)
            }
    
    async def load_test(self, method: str, endpoint: str, 
                       concurrent_users: int, requests_per_user: int,
                       data: Dict = None, authenticated: bool = False) -> Dict[str, Any]:
        """Perform load testing with multiple concurrent users"""
        
        print(f"\n🔄 Load Testing: {method} {endpoint}")
        print(f"   Concurrent Users: {concurrent_users}")
        print(f"   Requests per User: {requests_per_user}")
        print(f"   Total Requests: {concurrent_users * requests_per_user}")
        
        async def user_requests():
            """Simulate a single user making multiple requests"""
            results = []
            for _ in range(requests_per_user):
                result = await self.make_request(method, endpoint, data, authenticated)
                results.append(result)
            return results
        
        # Start load test
        start_time = time.time()
        
        # Create tasks for concurrent users
        tasks = [user_requests() for _ in range(concurrent_users)]
        
        # Execute all tasks concurrently
        user_results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Flatten results
        all_results = []
        for user_result in user_results:
            all_results.extend(user_result)
        
        # Calculate statistics
        response_times = [r["response_time"] for r in all_results]
        successful_requests = [r for r in all_results if r["success"]]
        failed_requests = [r for r in all_results if not r["success"]]
        
        stats = {
            "total_requests": len(all_results),
            "successful_requests": len(successful_requests),
            "failed_requests": len(failed_requests),
            "success_rate": len(successful_requests) / len(all_results) * 100,
            "total_duration": total_duration,
            "requests_per_second": len(all_results) / total_duration,
            "avg_response_time": statistics.mean(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "median_response_time": statistics.median(response_times),
            "p95_response_time": self.percentile(response_times, 95),
            "p99_response_time": self.percentile(response_times, 99)
        }
        
        return stats
    
    def percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile of a dataset"""
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def print_stats(self, stats: Dict[str, Any], test_name: str):
        """Print performance statistics"""
        print(f"\n📊 {test_name} Results:")
        print(f"   Total Requests: {stats['total_requests']}")
        print(f"   Successful: {stats['successful_requests']} ({stats['success_rate']:.1f}%)")
        print(f"   Failed: {stats['failed_requests']}")
        print(f"   Duration: {stats['total_duration']:.2f}s")
        print(f"   Requests/sec: {stats['requests_per_second']:.2f}")
        print(f"   Avg Response Time: {stats['avg_response_time']:.2f}ms")
        print(f"   Min Response Time: {stats['min_response_time']:.2f}ms")
        print(f"   Max Response Time: {stats['max_response_time']:.2f}ms")
        print(f"   Median Response Time: {stats['median_response_time']:.2f}ms")
        print(f"   95th Percentile: {stats['p95_response_time']:.2f}ms")
        print(f"   99th Percentile: {stats['p99_response_time']:.2f}ms")
    
    async def run_performance_tests(self):
        """Run comprehensive performance tests"""
        
        print("🚀 Starting MedReserve AI Performance Tests")
        print("=" * 50)
        
        await self.setup_session()
        
        if not self.auth_token:
            print("❌ Cannot proceed without authentication")
            return
        
        # Test scenarios
        test_scenarios = [
            {
                "name": "Health Check - Light Load",
                "method": "GET",
                "endpoint": "/actuator/health",
                "concurrent_users": 5,
                "requests_per_user": 10,
                "authenticated": False
            },
            {
                "name": "Get Doctors - Medium Load",
                "method": "GET",
                "endpoint": "/doctors",
                "concurrent_users": 10,
                "requests_per_user": 20,
                "authenticated": False
            },
            {
                "name": "User Profile - Heavy Load",
                "method": "GET",
                "endpoint": "/users/profile",
                "concurrent_users": 20,
                "requests_per_user": 25,
                "authenticated": True
            },
            {
                "name": "Create Appointment - Stress Test",
                "method": "POST",
                "endpoint": "/appointments",
                "concurrent_users": 15,
                "requests_per_user": 10,
                "data": {
                    "doctorId": 1,
                    "appointmentDateTime": "2025-07-26T10:00:00",
                    "appointmentType": "ONLINE",
                    "chiefComplaint": "Performance test",
                    "symptoms": "Load testing symptoms"
                },
                "authenticated": True
            },
            {
                "name": "AI Symptom Analysis - AI Load Test",
                "method": "POST",
                "endpoint": "/ai/symptom-analysis",
                "concurrent_users": 8,
                "requests_per_user": 5,
                "data": {
                    "symptoms": "chest pain, shortness of breath",
                    "age": 35,
                    "gender": "MALE"
                },
                "authenticated": True
            }
        ]
        
        all_results = []
        
        for scenario in test_scenarios:
            try:
                stats = await self.load_test(
                    method=scenario["method"],
                    endpoint=scenario["endpoint"],
                    concurrent_users=scenario["concurrent_users"],
                    requests_per_user=scenario["requests_per_user"],
                    data=scenario.get("data"),
                    authenticated=scenario.get("authenticated", False)
                )
                
                self.print_stats(stats, scenario["name"])
                all_results.append({
                    "scenario": scenario["name"],
                    "stats": stats
                })
                
                # Wait between tests
                await asyncio.sleep(2)
                
            except Exception as e:
                print(f"❌ Error in {scenario['name']}: {e}")
        
        # Overall summary
        self.print_overall_summary(all_results)
        
        await self.cleanup_session()
    
    def print_overall_summary(self, results: List[Dict]):
        """Print overall performance summary"""
        print("\n" + "=" * 50)
        print("📈 OVERALL PERFORMANCE SUMMARY")
        print("=" * 50)
        
        total_requests = sum(r["stats"]["total_requests"] for r in results)
        total_successful = sum(r["stats"]["successful_requests"] for r in results)
        overall_success_rate = (total_successful / total_requests * 100) if total_requests > 0 else 0
        
        avg_rps = statistics.mean([r["stats"]["requests_per_second"] for r in results])
        avg_response_time = statistics.mean([r["stats"]["avg_response_time"] for r in results])
        
        print(f"Total Requests Tested: {total_requests}")
        print(f"Overall Success Rate: {overall_success_rate:.1f}%")
        print(f"Average RPS: {avg_rps:.2f}")
        print(f"Average Response Time: {avg_response_time:.2f}ms")
        
        # Performance grades
        if overall_success_rate >= 99 and avg_response_time <= 200:
            grade = "🟢 EXCELLENT"
        elif overall_success_rate >= 95 and avg_response_time <= 500:
            grade = "🟡 GOOD"
        elif overall_success_rate >= 90 and avg_response_time <= 1000:
            grade = "🟠 FAIR"
        else:
            grade = "🔴 NEEDS IMPROVEMENT"
        
        print(f"\nPerformance Grade: {grade}")

async def main():
    parser = argparse.ArgumentParser(description="MedReserve AI Performance Testing")
    parser.add_argument("--url", default="http://localhost:8080/api", 
                       help="Base URL for API testing")
    
    args = parser.parse_args()
    
    tester = PerformanceTester(args.url)
    await tester.run_performance_tests()

if __name__ == "__main__":
    asyncio.run(main())
