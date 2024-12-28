namespace WebApplication1
{
    public class Tasks
    {
        public string Id { get; set; } = Convert.ToString(new Random().Next());
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Priority { get; set; } = "";
        public bool IsCompleted { get; set; } = false;
    }
}
