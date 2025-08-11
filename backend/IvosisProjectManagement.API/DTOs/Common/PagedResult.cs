namespace IvosisProjectManagement.API.DTOs.Common
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
        public int StartItem => (Page - 1) * PageSize + 1;
        public int EndItem => Math.Min(Page * PageSize, TotalCount);

        public PagedResult()
        {
        }

        public PagedResult(List<T> items, int totalCount, int page, int pageSize)
        {
            Items = items ?? new List<T>();
            TotalCount = totalCount;
            Page = page;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        }

        public static PagedResult<T> Create(List<T> items, int totalCount, int page, int pageSize)
        {
            return new PagedResult<T>(items, totalCount, page, pageSize);
        }

        public static PagedResult<T> Empty(int page = 1, int pageSize = 10)
        {
            return new PagedResult<T>(new List<T>(), 0, page, pageSize);
        }
    }
}