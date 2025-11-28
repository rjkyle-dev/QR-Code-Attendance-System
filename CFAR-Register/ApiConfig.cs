using System;
using System.Configuration;

namespace HRIS_CheckWise_ATMS_
{
    public static class ApiConfig
    {
        private static string _apiBaseUrl;

        public static string ApiBaseUrl
        {
            get
            {
                if (string.IsNullOrEmpty(_apiBaseUrl))
                {
                    // Try to get from app.config first
                    _apiBaseUrl = ConfigurationManager.AppSettings["ApiBaseUrl"];

                    // Default fallback
                    if (string.IsNullOrEmpty(_apiBaseUrl))
                    {
                        _apiBaseUrl = "http://localhost:8000";
                    }
                }
                return _apiBaseUrl;
            }
            set
            {
                _apiBaseUrl = value;
                // Optionally save to app.config
                SaveToConfig(value);
            }
        }

        private static void SaveToConfig(string value)
        {
            try
            {
                var config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
                if (config.AppSettings.Settings["ApiBaseUrl"] == null)
                {
                    config.AppSettings.Settings.Add("ApiBaseUrl", value);
                }
                else
                {
                    config.AppSettings.Settings["ApiBaseUrl"].Value = value;
                }
                config.Save(ConfigurationSaveMode.Modified);
                ConfigurationManager.RefreshSection("appSettings");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving API config: {ex.Message}");
            }
        }

        public static bool TestApiConnection()
        {
            try
            {
                using (var client = new System.Net.Http.HttpClient())
                {
                    client.Timeout = TimeSpan.FromSeconds(5);
                    var response = client.GetAsync($"{ApiBaseUrl}/api/attendance-sessions").Result;
                    return response.IsSuccessStatusCode;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
