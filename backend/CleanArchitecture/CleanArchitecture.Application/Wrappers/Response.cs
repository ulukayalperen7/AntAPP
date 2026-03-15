using System.Collections.Generic;

namespace CleanArchitecture.Core.Wrappers
{
    /// <summary>
    /// This is a "Standard Package" for our API responses.
    /// Instead of just sending raw data, we wrap it in this class so the mobile app
    /// always knows if the request was successful, what the message is, and if there are errors.
    /// </summary>
    public class Response<T>
    {
        public Response()
        {
        }

        // Use this when everything goes well.
        public Response(T data, string message = null)
        {
            Succeeded = true;
            Message = message;
            Data = data;
        }

        // Use this when there is an error (e.g., "Category not found").
        public Response(string message)
        {
            Succeeded = false;
            Message = message;
        }

        // Did the request work?
        public bool Succeeded { get; set; }

        // A friendly message for the user (e.g., "Category deleted successfully").
        public string Message { get; set; }

        // If something went wrong, we list the specific errors here.
        public List<string> Errors { get; set; }

        // The actual data we are sending back (e.g., a list of categories).
        public T Data { get; set; }
    }
}
