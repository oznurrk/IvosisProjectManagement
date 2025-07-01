namespace IvosisProjectManagement.API.Models
{
    public class User
    {
        public int Id { get; set; }               // Primary Key
        public string? Name { get; set; }           // Kullanıcının adı
        public string? Email { get; set; }          // E-posta adresi
        public string? Password { get; set; }   // Şifre hash’i
        public string? Role { get; set; }           // Kullanıcı rolü (örn: Adm
    }
}