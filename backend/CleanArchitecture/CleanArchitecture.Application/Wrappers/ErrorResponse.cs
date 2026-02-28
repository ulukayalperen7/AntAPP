using System.Collections.Generic;

namespace CleanArchitecture.Core.Wrappers
{
    public class ErrorResponse
    {
        public string Message { get; set; }
        public List<string> Errors { get; set; }
    }
}
