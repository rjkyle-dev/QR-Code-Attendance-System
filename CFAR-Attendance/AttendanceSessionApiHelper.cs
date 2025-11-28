using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;


namespace HRIS_CheckWise_ATMS_
{
    public class AttendanceSession
    {
        public int id { get; set; }
        public string session_name { get; set; }
        public string time_in_start { get; set; }
        public string time_in_end { get; set; }
        public string time_out_start { get; set; }
        public string time_out_end { get; set; }
    }

    public static class AttendanceSessionApiHelper
    {
        private static List<AttendanceSession> _cachedSessions = null;
        private static DateTime _lastCacheUpdate = DateTime.MinValue;
        private static readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5); // Cache for 5 minutes

        public static async Task<List<AttendanceSession>> FetchSessionTimesAsync(string apiBaseUrl)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromSeconds(10); // Add timeout
                    var response = await client.GetAsync($"{apiBaseUrl}/api/attendance-sessions");
                    response.EnsureSuccessStatusCode();
                    var json = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<List<AttendanceSession>>(json);
                    
                    // Ensure we never return null
                    return result ?? new List<AttendanceSession>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching session times: {ex.Message}");
                return new List<AttendanceSession>(); // Return empty list instead of null
            }
        }

        public static async Task<List<AttendanceSession>> GetCachedSessionsAsync(string apiBaseUrl)
        {
            // Check if cache is valid
            if (_cachedSessions != null && DateTime.Now - _lastCacheUpdate < _cacheExpiry)
            {
                return _cachedSessions;
            }

            // Fetch fresh data
            try
            {
                _cachedSessions = await FetchSessionTimesAsync(apiBaseUrl);
                _lastCacheUpdate = DateTime.Now;
                
                // Ensure we never return null
                if (_cachedSessions == null)
                {
                    _cachedSessions = new List<AttendanceSession>();
                }
                
                return _cachedSessions;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching sessions: {ex.Message}");
                // Return empty list instead of null
                _cachedSessions = new List<AttendanceSession>();
                _lastCacheUpdate = DateTime.Now;
                return _cachedSessions;
            }
        }

        public static async Task<string> DetermineSessionAsync(DateTime timeIn, string apiBaseUrl)
        {
            try
            {
                var sessions = await GetCachedSessionsAsync(apiBaseUrl);
                
                // Add null check for sessions
                if (sessions == null || sessions.Count == 0)
                {
                    return DetermineSessionFallback(timeIn);
                }

                foreach (var session in sessions)
                {
                    if (TimeSpan.TryParse(session.time_in_start, out TimeSpan timeInStart) &&
                        TimeSpan.TryParse(session.time_in_end, out TimeSpan timeInEnd))
                    {
                        TimeSpan currentTime = timeIn.TimeOfDay;

                        // Check if current time is within the time-in range
                        if (IsTimeInRange(currentTime, timeInStart, timeInEnd))
                        {
                            return session.session_name;
                        }

                        // Check if time-out is configured and current time is within time-out range
                        if (!string.IsNullOrEmpty(session.time_out_start) && 
                            !string.IsNullOrEmpty(session.time_out_end) &&
                            TimeSpan.TryParse(session.time_out_start, out TimeSpan timeOutStart) &&
                            TimeSpan.TryParse(session.time_out_end, out TimeSpan timeOutEnd))
                        {
                            if (IsTimeInRange(currentTime, timeOutStart, timeOutEnd))
                            {
                                return session.session_name;
                            }
                        }
                    }
                }

                // Fallback to default logic if no API data
                return DetermineSessionFallback(timeIn);
            }
            catch (Exception ex)
            {
                // Log error and fallback to default logic
                Console.WriteLine($"Error determining session from API: {ex.Message}");
                return DetermineSessionFallback(timeIn);
            }
        }

        public static async Task<bool> IsInTimeOutPeriodAsync(DateTime currentTime, string sessionName, string apiBaseUrl)
        {
            try
            {
                var sessions = await GetCachedSessionsAsync(apiBaseUrl);
                
                // Add null check for sessions
                if (sessions == null || sessions.Count == 0)
                {
                    return false;
                }
                
                var session = sessions.Find(s => s.session_name.Equals(sessionName, StringComparison.OrdinalIgnoreCase));

                if (session != null && 
                    !string.IsNullOrEmpty(session.time_out_start) && 
                    !string.IsNullOrEmpty(session.time_out_end) &&
                    TimeSpan.TryParse(session.time_out_start, out TimeSpan timeOutStart) &&
                    TimeSpan.TryParse(session.time_out_end, out TimeSpan timeOutEnd))
                {
                    TimeSpan currentTimeSpan = currentTime.TimeOfDay;
                    return IsTimeInRange(currentTimeSpan, timeOutStart, timeOutEnd);
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking time-out period: {ex.Message}");
                return false;
            }
        }

        public static async Task<bool> IsTimeOutConfiguredAsync(string sessionName, string apiBaseUrl)
        {
            try
            {
                var sessions = await GetCachedSessionsAsync(apiBaseUrl);
                
                // Add null check for sessions
                if (sessions == null || sessions.Count == 0)
                {
                    return false;
                }
                
                var session = sessions.Find(s => s.session_name.Equals(sessionName, StringComparison.OrdinalIgnoreCase));

                if (session != null)
                {
                    return !string.IsNullOrEmpty(session.time_out_start) && 
                           !string.IsNullOrEmpty(session.time_out_end);
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking time-out configuration: {ex.Message}");
                return false;
            }
        }

        private static bool IsTimeInRange(TimeSpan currentTime, TimeSpan startTime, TimeSpan endTime)
        {
            // Handle ranges that cross midnight
            if (startTime > endTime)
            {
                return currentTime >= startTime || currentTime <= endTime;
            }
            else
            {
                return currentTime >= startTime && currentTime <= endTime;
            }
        }

        private static string DetermineSessionFallback(DateTime timeIn)
        {
            // Your original fallback logic
            int hour = timeIn.Hour;
            if (hour >= 6 && hour < 12)
                return "Morning";
            else if (hour >= 12 && hour < 18)
                return "Afternoon";
            else
                return "Night";
        }

        public static async Task<bool> IsLateAsync(DateTime timeIn, string sessionName, string apiBaseUrl)
        {
            try
            {
                var sessions = await GetCachedSessionsAsync(apiBaseUrl);
                
                // Add null check for sessions
                if (sessions == null || sessions.Count == 0)
                {
                    return false;
                }
                
                var session = sessions.Find(s => s.session_name.Equals(sessionName, StringComparison.OrdinalIgnoreCase));

                if (session != null)
                {
                    if (TimeSpan.TryParse(session.time_in_start, out TimeSpan timeInStart) &&
                        TimeSpan.TryParse(session.time_in_end, out TimeSpan timeInEnd))
                    {
                        TimeSpan currentTime = timeIn.TimeOfDay;

                        // If current time is after the time-in end time, consider it late
                        if (timeInStart > timeInEnd)
                        {
                            // Range crosses midnight
                            if (currentTime > timeInEnd && currentTime < timeInStart)
                            {
                                return true; // Late
                            }
                        }
                        else
                        {
                            // Normal range within same day
                            if (currentTime > timeInEnd)
                            {
                                return true; // Late
                            }
                        }
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking late status: {ex.Message}");
                return false;
            }
        }

        public static async Task<string> GetSessionStatusAsync(DateTime timeIn, string apiBaseUrl)
        {
            var sessionName = await DetermineSessionAsync(timeIn, apiBaseUrl);
            var isLate = await IsLateAsync(timeIn, sessionName, apiBaseUrl);

            if (isLate)
                return "Late";
            else
                return "On Time";
        }

        public static async Task<bool> IsAttendanceAllowedAsync(DateTime currentTime, string apiBaseUrl)
        {
            try
            {
                var sessions = await GetCachedSessionsAsync(apiBaseUrl);
                TimeSpan currentTimeSpan = currentTime.TimeOfDay;
                
                // Add null check for sessions
                if (sessions == null || sessions.Count == 0)
                {
                    return true; // Allow attendance if no session data available (fallback)
                }

                foreach (var session in sessions)
                {
                    if (TimeSpan.TryParse(session.time_in_start, out TimeSpan timeInStart) &&
                        TimeSpan.TryParse(session.time_in_end, out TimeSpan timeInEnd))
                    {
                        // Check if current time is within time-in range
                        if (IsTimeInRange(currentTimeSpan, timeInStart, timeInEnd))
                        {
                            return true; // Attendance allowed during time-in period
                        }

                        // Check if time-out is configured and current time is within time-out range
                        if (!string.IsNullOrEmpty(session.time_out_start) && 
                            !string.IsNullOrEmpty(session.time_out_end) &&
                            TimeSpan.TryParse(session.time_out_start, out TimeSpan timeOutStart) &&
                            TimeSpan.TryParse(session.time_out_end, out TimeSpan timeOutEnd))
                        {
                            if (IsTimeInRange(currentTimeSpan, timeOutStart, timeOutEnd))
                            {
                                return true; // Attendance allowed during time-out period
                            }
                        }
                    }
                }

                return false; // No active session found
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking attendance allowance: {ex.Message}");
                return true; // Allow attendance if API fails (fallback)
            }
        }

        public static async Task<string> GetCurrentSessionNameAsync(DateTime currentTime, string apiBaseUrl)
        {
            try
            {
                var sessions = await GetCachedSessionsAsync(apiBaseUrl);
                TimeSpan currentTimeSpan = currentTime.TimeOfDay;
                
                // Add null check for sessions
                if (sessions == null || sessions.Count == 0)
                {
                    return "Wait for the next set time";
                }

                foreach (var session in sessions)
                {
                    if (TimeSpan.TryParse(session.time_in_start, out TimeSpan timeInStart) &&
                        TimeSpan.TryParse(session.time_in_end, out TimeSpan timeInEnd))
                    {
                        // Check if current time is within time-in range
                        if (IsTimeInRange(currentTimeSpan, timeInStart, timeInEnd))
                        {
                            return session.session_name + " (Time-In)";
                            

                        }

                        // Check if time-out is configured and current time is within time-out range
                        if (!string.IsNullOrEmpty(session.time_out_start) && 
                            !string.IsNullOrEmpty(session.time_out_end) &&
                            TimeSpan.TryParse(session.time_out_start, out TimeSpan timeOutStart) &&
                            TimeSpan.TryParse(session.time_out_end, out TimeSpan timeOutEnd))
                        {
                            if (IsTimeInRange(currentTimeSpan, timeOutStart, timeOutEnd))
                            {
                                return session.session_name + " (Time-Out)";
                            }
                        }
                    }
                }

                return "Wait for the next set time";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting current session: {ex.Message}");
                return "Unknown";
            }
        }
    }
}
