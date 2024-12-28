using Microsoft.EntityFrameworkCore;
using WebApplication1;

var builder = WebApplication.CreateBuilder();

// получаем строку подключения из файла конфигурации
string connection = "Server=(localdb)\\mssqllocaldb;Database=aspnet-53bc9b9d-9d6a-45d4-8429-2a2761773502;Trusted_Connection=True;MultipleActiveResultSets=true";

// добавляем контекст ApplicationContext в качестве сервиса в приложение
builder.Services.AddDbContext<ApplicationContext>(options => options.UseSqlServer(connection));
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/tasks", async (ApplicationContext db) =>
{

    var sortedTasks = await db.Tasks.ToListAsync();
    return sortedTasks.OrderBy(task => task.Priority);
});

app.MapGet("/api/tasks/{Id}", async (string Id, ApplicationContext db) =>
{
    // получаем задачу по id
    Tasks? task = await db.Tasks.FirstOrDefaultAsync(u => u.Id == Id);

    // если не найден, отправляем статусный код и сообщение об ошибке
    if (task == null) return Results.NotFound(new { message = "Задача не найдена!" });

    // если пользователь найден, отправляем его
    return Results.Json(task);
});

app.MapDelete("/api/tasks/{Id}", async (string Id, ApplicationContext db) =>
{
    // получаем пользователя по id
    Tasks? task = await db.Tasks.FirstOrDefaultAsync(u => u.Id == Id);

    // если не найден, отправляем статусный код и сообщение об ошибке
    if (task == null) return Results.NotFound(new { message = "Задача не найдена!" });

    // если пользователь найден, удаляем его
    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.Json(task);
});

app.MapPost("/api/tasks", async (Tasks task, ApplicationContext db) =>
{
    // добавляем пользователя в массив
    await db.Tasks.AddAsync(task);
    await db.SaveChangesAsync();
    return task;
});

app.MapPut("/api/tasks/{Id}", async (Tasks taskData, ApplicationContext db) =>
{
    // получаем пользователя по id
    var task = await db.Tasks.FirstOrDefaultAsync(u => u.Id == taskData.Id);

    // если не найден, отправляем статусный код и сообщение об ошибке
    if (task == null) return Results.NotFound(new { message = "Задача не найдена" });

    // если пользователь найден, изменяем его данные и отправляем обратно клиенту
    task.Name = taskData.Name;
    task.Description = taskData.Description;
    task.Priority = taskData.Priority;
    task.IsCompleted = taskData.IsCompleted;
    await db.SaveChangesAsync();
    return Results.Json(task);
});
app.MapPatch("/api/tasks/{id}/complete", async (string id, ApplicationContext db) =>
{
    var task = await db.Tasks.FirstOrDefaultAsync(u => u.Id == id);

    if (task == null)
        return Results.NotFound(new { message = "Задача не найдена!" });

    // Если задача уже завершена, возвращаем ее без изменений
    if (task.IsCompleted)
        return Results.Json(task);

    // Устанавливаем статус завершенности
    task.IsCompleted = true;
    await db.SaveChangesAsync();
    return Results.Json(new { success = true, task = task });
});

app.Run();
