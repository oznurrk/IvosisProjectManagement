namespace IvosisProjectManagement.API.DTOs.Common
{
    public class Result<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }

        public static Result<T> SuccessResult(T data, string? message = null)
        {
            return new Result<T> { Success = true, Data = data, Message = message };
        }

        // Bu metodu buraya ekle
        public static Result<T> Failure(string message, T? data = default)
        {
            return new Result<T> { Success = false, Message = message, Data = data };
        }
    }
}
