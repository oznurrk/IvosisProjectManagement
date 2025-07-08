               ┌──────────────┐
               │  Client (UI) │
               └──────┬───────┘
                      │
           sends DTO  ▼
              ┌────────────────────┐
              │   Controller       │
              │ (UserCreateDto)    │
              └──────┬─────────────┘
                     │ uses
                     ▼
            ┌────────────────┐
            │   AutoMapper   │
            └──────┬─────────┘
                   ▼
              ┌─────────┐
              │ Model   │
              │ (User)  │
              └────┬────┘
                   ▼
             ┌────────────┐
             │ Service    │
             │ (EF Core)  │
             └────────────┘


Branch Kullanımı:
Geliştirme frontend veya backend branch'lerinde yapılır.

------------Diğer branch (örneğin frontend) main ile güncellenmek istenirse: -İşe başlamadan 
git checkout main
git pull origin main 

git checkout frontend
git pull origin frontend
git merge main
git push origin frontend

------------ (Kodlarını yaz/düzenle)
-------------İş tamamlanınca:

git add .
git commit -m "Backend: X özelliği eklendi"
git push origin backend

------------Sonra main'e geçilip:

git checkout main
git pull origin main
git merge backend
git push origin main


------------ Build ve Yayınlama
------Backend:
cd backend/IvosisProjectManagement.API
dotnet build
dotnet run

------Frontend:
cd frontend
npm install
npm start