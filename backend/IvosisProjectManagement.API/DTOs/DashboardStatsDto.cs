public class DashboardStatsDto
    {
        public int TotalItems { get; set; }
        public int LowStockItems { get; set; }
        public int CriticalStockItems { get; set; }
        public decimal TotalStockValue { get; set; }
        public decimal MonthlyTurnover { get; set; }
        public int ActiveAlerts { get; set; }
        public int TotalLocations { get; set; }
        public int TotalCategories { get; set; }
    }