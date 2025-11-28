using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRIS_CheckWise_ATMS_
{
    public class db_connection
    {
        // Connection string
        private string connectionString = "server=localhost;database=cfarbemco_db;uid=root;pwd=;";

        // Public property to get connection
        public MySqlConnection Connection { get; private set; }

        // Constructor to initialize the connection
        public db_connection()
        {
            Connection = new MySqlConnection(connectionString);
        }

        // Method to open the connection
        public void OpenConnection()
        {
            try
            {
                if (Connection.State == System.Data.ConnectionState.Closed)
                    Connection.Open();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error opening connection: " + ex.Message);
            }
        }

        // Method to close the connection
        public void CloseConnection()
        {
            try
            {
                if (Connection.State == System.Data.ConnectionState.Open)
                    Connection.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error closing connection: " + ex.Message);
            }
        }
    }
}
