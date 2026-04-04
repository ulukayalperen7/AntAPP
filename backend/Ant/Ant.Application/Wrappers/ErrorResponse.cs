using System.Collections.Generic;

namespace Ant.Application.Wrappers
{
    public class ErrorResponse
    {
        public string Message { get; set; }
        public List<string> Errors { get; set; }
    }
}
